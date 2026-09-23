import {
  comoObjeto,
  decimal,
  esVerdadero,
  leerResult,
  texto,
  textoOpcional,
} from '../../../core/network/envelopes';

/**
 * Contratos del flujo de pagos.
 *
 * Portado de `payment_entities.dart` y `payment_remote_datasource.dart`. La
 * cotización y el resumen de comisiones son **los mismos endpoints** que usa el
 * flujo de transferencias, así que se reutilizan de allí en vez de duplicarse:
 * en el original están copiados con distinto nombre y ya divergen —el de pagos
 * no manda `transactionSubType`—.
 */

// ─── Tipos ──────────────────────────────────────────────────────────────────

export const TipoDePago = {
  Tarjeta: 'tarjeta',
  Prestamo: 'prestamo',
} as const;

export type TipoDePago = (typeof TipoDePago)[keyof typeof TipoDePago];

export function tituloDeSeleccion(tipo: TipoDePago): string {
  return tipo === TipoDePago.Prestamo ? 'Préstamo a Pagar' : 'Tarjeta a Pagar';
}

export function tituloDeConfirmacion(tipo: TipoDePago): string {
  return tipo === TipoDePago.Prestamo ? 'Préstamo' : 'Tarjeta de Crédito';
}

/**
 * Qué monto se paga.
 *
 * Tarjetas: mínimo, balance al corte, balance a la fecha u otro. Préstamos:
 * la cuota u otro. Son las opciones literales del original.
 */
export const TipoDeMonto = {
  Minimo: 'minimo',
  AlCorte: 'al-corte',
  ALaFecha: 'a-la-fecha',
  Cuota: 'cuota',
  Otro: 'otro',
} as const;

export type TipoDeMonto = (typeof TipoDeMonto)[keyof typeof TipoDeMonto];

export const ETIQUETAS_DE_MONTO: Readonly<Record<TipoDeMonto, string>> = {
  [TipoDeMonto.Minimo]: 'Pago Mínimo',
  [TipoDeMonto.AlCorte]: 'Balance al Corte',
  [TipoDeMonto.ALaFecha]: 'Balance a la Fecha',
  [TipoDeMonto.Cuota]: 'Pagar Cuota',
  [TipoDeMonto.Otro]: 'Otro Monto',
};

// ─── Resultado del pago ─────────────────────────────────────────────────────

export interface ResultadoDePago {
  exito: boolean;
  mensaje: string;
  estadoId: string;
  transaccionId: string;
}

/**
 * Lee la respuesta de los tres endpoints de pago, que comparten forma.
 *
 * `{ value: [{ transactionId, statusId, statusDescription, message }], isSuccess }`.
 * El estado `0` o `00` es aplicado; si no viene ninguno, se confía en el sobre.
 */
export function parseResultadoDePago(cuerpo: unknown): ResultadoDePago {
  const sobre = comoObjeto(cuerpo);
  const exitoDelSobre = esVerdadero(sobre.isSuccess ?? sobre.IsSuccess);

  const contenido = leerResult(cuerpo);
  const item = Array.isArray(contenido)
    ? comoObjeto(contenido[0])
    : comoObjeto(contenido);

  const hayContenido = Object.keys(item).length > 0 && item !== sobre;

  if (!hayContenido) {
    return {
      exito: false,
      mensaje:
        textoOpcional(sobre, 'error', 'Error', 'detail', 'Detail') ??
        'No se pudo procesar el pago.',
      estadoId: '',
      transaccionId: '',
    };
  }

  const estadoId = texto(item, 'statusId', 'StatusId');
  const transaccionId = texto(item, 'transactionId', 'TransactionId');

  const exito =
    estadoId === '0' || estadoId === '00' || (estadoId === '' && exitoDelSobre);

  const mensaje =
    textoOpcional(item, 'message', 'Message') ??
    textoOpcional(item, 'statusDescription', 'StatusDescription');

  return {
    exito,
    mensaje:
      mensaje ??
      (exito
        ? 'Pago realizado satisfactoriamente.'
        : 'No se pudo procesar el pago.'),
    estadoId,
    transaccionId,
  };
}

// ─── Comisiones e impuesto ──────────────────────────────────────────────────

export interface ComisionesDePago {
  comision: number;
  impuesto: number;
  /**
   * Si el servicio de comisiones llegó a responder.
   *
   * **Cero no es lo mismo que «no lo sé».** Sin esta distinción, un fallo del
   * servicio se presentaba como una operación sin comisión ni impuesto, y el
   * cliente veía un total que el core después no respetaba. El banco pide que
   * este servicio se consulte siempre, porque es él quien dice si corresponde
   * cobrar; cuando no contesta, hay que decirlo, no rellenar con ceros.
   */
  conocidas: boolean;
}

export const SIN_COMISIONES_DE_PAGO: ComisionesDePago = {
  comision: 0,
  impuesto: 0,
  conocidas: false,
};

export function parseComisionesDePago(cuerpo: unknown): ComisionesDePago {
  const contenido = comoObjeto(leerResult(cuerpo));

  return {
    comision: decimal(contenido, 'commissionAmount', 'CommissionAmount') ?? 0,
    impuesto: decimal(contenido, 'taxAmount', 'TaxAmount') ?? 0,
    conocidas: true,
  };
}
