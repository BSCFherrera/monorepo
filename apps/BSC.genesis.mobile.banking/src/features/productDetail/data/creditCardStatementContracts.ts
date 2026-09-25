import {
  aEntero,
  aNumero,
  aTexto,
} from '../../dashboard/data/productContracts';

import {
  campo,
  comoObjeto,
  fechaOpcional,
  textoOpcional,
  type Crudo,
} from './coreFields';
import { extraerMovimientos, type Movimiento } from './transactionContracts';

/**
 * El estado de cuenta cerrado de un ciclo de tarjeta.
 *
 * Portado de `CreditCardStatementModel.toEntity` y de la entidad
 * `CreditCardStatement`, que se alimentan de
 * `POST /credit-card-management/statement`.
 *
 * **Este endpoint sabe cosas que el detalle del producto no sabe**: el ciclo al
 * que pertenece el saldo, cuántas compras y avances hubo, sobre qué balance se
 * calcula el cargo financiero y qué pasó con los puntos del mes. Por eso la
 * pantalla lo consulta aparte en vez de reutilizar el detalle, que no tiene
 * ninguno de esos campos.
 *
 * Los enteros se leen con valor inicial cero —y no con el −1 que usa `aEntero`
 * por defecto para distinguir «no vino»— porque aquí el original declara cero
 * en cada contador: un ciclo sin compras tiene cero compras, no una cantidad
 * desconocida.
 */

export interface EstadoDeTarjeta {
  numeroDeTarjeta: string;
  nombreDelProducto: string;
  moneda: string;

  /** El ciclo, tal como lo reporta el core. */
  fechaDeCorte: string | undefined;
  fechaDePago: string | undefined;
  inicioDelPeriodo: string | undefined;
  finDelPeriodo: string | undefined;
  /** Vencimiento del plástico; el core lo escribe `AAAA/MM`. */
  vencimientoDelPlastico: string | undefined;

  // Balances del ciclo
  saldoAlCorte: number;
  saldoDisponible: number;
  limiteDeCredito: number;
  balanceAnterior: number;
  balanceNuevo: number;
  pagoDeContado: number;
  pagoMinimo: number;
  pagoVencido: number;
  cuotasEnAtraso: number;
  excesoDeLimite: number;
  ultimoPagoRecibido: number;

  // Actividad del ciclo
  cantidadDeCompras: number;
  montoDeCompras: number;
  cantidadDeAvances: number;
  montoDeAvances: number;

  // Base del cargo financiero
  balancePromedioDiario: number;
  tasaDelCargoFinanciero: number;
  balanceSujetoAFinanciamiento: number;

  // Puntos del mes
  puntosAcumulados: number;
  puntosVencidos: number;
  puntosCanjeados: number;
  puntosEliminados: number;

  numeroDeComprobanteFiscal: string | undefined;
  movimientos: Movimiento[];
}

/** Entero con cero por defecto: aquí «no vino» y «cero» significan lo mismo. */
function contador(valor: unknown): number {
  const entero = aEntero(valor, 0);
  return entero < 0 ? 0 : entero;
}

