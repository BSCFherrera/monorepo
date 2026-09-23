import { parseCoreDate } from '@bsc/shared';

import { aNumero, aTexto } from '../../dashboard/data/productContracts';

import {
  campo,
  comoObjeto,
  enteroInicial,
  fechaOpcional,
  numeroOpcional,
  textoOpcional,
} from './coreFields';

/**
 * Detalle de un certificado financiero.
 *
 * Portado de `CertificateDetailModel.toEntity` y de la entidad
 * `CertificateDetail`.
 *
 * Una decisión del original que conviene respetar: **el plazo se muestra tal
 * como lo redacta el core**. `PLAZO` llega como `"150 días"` y volver a
 * derivarlo a un número y reescribirlo arriesga cambiar lo que el banco quiso
 * decir; a la vez se guarda el número, que hace falta para calcular cuánto
 * falta para el vencimiento.
 */

export interface DetalleDeCertificado {
  numeroDeCertificado: string;
  saldoActual: number;
  montoInicial: number;

  tasaDeInteres: number;
  tasaAnualEfectiva: number | undefined;

  /** Plazo en días, ya extraído del texto del core. */
  plazoEnDias: number;
  /** El plazo tal como lo escribe el core: «150 días». */
  plazoRedactado: string | undefined;

  interesesGanados: number;
  interesesPagados: number;

  fechaDeInicio: string | undefined;
  fechaDeVencimiento: string | undefined;
  fechaDeUltimaRenovacion: string | undefined;

  /** Cómo se pagan los intereses: «MENSUAL», «VENCIMIENTO»… */
  formaDePago: string;
  /** Cuenta a la que se abonan los intereses. */
  cuentaDeAbono: string | undefined;
  /** Nombre comercial del producto de depósito. */
  nombreDelProducto: string | undefined;

  codigoMoneda: number;
  estado: string;
}

export function parseDetalleDeCertificado(
  crudo: unknown,
  contexto: { numeroDeCertificado: string; codigoMoneda: number },
): DetalleDeCertificado {
  const fuente = comoObjeto(crudo);

  return {
    numeroDeCertificado: aTexto(
      campo(fuente, 'certificateNumber', 'NUMERO_CPD', 'NUMERO_CERTIFICADO'),
      contexto.numeroDeCertificado,
    ),
    saldoActual: aNumero(campo(fuente, 'currentBalance', 'BALANCE_ACTUAL')),
    montoInicial: aNumero(campo(fuente, 'initialAmount', 'MONTO_INICIAL')),

    tasaDeInteres: aNumero(campo(fuente, 'interestRate', 'TASA')),
    tasaAnualEfectiva: numeroOpcional(
      campo(fuente, 'annualEffectiveRate', 'TAE'),
    ),

    plazoEnDias: enteroInicial(campo(fuente, 'termDays', 'PLAZO')),
    plazoRedactado: textoOpcional(campo(fuente, 'termLabel', 'PLAZO')),

    interesesGanados: aNumero(
      campo(fuente, 'interestEarned', 'INTERESES_GANADOS'),
    ),
    interesesPagados: aNumero(
      campo(fuente, 'interestPaid', 'INTERESES_PAGADOS'),
    ),

    fechaDeInicio: fechaOpcional(campo(fuente, 'startDate', 'FEC_INICIO')),
    fechaDeVencimiento: fechaOpcional(
      campo(fuente, 'maturityDate', 'FEC_VENCIMIENTO'),
    ),
    fechaDeUltimaRenovacion: fechaOpcional(
      campo(fuente, 'lastRenewalDate', 'FEC_ULT_RENOV'),
    ),

    formaDePago: aTexto(
      campo(fuente, 'paymentMethod', 'FORMA_PAGO'),
      'VENCIMIENTO',
    ),
    cuentaDeAbono: textoOpcional(
      campo(fuente, 'settlementAccount', 'NUM_CUENTA'),
    ),
    nombreDelProducto: textoOpcional(
      campo(fuente, 'productName', 'NOMBRE_CPD'),
    ),

    codigoMoneda: contexto.codigoMoneda,
    estado: aTexto(campo(fuente, 'status', 'ESTADO'), 'A'),
  };
}

/**
 * Intereses ganados que todavía no se han abonado.
 *
 * Nunca negativo: cuando el core reporta más pagado que ganado —pasa tras una
 * renovación, porque los contadores se reinician en distinto momento— la resta
 * da negativo, y «Intereses pendientes: -RD$ 40.00» no significa nada para el
 * cliente.
 */
export function interesesPendientes(certificado: DetalleDeCertificado): number {
  const pendiente = certificado.interesesGanados - certificado.interesesPagados;
  return pendiente > 0 ? pendiente : 0;
}

/** Un certificado activo es el que el core marca con «A». */
export function estaVigente(certificado: DetalleDeCertificado): boolean {
  return certificado.estado.toUpperCase().trim() === 'A';
}

/**
 * Cuánto del plazo ha transcurrido y cuántos días quedan.
 *
 * Se calcula con las fechas de inicio y vencimiento, no con el plazo en días:
 * un certificado renovado conserva el plazo original pero las fechas se mueven.
 * Si falta alguna de las dos fechas devuelve avance cero y ningún día restante,
 * que es lo que hace el original, y la pantalla simplemente no dibuja la
 * cuenta atrás.
 */
export function avanceDelPlazo(
  certificado: DetalleDeCertificado,
  hoy: Date = new Date(),
): { avance: number; diasRestantes: number } {
  const inicio = aFecha(certificado.fechaDeInicio);
  const vencimiento = aFecha(certificado.fechaDeVencimiento);
  if (inicio === null || vencimiento === null) {
    return { avance: 0, diasRestantes: 0 };
  }

  const DIA = 86_400_000;
  const totalDeDias = Math.round(
    (vencimiento.getTime() - inicio.getTime()) / DIA,
  );
  if (totalDeDias <= 0) return { avance: 0, diasRestantes: 0 };

  const transcurridos = Math.round((hoy.getTime() - inicio.getTime()) / DIA);
  const restantes = Math.round((vencimiento.getTime() - hoy.getTime()) / DIA);

  return {
    avance: Math.min(Math.max(transcurridos / totalDeDias, 0), 1),
    diasRestantes: Math.min(Math.max(restantes, 0), totalDeDias),
  };
}

/**
 * Vuelve a leer una fecha ya formateada como `dd/MM/yyyy`.
 *
 * El contrato guarda las fechas como texto porque es lo que la pantalla enseña,
 * y aquí hacen falta como fecha para calcular el plazo.
 */
function aFecha(texto: string | undefined): Date | null {
  if (texto === undefined) return null;
  return parseCoreDate(texto);
}
