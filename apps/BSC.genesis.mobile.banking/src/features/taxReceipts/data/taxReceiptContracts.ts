import {
  comoLista,
  comoObjeto,
  decimal,
  leerResult,
  texto,
  textoOpcional,
} from '../../../core/network/envelopes';

/**
 * Comprobantes fiscales (NCF) emitidos sobre las cuentas del cliente.
 *
 * Portado de `tax_receipt_repository.dart`. Los tres endpoints responden con el
 * sobre `Result<T>`, y el detalle del NCF y el del movimiento son dos llamadas
 * distintas: la hoja pide las dos y dibuja lo que llegue.
 */

/** Un comprobante de la lista. */
export interface Comprobante {
  ncf: string;
  cuenta: string;
  /** Tal como lo manda el core, sin interpretar. */
  fecha: string;
  /** ISO numérico como texto: `214` o `840`. */
  moneda: string;
  monto: number;
  descripcion: string | null;
  operacion: string | null;
}

/** Qué cubre el comprobante. */
export interface DetalleDeComprobante {
  ncf: string;
  numero: string;
  descripcion: string;
  cuenta: string;
  tipoDeCuenta: string;
  moneda: string;
  monto: number;
  fechaFin: string | null;
}

/** El movimiento que lo produjo. */
export interface MovimientoDelComprobante {
  secuencia: string;
  operacion: string;
  descripcion: string;
  fecha: string;
  tipo: string;
  monto: number;
  referencia: string | null;
  impuesto: string | null;
}

/**
 * El símbolo de la moneda del comprobante.
 *
 * El core la manda como texto, no como número, y solo distingue dólar de todo
 * lo demás. Se conserva ese criterio del original en vez de «mejorarlo»: el
 * euro no se emite en comprobantes de este banco.
 */
export function simboloDelComprobante(moneda: string): string {
  return moneda === '840' ? 'US$' : 'RD$';
}

/**
 * Si el movimiento acreditó en la cuenta.
 *
 * El core codifica la operación con una letra inicial —`C` de crédito— y no con
 * un campo propio.
 */
export function esCredito(movimiento: MovimientoDelComprobante): boolean {
  return movimiento.operacion.toUpperCase().startsWith('C');
}

/** La suma de los comprobantes, que la cabecera enseña junto al conteo. */
export function totalDeComprobantes(comprobantes: Comprobante[]): number {
  return comprobantes.reduce((suma, uno) => suma + uno.monto, 0);
}

// ─── Lectura ────────────────────────────────────────────────────────────────

export function parseComprobantes(cuerpo: unknown): Comprobante[] {
  return comoLista(leerResult(cuerpo)).map(fila => ({
    ncf: texto(fila, 'Ncf', 'ncf'),
    cuenta: texto(fila, 'Account', 'account'),
    fecha: texto(fila, 'Date', 'date'),
    // El core omite la moneda en los comprobantes en pesos; 214 es el peso.
    moneda: textoOpcional(fila, 'Currency', 'currency') ?? '214',
    monto: decimal(fila, 'Amount', 'amount') ?? 0,
    descripcion: textoOpcional(fila, 'Description', 'description') ?? null,
    operacion: textoOpcional(fila, 'Operation', 'operation') ?? null,
  }));
}

export function parseDetalleDeComprobante(
  cuerpo: unknown,
): DetalleDeComprobante | null {
  const valor = leerResult(cuerpo);
  if (typeof valor !== 'object' || valor === null || Array.isArray(valor)) {
    return null;
  }

  const fila = comoObjeto(valor);
  const ncf = texto(fila, 'Ncf', 'ncf');
  // Un objeto sin NCF no es un detalle: es una respuesta vacía con forma de
  // objeto, y dibujarla llenaría la hoja de filas en blanco.
  if (ncf === '') return null;

  return {
    ncf,
    numero: texto(fila, 'Number', 'number'),
    descripcion: texto(fila, 'Description', 'description'),
    cuenta: texto(fila, 'Account', 'account'),
    tipoDeCuenta: texto(fila, 'AccountType', 'accountType'),
    moneda: textoOpcional(fila, 'Currency', 'currency') ?? '214',
    monto: decimal(fila, 'Amount', 'amount') ?? 0,
    fechaFin: textoOpcional(fila, 'EndDate', 'endDate') ?? null,
  };
}

export function parseMovimientoDelComprobante(
  cuerpo: unknown,
): MovimientoDelComprobante | null {
  const valor = leerResult(cuerpo);
  if (typeof valor !== 'object' || valor === null || Array.isArray(valor)) {
    return null;
  }

  const fila = comoObjeto(valor);
  const secuencia = texto(fila, 'Sequence', 'sequence');
  const operacion = texto(fila, 'Operation', 'operation');
  if (secuencia === '' && operacion === '') return null;

  return {
    secuencia,
    operacion,
    descripcion: texto(fila, 'Description', 'description'),
    fecha: texto(fila, 'TransactionDate', 'transactionDate'),
    tipo: texto(fila, 'TransactionTypeName', 'transactionTypeName'),
    monto: decimal(fila, 'Amount', 'amount') ?? 0,
    referencia: textoOpcional(fila, 'Reference', 'reference') ?? null,
    impuesto: textoOpcional(fila, 'TaxAmount', 'taxAmount') ?? null,
  };
}

/**
 * Si el error que devolvió el backend significa «no hay comprobantes».
 *
 * **Un período sin comprobantes no es un fallo: es la respuesta.** El core lo
 * distingue solo por el texto del mensaje, así que hay que leerlo, igual que
 * hace el manejador del backend. Comparar textos es frágil y está anotado como
 * tal, pero la alternativa —tratar cualquier 400 como error— convierte el caso
 * normal de un trimestre tranquilo en una pantalla de fallo. Los NCF se emiten
 * solo cuando se cobra una comisión, así que ese caso es muy frecuente.
 */
export function esPeriodoSinComprobantes(causa: unknown): boolean {
  const respuesta = (
    causa as { response?: { status?: number; data?: unknown } } | null
  )?.response;

  if (respuesta?.status !== 400) return false;

  const cuerpo = comoObjeto(respuesta.data);
  const mensaje = (
    textoOpcional(cuerpo, 'detail', 'Detail', 'title', 'Title') ??
    (typeof respuesta.data === 'string' ? respuesta.data : '')
  ).toLowerCase();

  return (
    mensaje.includes('no se encontraron registros') ||
    mensaje.includes('sin registros')
  );
}
