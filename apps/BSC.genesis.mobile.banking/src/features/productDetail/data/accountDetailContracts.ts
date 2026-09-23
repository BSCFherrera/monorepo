import { aNumero, aTexto } from '../../dashboard/data/productContracts';

import {
  campo,
  comoObjeto,
  fechaOpcional,
  numeroOpcional,
  textoOpcional,
} from './coreFields';

/**
 * Detalle de una cuenta de ahorros o corriente.
 *
 * Portado de `AccountDetailModel.toEntity` y de la entidad `AccountDetail`.
 *
 * **La forma de la respuesta es el problema.** El core devuelve los nombres en
 * español y mayúsculas —`SAL_DISPONIBLE`, `LIM_LIN_TRANSITO`— y el backend, que
 * solo reenvía, a veces los entrega ya traducidos al inglés por el bus. Cada
 * campo se busca por los dos nombres, en el mismo orden que el original, porque
 * quedarse corto aquí no rompe la pantalla: imprime un cero donde hay dinero.
 */

export interface DetalleDeCuenta {
  numeroDeCuenta: string;
  titular: string;
  /** `CA` para ahorros, `CC` para corriente. */
  tipoDeCuenta: string;

  saldoDisponible: number;
  saldoTotal: number;
  saldoRetenido: number;
  saldoEmbargado: number;
  saldoEnTransito: number;

  codigoMoneda: number;
  estado: string;

  sucursal: string | undefined;
  fechaDeApertura: string | undefined;
  fechaDelUltimoMovimiento: string | undefined;
  tasaDeInteres: number | undefined;
  numeroDeCuentaNacional: string | undefined;
  numeroDeCuentaRegional: string | undefined;

  interesesGanadosDelMes: number;
  chequesCertificados: number;

  limiteDeSobregiro: number;
  sobregiroDisponible: number;
  interesesPorSobregiroNoPactado: number;
  limiteDeLineaDeTransito: number;
  lineaDeTransitoDisponible: number;
  totalDisponibleSobregiroYTransito: number;

  /**
   * El código interno de moneda del core (1 = pesos, 2 = dólares), que no es el
   * ISO 214/840 y que algunos endpoints de movimientos esperan en su lugar.
   */
  codigoInternoDeMoneda: string | undefined;
}

export function parseDetalleDeCuenta(
  crudo: unknown,
  contexto: {
    numeroDeCuenta: string;
    codigoMoneda: number;
    tipoDeCuenta: string;
  },
): DetalleDeCuenta {
  const fuente = comoObjeto(crudo);

  return {
    numeroDeCuenta: contexto.numeroDeCuenta,
    titular: aTexto(
      campo(fuente, 'accountHolderName', 'TITULARES', 'NOM_CLIENTE'),
    ),
    tipoDeCuenta: contexto.tipoDeCuenta,

    saldoDisponible: aNumero(
      campo(fuente, 'availableBalance', 'SAL_DISPONIBLE'),
    ),
    saldoTotal: aNumero(campo(fuente, 'totalBalance', 'SAL_TOTAL')),
    saldoRetenido: aNumero(campo(fuente, 'frozenBalance', 'SAL_CONGELADO')),
    saldoEmbargado: aNumero(campo(fuente, 'seizedBalance', 'SAL_EMBARGADO')),
    saldoEnTransito: aNumero(campo(fuente, 'transitBalance', 'SAL_TRANSITO')),

    codigoMoneda: contexto.codigoMoneda,
    // Sin estado se asume activa, igual que el original: una cuenta que el core
    // devuelve pero no califica es una cuenta en uso.
    estado: aTexto(campo(fuente, 'status', 'ESTADO'), 'A'),

    sucursal: textoOpcional(campo(fuente, 'branchName', 'SUCURSAL')),
    fechaDeApertura: fechaOpcional(campo(fuente, 'openDate', 'FEC_APERTURA')),
    fechaDelUltimoMovimiento: fechaOpcional(
      campo(fuente, 'lastMovementDate', 'FEC_ULT_MOVIMTO'),
    ),
    tasaDeInteres: numeroOpcional(
      campo(fuente, 'interestRate', 'TAE', 'NOMINALINTERESTRATE'),
    ),
    numeroDeCuentaNacional: textoOpcional(
      campo(fuente, 'nationalAccountNumber', 'NUM_CUENTA_NACIONAL'),
    ),
    numeroDeCuentaRegional: textoOpcional(
      campo(fuente, 'CUENTA_REGIONAL', 'regionalAccount'),
    ),

    interesesGanadosDelMes: aNumero(
      campo(fuente, 'interestEarnedMonth', 'INTERESES_GANADOS_MES'),
    ),
    chequesCertificados: aNumero(
      campo(fuente, 'certifiedChecks', 'CANT_CHK_CER'),
    ),

    limiteDeSobregiro: aNumero(
      campo(fuente, 'overdraftLimit', 'LIMITE_SOBREGIRO'),
    ),
    sobregiroDisponible: aNumero(
      campo(
        fuente,
        'overdraftAvailable',
        'MON_SOBGRO_DISP',
        'SOBREGIRO_DISPONIBLE',
      ),
    ),
    interesesPorSobregiroNoPactado: aNumero(
      campo(fuente, 'unagreedOverdraftInterest', 'INT_USO_SOB_NO_PAC'),
    ),
    limiteDeLineaDeTransito: aNumero(
      campo(fuente, 'transitLineLimit', 'LIM_LIN_TRANSITO'),
    ),
    lineaDeTransitoDisponible: aNumero(
      campo(fuente, 'transitLineAvailable', 'LIN_TRANSITO_DISP'),
    ),
    totalDisponibleSobregiroYTransito: aNumero(
      campo(fuente, 'totalOverdraftAndTransit', 'SOBREG_TOTAL_TRANSITO'),
    ),

    codigoInternoDeMoneda: textoOpcional(
      campo(fuente, 'COD_MONEDA', 'internalCurrencyCode'),
    ),
  };
}

/**
 * Si la cuenta tiene sobregiro o línea de tránsito que valga la pena mostrar.
 *
 * **Cuando no tiene ninguno, la tarjeta entera se oculta** en vez de imprimir
 * una columna de ceros. Casi ninguna cuenta de ahorros tiene sobregiro, así que
 * mostrarla siempre llenaría la pantalla de cifras en cero para la mayoría de
 * los clientes, y un cero junto a «límite de sobregiro» se lee como una
 * negativa del banco más que como una ausencia.
 */
export function tieneSobregiroOTransito(cuenta: DetalleDeCuenta): boolean {
  return (
    cuenta.limiteDeSobregiro > 0 ||
    cuenta.sobregiroDisponible > 0 ||
    cuenta.limiteDeLineaDeTransito > 0 ||
    cuenta.lineaDeTransitoDisponible > 0 ||
    cuenta.totalDisponibleSobregiroYTransito > 0 ||
    cuenta.interesesPorSobregiroNoPactado > 0
  );
}

/** Si el estado que manda el core significa «activa». */
export function estaActiva(cuenta: DetalleDeCuenta): boolean {
  const estado = cuenta.estado.toUpperCase().trim();
  return estado === 'A' || estado === 'ACTIVA' || estado === 'ACTIVE';
}

/** «Cuenta de Ahorros» o «Cuenta Corriente», con las mayúsculas del original. */
export function nombreDeLaCuenta(cuenta: DetalleDeCuenta): string {
  return cuenta.tipoDeCuenta === 'CA'
    ? 'Cuenta de Ahorros'
    : 'Cuenta Corriente';
}
