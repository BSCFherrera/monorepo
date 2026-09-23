import { CURRENCY } from '@bsc/shared';

import { aNumero, aTexto } from '../../dashboard/data/productContracts';

import {
  campo,
  comoObjeto,
  enteroInicial,
  fechaOpcional,
  numeroOpcional,
  textoOpcional,
  type Crudo,
} from './coreFields';

/**
 * Detalle de una tarjeta de crédito.
 *
 * Portado de `CreditCardDetailModel.toEntity` y de la entidad
 * `CreditCardDetail`.
 *
 * **Una tarjeta del banco lleva dos saldos a la vez, en pesos y en dólares**, y
 * el core los devuelve como campos distintos con el sufijo `_RD` y `_US`. No es
 * una tarjeta en pesos o una en dólares: es la misma tarjeta con dos ciclos,
 * dos pagos mínimos y dos fechas. Por eso el contrato guarda los dos juegos
 * completos y la pantalla elige cuál enseña con un selector, en vez de intentar
 * consolidarlos: sumarlos con una tasa daría una cifra que no aparece en ningún
 * estado de cuenta y que el cliente no podría pagar.
 */

/** Los importes de la tarjeta en una moneda. */
export interface MontosDeLaTarjeta {
  balanceActual: number;
  limiteDeCredito: number;
  disponibleParaCompras: number;
  disponibleParaRetiros: number;
  pagoMinimo: number;
  pagoTotal: number;
  pagoVencido: number;
  saldoAlCorte: number;
  pagoMaximo: number;
  debitosDespuesDelCorte: number;
  creditosDespuesDelCorte: number;
  enTransito: number;
}

/** Movimiento de puntos del mes en curso. */
export interface PuntosDeLaTarjeta {
  balance: number;
  anterior: number;
  ganadosEnElMes: number;
  usadosEnElMes: number;
  vencidosEnElMes: number;
}

export interface DetalleDeTarjeta {
  numeroDeTarjeta: string;
  /**
   * El número que la pantalla enseña, que es **con el que se abrió**: el que el
   * cliente acaba de tocar en la lista de productos.
   */
  numeroEnmascarado: string;
  /**
   * El número que el propio detalle reporta en `NUM_TARJETA`, cuando viene.
   *
   * **No es siempre el mismo que el anterior**, y en el ambiente de prueba no
   * lo es: la lista entrega una tarjeta terminada en 7147 y el detalle
   * responde 1032. Se guarda aparte porque cuál de los dos es el plástico está
   * sin resolver con el banco, y mientras tanto la pantalla enseña el que el
   * cliente tocó.
   */
  numeroDelCore: string | undefined;
  nombreDelProducto: string;

  pesos: MontosDeLaTarjeta;
  dolares: MontosDeLaTarjeta;
  puntos: PuntosDeLaTarjeta;

  fechaDeCorte: string | undefined;
  fechaDePago: string | undefined;
  fechaDeVencimientoDelPlastico: string | undefined;

  tasaDeFinanciamiento: number | undefined;
  tasaAnualEfectiva: number | undefined;
  estado: string;
}

/** Lee los doce importes de una moneda, por sus dos juegos de nombres. */
function montosDe(fuente: Crudo, sufijo: 'RD' | 'US'): MontosDeLaTarjeta {
  // El nombre en inglés termina en DOP o USD; el del core, en _RD o _US.
  const ingles = sufijo === 'RD' ? 'DOP' : 'USD';
  const leer = (base: string, nombreDelCore: string): number =>
    aNumero(campo(fuente, `${base}${ingles}`, `${nombreDelCore}_${sufijo}`));

  return {
    balanceActual: leer('currentBalance', 'SALDO_ACTUAL'),
    limiteDeCredito: leer('creditLimit', 'LIMITE_CREDITO'),
    disponibleParaCompras: leer('availablePurchases', 'DISP_COMPRAS'),
    disponibleParaRetiros: leer('availableWithdrawals', 'DISP_RETIROS'),
    pagoMinimo: leer('minimumPayment', 'PAGO_MINIMO'),
    pagoTotal: leer('totalPayment', 'PAGO_TOTAL'),
    pagoVencido: leer('overduePayment', 'PAGO_VENCIDO'),
    saldoAlCorte: leer('statementBalance', 'SALDO_CORTE'),
    pagoMaximo: leer('maxPayment', 'PAGO_MAXIMO'),
    debitosDespuesDelCorte: leer('debitsAfterCut', 'DEB_DESP_CORTE'),
    creditosDespuesDelCorte: leer('creditsAfterCut', 'CRE_DESP_CORTE'),
    enTransito: leer('inTransit', 'TRA_TRANSITO'),
  };
}

