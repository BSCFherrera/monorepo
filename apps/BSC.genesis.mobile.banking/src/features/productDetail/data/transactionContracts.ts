import { repairEncoding } from '@bsc/shared';

import { aNumero, aTexto } from '../../dashboard/data/productContracts';

/**
 * Movimientos de cuenta y de tarjeta.
 *
 * Portado de `TransactionModel` en `product_detail_models.dart`, que es la
 * pieza más enredada de la app Flutter — y no por mal escrita: el core devuelve
 * los movimientos de **cuatro formas distintas** según el endpoint, y cada una
 * nombra los campos a su manera.
 *
 * La lógica que decide si un movimiento suma o resta tiene cuatro caminos, en
 * orden de confianza. Equivocarse ahí muestra un cargo como un depósito, así
 * que cada camino está probado por separado.
 */

/** Débito resta, crédito suma. */
export type TipoDeMovimiento = 'D' | 'C';

export interface Movimiento {
  descripcion: string;
  fecha: string;
  fechaAplicacion: string | undefined;

  /** Siempre positivo. El signo lo lleva `tipo`. */
  monto: number;

  /** Saldo después del movimiento, si el core lo manda. */
  saldoCorrido: number | undefined;

  tipo: TipoDeMovimiento;
  referencia: string | undefined;
  tipoDeTransaccion: string | undefined;
  comercio: string | undefined;
  numeroDeAprobacion: string | undefined;
}

function campo(fuente: Record<string, unknown>, ...nombres: string[]): unknown {
  for (const nombre of nombres) {
    const valor = fuente[nombre];
    if (valor !== undefined && valor !== null) return valor;
  }
  return undefined;
}

function opcional(valor: string): string | undefined {
  return valor === '' ? undefined : valor;
}

/**
 * Decide si el movimiento suma o resta.
 *
 * Cuatro caminos, del más confiable al menos:
 *
 *  1. El core lo dice explícitamente en `Operation`.
 *  2. Lo dice con `isDebit`, donde «S» significa sí.
 *  3. Se deduce de cuál de los dos montos —crédito o débito— viene con valor.
 *  4. Se deduce del signo del monto único.
 *
 * El último es el menos fiable, y por eso es el último: hay endpoints que
 * mandan todos los montos en positivo y el signo no significa nada.
 */
export function determinarTipo(
  fuente: Record<string, unknown>,
): TipoDeMovimiento {
  const explicito = campo(fuente, 'Operation', 'operation');
  if (explicito !== undefined) {
    return String(explicito).trim().toUpperCase().startsWith('C') ? 'C' : 'D';
  }

  const esDebito = campo(fuente, 'isDebit', 'IsDebit');
  if (esDebito !== undefined) {
    return String(esDebito).trim().toUpperCase() === 'S' ? 'D' : 'C';
  }

  const credito = aNumero(campo(fuente, 'CreditAmount', 'creditAmount'));
  const debito = aNumero(campo(fuente, 'DebitAmount', 'debitAmount'));

  if (credito > 0) return 'C';
  if (debito > 0) return 'D';

  return aNumero(campo(fuente, 'Amount', 'amount')) >= 0 ? 'C' : 'D';
}

/**
 * Monto del movimiento, siempre positivo.
 *
 * Se prueba primero el monto único y luego los específicos, porque hay
 * endpoints que mandan `Amount` en cero y el valor real en `CreditAmount`.
 */
export function determinarMonto(fuente: Record<string, unknown>): number {
  const unico = aNumero(campo(fuente, 'Amount', 'amount'));
  if (unico !== 0) return Math.abs(unico);

  const credito = aNumero(campo(fuente, 'CreditAmount', 'creditAmount'));
  const debito = aNumero(campo(fuente, 'DebitAmount', 'debitAmount'));

  return Math.abs(credito > 0 ? credito : debito);
}