export function parseEstadoDeTarjeta(crudo: unknown): EstadoDeTarjeta {
  const fuente: Crudo = comoObjeto(crudo);

  const numero = (base: string, alterno: string): number =>
    aNumero(campo(fuente, base, alterno));

  return {
    numeroDeTarjeta: aTexto(campo(fuente, 'Number', 'number')),
    nombreDelProducto: aTexto(
      campo(fuente, 'ProductName', 'productName'),
      'Tarjeta de Crédito',
    ),
    moneda: aTexto(campo(fuente, 'Currency', 'currency'), 'DOP'),

    fechaDeCorte: fechaOpcional(campo(fuente, 'CycleDate', 'cycleDate')),
    fechaDePago: fechaOpcional(campo(fuente, 'DueDate', 'dueDate')),
    inicioDelPeriodo: fechaOpcional(campo(fuente, 'Start', 'start')),
    finDelPeriodo: fechaOpcional(campo(fuente, 'End', 'end')),
    // No pasa por `fechaOpcional`: el core lo manda como `2028/05`, que no es
    // una fecha completa y se enseña tal cual.
    vencimientoDelPlastico: textoOpcional(
      campo(fuente, 'ExpirationDate', 'expirationDate'),
    ),

    saldoAlCorte: numero('CurrentBalance', 'currentBalance'),
    saldoDisponible: numero('AvailableBalance', 'availableBalance'),
    limiteDeCredito: numero('CreditLimit', 'creditLimit'),
    balanceAnterior: numero('PreviousBalance', 'previousBalance'),
    balanceNuevo: numero('NewBalance', 'newBalance'),
    pagoDeContado: numero('DuePayment', 'duePayment'),
    pagoMinimo: numero('MinimumPayment', 'minimumPayment'),
    pagoVencido: numero('OverduePayment', 'overduePayment'),
    cuotasEnAtraso: contador(
      campo(fuente, 'QtyDelinquentPayments', 'qtyDelinquentPayments'),
    ),
    excesoDeLimite: numero('OverLimit', 'overLimit'),
    ultimoPagoRecibido: numero('LastPaymentAmount', 'lastPaymentAmount'),

    cantidadDeCompras: contador(campo(fuente, 'QtyPurchases', 'qtyPurchases')),
    montoDeCompras: numero('PurchasesAmount', 'purchasesAmount'),
    cantidadDeAvances: contador(
      campo(fuente, 'QtyCashAdvance', 'qtyCashAdvance'),
    ),
    montoDeAvances: numero('CashAdvanceAmount', 'cashAdvanceAmount'),

    balancePromedioDiario: numero(
      'MonthDailyAverageBalance',
      'monthDailyAverageBalance',
    ),
    tasaDelCargoFinanciero: numero(
      'InterestRateFinanceCharge',
      'interestRateFinanceCharge',
    ),
    balanceSujetoAFinanciamiento: numero('FinanceBalance', 'financeBalance'),

    puntosAcumulados: contador(
      campo(fuente, 'AccumulatedPointMonth', 'accumulatedPointMonth'),
    ),
    puntosVencidos: contador(
      campo(fuente, 'ExpiredPointMonth', 'expiredPointMonth'),
    ),
    puntosCanjeados: contador(
      campo(fuente, 'RedeemedPointMonth', 'redeemedPointMonth'),
    ),
    puntosEliminados: contador(
      campo(fuente, 'EliminatedPointMonth', 'eliminatedPointMonth'),
    ),

    numeroDeComprobanteFiscal: textoOpcional(
      campo(fuente, 'TaxReceiptNumber', 'taxReceiptNumber'),
    ),
    // Los movimientos del ciclo se leen con el mismo extractor que los de la
    // pantalla de actividad, de modo que la regla de signo del core —los cuatro
    // caminos— sea la misma en los dos sitios.
    movimientos: extraerMovimientos(fuente),
  };
}

/** Hay algo vencido en el ciclo, por monto o por cuotas. */
export function estaEnAtraso(estado: EstadoDeTarjeta): boolean {
  return estado.pagoVencido > 0 || estado.cuotasEnAtraso > 0;
}

/** El ciclo tuvo compras o avances, y por tanto algo que desglosar. */
export function tieneActividadDelCiclo(estado: EstadoDeTarjeta): boolean {
  return (
    estado.cantidadDeCompras > 0 ||
    estado.cantidadDeAvances > 0 ||
    estado.montoDeCompras > 0 ||
    estado.montoDeAvances > 0
  );
}

/** Hubo movimiento de puntos en el mes del ciclo. */
export function tienePuntosDelMes(estado: EstadoDeTarjeta): boolean {
  return (
    estado.puntosAcumulados > 0 ||
    estado.puntosCanjeados > 0 ||
    estado.puntosVencidos > 0 ||
    estado.puntosEliminados > 0
  );
}

/**
 * Qué parte del límite estaba usada al cerrar el ciclo, entre 0 y 1.
 *
 * Se recorta a uno por lo mismo que en el detalle: una tarjeta puede pasarse de
 * su límite y el anillo se saldría del círculo.
 */
export function usoAlCorte(estado: EstadoDeTarjeta): number {
  if (estado.limiteDeCredito <= 0) return 0;
  const uso = estado.saldoAlCorte / estado.limiteDeCredito;
  return Math.min(Math.max(uso, 0), 1);
}