export function parseDetalleDeTarjeta(
  crudo: unknown,
  contexto: { numeroDeTarjeta: string; numeroEnmascarado?: string },
): DetalleDeTarjeta {
  const fuente = comoObjeto(crudo);

  // El detalle reporta su propio número en `NUM_TARJETA`, y **no coincide con
  // el de la lista de productos**: en el ambiente de prueba la lista entrega
  // una tarjeta terminada en 7147 y el detalle responde 1032.
  //
  // La pantalla enseña el de la lista, que es lo que hace el original: su
  // modelo calcula el del detalle pero la tarjeta de resumen lee
  // `widget.maskedCardNumber`, el que venía. Y es lo razonable mientras el
  // banco no aclare cuál es el plástico: el cliente acaba de tocar una tarjeta
  // terminada en 7147 y abrirle una que dice 1032 le haría pensar que se
  // equivocó de producto.
  const numeroDelCore = textoOpcional(
    campo(fuente, 'NUM_TARJETA', 'numTarjeta'),
  );

  return {
    numeroDeTarjeta: contexto.numeroDeTarjeta,
    numeroEnmascarado:
      contexto.numeroEnmascarado ?? numeroDelCore ?? contexto.numeroDeTarjeta,
    numeroDelCore,
    nombreDelProducto: aTexto(
      campo(fuente, 'productName', 'NOMBRE_PRODUCTO'),
      'Tarjeta de Crédito',
    ),

    pesos: montosDe(fuente, 'RD'),
    dolares: montosDe(fuente, 'US'),

    puntos: {
      balance: enteroInicial(
        campo(fuente, 'pointsBalance', 'PTOS_BALANCE_ACT'),
      ),
      anterior: enteroInicial(
        campo(fuente, 'pointsPrevious', 'PTOS_BALANCE_ANT'),
      ),
      ganadosEnElMes: enteroInicial(
        campo(fuente, 'pointsEarnedMonth', 'PTOS_GAN_MES_ACT'),
      ),
      usadosEnElMes: enteroInicial(
        campo(fuente, 'pointsUsedMonth', 'PTOS_USA_MES_ACT'),
      ),
      vencidosEnElMes: enteroInicial(
        campo(fuente, 'pointsExpiredMonth', 'PTOS_EXP_MES_ACT'),
      ),
    },

    fechaDeCorte: fechaOpcional(campo(fuente, 'cutDate', 'FECHA_CORTE')),
    fechaDePago: fechaOpcional(
      campo(fuente, 'dueDate', 'FECHA_VENCIMIENTO', 'FECHA_PAGO'),
    ),
    fechaDeVencimientoDelPlastico: fechaOpcional(
      campo(fuente, 'expiryDate', 'FECHA_VENCIMIENTO'),
    ),

    // Las dos tasas distinguen cero de ausente: enseñar «0%» afirmaría una tasa
    // que el banco nunca mandó.
    tasaDeFinanciamiento: numeroOpcional(
      campo(
        fuente,
        'interestRate',
        'FINANCINGINTERESTRATE_RD',
        'TASA_FINANCIAMIENTO',
      ),
    ),
    tasaAnualEfectiva: numeroOpcional(
      campo(fuente, 'annualEffectiveRate', 'TAE_RD'),
    ),
    estado: aTexto(campo(fuente, 'status', 'ESTADO'), 'A'),
  };
}

/** Los importes de la moneda que la pantalla tiene seleccionada. */
export function montosEnMoneda(
  tarjeta: DetalleDeTarjeta,
  codigoMoneda: number,
): MontosDeLaTarjeta {
  return codigoMoneda === CURRENCY.DOP ? tarjeta.pesos : tarjeta.dolares;
}

/**
 * Qué parte del límite está usada, entre 0 y 1.
 *
 * Se recorta a uno porque una tarjeta puede pasarse de su límite —por intereses
 * o por un cargo autorizado por encima— y el anillo se saldría del círculo.
 */
export function usoDelLimite(montos: MontosDeLaTarjeta): number {
  if (montos.limiteDeCredito <= 0) return 0;
  const uso = montos.balanceActual / montos.limiteDeCredito;
  return Math.min(Math.max(uso, 0), 1);
}

/** Hay algo vencido en cualquiera de las dos monedas. */
export function tienePagoVencido(tarjeta: DetalleDeTarjeta): boolean {
  return tarjeta.pesos.pagoVencido > 0 || tarjeta.dolares.pagoVencido > 0;
}

/** Hubo movimiento de puntos este mes, y por tanto algo que contar. */
export function tieneActividadDePuntos(tarjeta: DetalleDeTarjeta): boolean {
  return (
    tarjeta.puntos.ganadosEnElMes > 0 ||
    tarjeta.puntos.usadosEnElMes > 0 ||
    tarjeta.puntos.vencidosEnElMes > 0
  );
}

/** Los últimos cuatro dígitos, para el «•••• 0668» de la tarjeta. */
export function ultimosCuatroDigitos(tarjeta: DetalleDeTarjeta): string {
  const numero = tarjeta.numeroEnmascarado;
  return numero.length >= 4 ? numero.slice(-4) : numero;
}

/**
 * Qué decir sobre el pago del ciclo.
 *
 * **Una tarjeta que se cobra de contado no tiene pago mínimo**: el core manda
 * cero y lo que realmente hay que pagar es el total del ciclo. Enseñar «Pago
 * mínimo RD$ 0.00» le diría al cliente que no tiene que pagar nada este mes.
 */
export function avisoDePago(montos: MontosDeLaTarjeta): {
  etiqueta: string;
  monto: number;
} {
  return montos.pagoMinimo > 0
    ? { etiqueta: 'Pago mínimo', monto: montos.pagoMinimo }
    : { etiqueta: 'Pago de contado', monto: montos.pagoTotal };
}
