import { aNumero, aTexto } from '../../dashboard/data/productContracts';

import {
  campo,
  comoObjeto,
  enteroInicial,
  fechaOpcional,
  numeroOpcional,
} from './coreFields';

/**
 * Detalle de un préstamo.
 *
 * Portado de `LoanDetailModel.toEntity` y de la entidad `LoanDetail`.
 *
 * Hay una distinción que el original cuida y conviene conservar: **el último
 * pago de capital y el de intereses distinguen «cero» de «no vino»**. Un
 * préstamo recién desembolsado todavía no tiene ningún pago, y enseñar
 * «Último pago capital: RD$ 0.00» sugiere que se pagó cero, no que aún no se ha
 * pagado nada.
 */

export interface DetalleDePrestamo {
  numeroDePrestamo: string;
  titular: string;
  /** Tipo tal como lo redacta el core: «Préstamo de consumo», por ejemplo. */
  tipoDePrestamo: string;

  saldoActual: number;
  montoDesembolsado: number;
  tasaDeInteres: number;
  tasaAnualEfectiva: number | undefined;

  plazoEnMeses: number;
  proximoNumeroDeCuota: number;
  fechaDeProximaCuota: string | undefined;

  ultimoPagoDeCapital: number | undefined;
  ultimoPagoDeIntereses: number | undefined;
  fechaDelUltimoPagoDeCuota: string | undefined;

  totalPagado: number;
  saldoDeCancelacion: number;
  interesesPendientes: number;

  fechaDeDesembolso: string | undefined;
  fechaDeVencimiento: string | undefined;
  fechaDeCancelacion: string | undefined;

  codigoMoneda: number;
  estado: string;
}

export function parseDetalleDePrestamo(
  crudo: unknown,
  contexto: { numeroDePrestamo: string; codigoMoneda: number },
): DetalleDePrestamo {
  const fuente = comoObjeto(crudo);

  /**
   * Monto que solo existe si el core mandó alguno de sus dos nombres.
   *
   * No se puede usar la conversión normal: devolvería cero y perdería la
   * diferencia entre «pagó cero» y «todavía no ha pagado».
   */
  const montoSiVino = (...nombres: string[]): number | undefined => {
    const valor = campo(fuente, ...nombres);
    return valor === undefined ? undefined : aNumero(valor);
  };

  return {
    // El número del core manda sobre el que traía la pantalla: la lista de
    // productos a veces lo entrega recortado.
    numeroDePrestamo: aTexto(
      campo(fuente, 'loanNumber', 'NO_PRESTAMO', 'NUMERO_PRESTAMO'),
      contexto.numeroDePrestamo,
    ),
    titular: aTexto(
      campo(fuente, 'accountHolderName', 'TITULAR', 'NOM_CLIENTE'),
    ),
    tipoDePrestamo: aTexto(
      campo(
        fuente,
        'loanTypeDescription',
        'DESC_TIPO_CREDITO',
        'TIPO_PRESTAMO',
      ),
      'Préstamo',
    ),

    saldoActual: aNumero(campo(fuente, 'currentBalance', 'SALDO_ACTUAL')),
    montoDesembolsado: aNumero(
      campo(fuente, 'disbursedAmount', 'MONTO_DESEMBOLSADO'),
    ),
    tasaDeInteres: aNumero(campo(fuente, 'interestRate', 'TASA')),
    tasaAnualEfectiva: numeroOpcional(
      campo(fuente, 'annualEffectiveRate', 'TAE'),
    ),

    plazoEnMeses: enteroInicial(campo(fuente, 'loanTermInMonths', 'PLAZO')),
    proximoNumeroDeCuota: enteroInicial(
      campo(fuente, 'nextInstallmentNumber', 'PROX_NUM_CUOTA'),
    ),
    fechaDeProximaCuota: fechaOpcional(
      campo(fuente, 'nextInstallmentDueDate', 'FEC_PROX_CUOTA'),
    ),

    ultimoPagoDeCapital: montoSiVino(
      'lastPrincipalPaymentAmount',
      'ULT_PAGO_PRINCIPAL',
    ),
    ultimoPagoDeIntereses: montoSiVino(
      'lastInterestPaymentAmount',
      'ULT_PAG_INTERESES',
    ),
    fechaDelUltimoPagoDeCuota: fechaOpcional(
      campo(fuente, 'lastInstallmentPaidDate', 'FEC_DIA_PAGO_CUO_ANT'),
    ),

    totalPagado: aNumero(campo(fuente, 'totalPaidAmount', 'MONTO_PAGADO')),
    saldoDeCancelacion: aNumero(
      campo(fuente, 'settlementBalance', 'SALDO_CANCELACION'),
    ),
    interesesPendientes: aNumero(
      campo(fuente, 'pendingInterestAmount', 'INTERESES_PENDIENTES'),
    ),

    fechaDeDesembolso: fechaOpcional(
      campo(fuente, 'disbursementDate', 'FEC_DESEMBOLSO'),
    ),
    fechaDeVencimiento: fechaOpcional(
      campo(fuente, 'maturityDate', 'FEC_VENCIMIENTO'),
    ),
    fechaDeCancelacion: fechaOpcional(
      campo(fuente, 'cancellationDate', 'FEC_CANCELACION'),
    ),

    codigoMoneda: contexto.codigoMoneda,
    estado: aTexto(campo(fuente, 'status', 'ESTADO'), 'A'),
  };
}

/**
 * Qué cifra va en la cabecera del préstamo, y cómo se llama.
 *
 * **En los préstamos activos el core devuelve `SALDO_ACTUAL` en cero**, y lo
 * que el cliente debería pagar para saldar vive en `SALDO_CANCELACION`. Abrir
 * la pantalla con «RD$ 0.00» encima se leería como que no debe nada, que es el
 * malentendido más caro posible en la pantalla de un préstamo. El original cae
 * al saldo de cancelación y cambia también la etiqueta, para no llamar
 * «balance» a algo que no lo es.
 */
export function saldoDeLaCabecera(prestamo: DetalleDePrestamo): {
  monto: number;
  etiqueta: string;
} {
  return prestamo.saldoActual > 0
    ? { monto: prestamo.saldoActual, etiqueta: 'Balance actual' }
    : { monto: prestamo.saldoDeCancelacion, etiqueta: 'Saldo de cancelación' };
}

/** Un préstamo cancelado es el que tiene fecha de cancelación. */
export function estaCancelado(prestamo: DetalleDePrestamo): boolean {
  return prestamo.fechaDeCancelacion !== undefined;
}

/**
 * Cuánto del préstamo va pagado, entre 0 y 1.
 *
 * Se calcula sobre lo desembolsado y **se recorta a uno**: el core devuelve a
 * veces un pagado mayor que el desembolso —porque incluye intereses— y sin
 * recortar la barra se saldría de la tarjeta.
 */
export function avanceDelPrestamo(prestamo: DetalleDePrestamo): number {
  if (prestamo.montoDesembolsado <= 0) return 0;
  const avance = prestamo.totalPagado / prestamo.montoDesembolsado;
  return Math.min(Math.max(avance, 0), 1);
}