export function parseMovimiento(crudo: unknown): Movimiento {
  const fuente =
    typeof crudo === 'object' && crudo !== null
      ? (crudo as Record<string, unknown>)
      : {};

  const saldoCrudo = campo(
    fuente,
    'runningBalance',
    'RunningBalance',
    'Balance',
    'balance',
  );

  return {
    // Las descripciones llegan con acentos estropeados por la codificación del
    // core; se reparan aquí, una sola vez, y no en cada pantalla.
    descripcion: repairEncoding(
      aTexto(
        campo(
          fuente,
          'Description',
          'description',
          'TransactionTypeName',
          'transactionTypeName',
          'typeDescription',
        ),
      ),
    ),
    fecha: aTexto(
      campo(fuente, 'TransactionDate', 'transactionDate', 'movementDate'),
    ),
    fechaAplicacion: opcional(
      aTexto(campo(fuente, 'PostedDate', 'postedDate')),
    ),

    monto: determinarMonto(fuente),

    // `undefined` y no cero: un saldo corrido ausente no es un saldo de cero, y
    // mostrarlo como tal haría creer al cliente que se quedó sin fondos.
    saldoCorrido: saldoCrudo === undefined ? undefined : aNumero(saldoCrudo),

    tipo: determinarTipo(fuente),
    referencia: opcional(aTexto(campo(fuente, 'Reference', 'reference'))),
    tipoDeTransaccion: opcional(
      aTexto(
        campo(
          fuente,
          'TransactionTypeName',
          'transactionTypeName',
          'typeDescription',
        ),
      ),
    ),
    comercio: opcional(aTexto(campo(fuente, 'MerchantName', 'merchantName'))),
    numeroDeAprobacion: opcional(
      aTexto(campo(fuente, 'ApprovalNumber', 'approvalNumber')),
    ),
  };
}

/**
 * Extrae la lista de movimientos de la respuesta, sea cual sea su forma.
 *
 * El core la envuelve de maneras distintas según el endpoint: a veces es un
 * arreglo directo, a veces va dentro de `Value`, y en tarjetas de crédito llega
 * anidada dos niveles —`Value.CreditCardTransactions.transactions`—. La app
 * Flutter las contempla todas, y hay que conservarlo.
 */
export function extraerMovimientos(cuerpo: unknown): Movimiento[] {
  const dato =
    typeof cuerpo === 'string' ? (JSON.parse(cuerpo) as unknown) : cuerpo;

  if (Array.isArray(dato)) return dato.map(parseMovimiento);

  if (typeof dato !== 'object' || dato === null) return [];

  const raiz = dato as Record<string, unknown>;

  // Envoltura `Result`.
  const valor = campo(raiz, 'Value', 'value');

  if (Array.isArray(valor)) return valor.map(parseMovimiento);

  if (typeof valor === 'object' && valor !== null) {
    const interno = valor as Record<string, unknown>;

    // Tarjetas: anidado dos niveles.
    const tarjeta = campo(
      interno,
      'CreditCardTransactions',
      'creditCardTransactions',
    );
    if (typeof tarjeta === 'object' && tarjeta !== null) {
      const lista = campo(
        tarjeta as Record<string, unknown>,
        'transactions',
        'Transactions',
      );
      if (Array.isArray(lista)) return lista.map(parseMovimiento);
    }

    const directa = campo(
      interno,
      'transactions',
      'Transactions',
      'Movements',
      'movements',
    );
    if (Array.isArray(directa)) return directa.map(parseMovimiento);
  }

  const alRaiz = campo(
    raiz,
    'transactions',
    'Transactions',
    'Movements',
    'movements',
  );
  if (Array.isArray(alRaiz)) return alRaiz.map(parseMovimiento);

  return [];
}

/**
 * Si el error del backend significa «no hubo movimientos en ese período».
 *
 * El core responde con un error en vez de con una lista vacía cuando no hay
 * nada en el rango consultado. Tratarlo como error mostraría una pantalla roja
 * a un cliente que simplemente no usó la cuenta ese mes.
 */
export function esPeriodoSinMovimientos(causa: unknown): boolean {
  const error = causa as
    | { response?: { status?: number; data?: unknown } }
    | undefined;

  const estado = error?.response?.status;
  if (estado !== 400 && estado !== 404) return false;

  const cuerpo = error?.response?.data;
  const texto =
    typeof cuerpo === 'string'
      ? cuerpo
      : typeof cuerpo === 'object' && cuerpo !== null
      ? JSON.stringify(cuerpo)
      : '';

  return /no.*(movimiento|transacci|registro|resultado)|sin.*(movimiento|datos)|not found|no records/i.test(
    texto,
  );
}
