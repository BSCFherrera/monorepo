import {
  comoLista,
  comoObjeto,
  decimal,
  esVerdadero,
  leerResult,
  texto,
  textoOpcional,
} from '../../../core/network/envelopes';
import { codigoDeDocumento } from '../../beneficiaries/data/beneficiaryContracts';

/**
 * Contratos del flujo de transferencias.
 *
 * Portado de `transfer_entities.dart` y `transfer_remote_datasource.dart`.
 * Todos estos endpoints responden con `Result<T>` —`{ Value: … }`—, no con
 * `ApiResponse<T>`: son los que pasan por MediatR.
 */

// ─── Tipos de transferencia ─────────────────────────────────────────────────

export const TipoDeTransferencia = {
  CuentasPropias: 'cuentas-propias',
  Terceros: 'terceros',
  OtrosBancos: 'otros-bancos',
  Expresa: 'expresa',
  Internacional: 'internacional',
} as const;

export type TipoDeTransferencia =
  (typeof TipoDeTransferencia)[keyof typeof TipoDeTransferencia];

export interface DescripcionDeTipo {
  titulo: string;
  descripcion: string;
  icono: 'transfer' | 'people' | 'bank' | 'bolt' | 'globe';
}

/** Textos e iconos literales del original. */
export const TIPOS: Readonly<Record<TipoDeTransferencia, DescripcionDeTipo>> = {
  [TipoDeTransferencia.CuentasPropias]: {
    titulo: 'Entre Mis Cuentas',
    descripcion: 'Transfiere entre tus propias cuentas',
    icono: 'transfer',
  },
  [TipoDeTransferencia.Terceros]: {
    titulo: 'A Terceros (BSC)',
    descripcion: 'Cuentas de otros clientes del Banco Santa Cruz',
    icono: 'people',
  },
  [TipoDeTransferencia.OtrosBancos]: {
    titulo: 'A Otros Bancos',
    descripcion: 'Cuentas de otros bancos locales',
    icono: 'bank',
  },
  [TipoDeTransferencia.Expresa]: {
    titulo: 'Transferencia Expresa',
    descripcion: 'A una cuenta BSC sin registrarla',
    icono: 'bolt',
  },
  [TipoDeTransferencia.Internacional]: {
    titulo: 'Internacional',
    descripcion: 'A cuentas en el extranjero',
    icono: 'globe',
  },
};

/** El destino se elige de la lista de beneficiarios registrados. */
export function usaBeneficiario(tipo: TipoDeTransferencia): boolean {
  return (
    tipo === TipoDeTransferencia.Terceros ||
    tipo === TipoDeTransferencia.OtrosBancos ||
    tipo === TipoDeTransferencia.Internacional
  );
}

/** El destino se resuelve validando un número de cuenta contra el core. */
export function usaValidacionDeCuenta(tipo: TipoDeTransferencia): boolean {
  return (
    tipo === TipoDeTransferencia.CuentasPropias ||
    tipo === TipoDeTransferencia.Expresa
  );
}

/** Código de beneficiario que espera el backend (1/2/3), o nulo. */
export function codigoDeBeneficiario(tipo: TipoDeTransferencia): number | null {
  switch (tipo) {
    case TipoDeTransferencia.Terceros:
      return 1;
    case TipoDeTransferencia.OtrosBancos:
      return 2;
    case TipoDeTransferencia.Internacional:
      return 3;
    default:
      return null;
  }
}

/** El flujo que corresponde a un beneficiario ya registrado. */
export function tipoParaBeneficiario(
  codigo: number,
): TipoDeTransferencia | null {
  switch (codigo) {
    case 1:
      return TipoDeTransferencia.Terceros;
    case 2:
      return TipoDeTransferencia.OtrosBancos;
    case 3:
      return TipoDeTransferencia.Internacional;
    default:
      return null;
  }
}

/** `transactionSubType` de la ejecución: propias = 1, expresa = 2. */
export function subtipoDeTransaccion(tipo: TipoDeTransferencia): number | null {
  switch (tipo) {
    case TipoDeTransferencia.CuentasPropias:
      return 1;
    case TipoDeTransferencia.Expresa:
      return 2;
    default:
      return null;
  }
}

// ─── Validación de cuenta ───────────────────────────────────────────────────

export interface ClienteValidado {
  nombreCompleto: string;
  documentoTipo: string;
  documentoNumero: string;
  email: string | undefined;
  primerNombre: string | undefined;
  primerApellido: string | undefined;
}

export interface ProductoValidado {
  numero: string;
  tipo: string;
  moneda: string;
  primerNombre: string | undefined;
  primerApellido: string | undefined;
}

export interface CuentaValidada {
  cliente: ClienteValidado | null;
  producto: ProductoValidado | null;
}

export const SIN_VALIDAR: CuentaValidada = { cliente: null, producto: null };

export function esEnDolares(moneda: string): boolean {
  const codigo = moneda.trim().toUpperCase();
  return codigo === '840' || codigo === 'USD';
}

/**
 * Código numérico de documento que espera el backend.
 *
 * El core devuelve la palabra —`NationalId`, `RNC`— y a veces el número ya
 * hecho. Se reutiliza el traductor de beneficiarios para que **haya un solo
 * sitio** donde se decide que RNC es 2 y pasaporte 3: tenerlo en dos produjo
 * justamente el defecto de la oleada 4, donde el módulo de beneficiarios los
 * tenía cambiados y el de transferencias no.
 */
export function codigoDeDocumentoDelCliente(cliente: ClienteValidado): number {
  return codigoDeDocumento(cliente.documentoTipo) ?? 1;
}

export function parseCuentaValidada(cuerpo: unknown): CuentaValidada {
  const contenido = comoObjeto(leerResult(cuerpo));

  const crudoCliente = comoLista(contenido.Client ?? contenido.client)[0];
  const crudoProducto = comoLista(contenido.Products ?? contenido.products)[0];

  const cliente: ClienteValidado | null =
    crudoCliente === undefined
      ? null
      : {
          nombreCompleto: texto(
            crudoCliente,
            'CustomerFullName',
            'customerFullName',
          ),
          documentoTipo: texto(
            crudoCliente,
            'IdentificationType',
            'identificationType',
          ),
          documentoNumero: texto(
            crudoCliente,
            'IdentificationNumber',
            'identificationNumber',
          ),
          email: textoOpcional(crudoCliente, 'Email', 'email'),
          primerNombre: textoOpcional(crudoCliente, 'FirstName', 'firstName'),
          primerApellido: textoOpcional(crudoCliente, 'LastName', 'lastName'),
        };

  const producto: ProductoValidado | null =
    crudoProducto === undefined
      ? null
      : {
          numero: texto(crudoProducto, 'Number', 'number'),
          tipo: texto(crudoProducto, 'Type', 'type'),
          moneda: texto(crudoProducto, 'Currency', 'currency') || '214',
          primerNombre: textoOpcional(crudoProducto, 'FirstName', 'firstName'),
          primerApellido: textoOpcional(crudoProducto, 'LastName', 'lastName'),
        };

  return { cliente, producto };
}

// ─── Tasa de cambio ─────────────────────────────────────────────────────────

export interface CotizacionDeCambio {
  montoConvertido: number;
  tasa: string;
}

export function parseCotizacion(cuerpo: unknown): CotizacionDeCambio {
  const contenido = leerResult(cuerpo);
  const item = Array.isArray(contenido)
    ? comoObjeto(contenido[0])
    : comoObjeto(contenido);

  const montoConvertido = decimal(item, 'amountConverted', 'AmountConverted');
  const tasa = texto(item, 'exchangeRate', 'ExchangeRate');

  /*
    Se exige que venga al menos uno de los dos. Contar las claves del objeto no
    bastaba: `{ Value: null }` deja pasar el propio sobre, que tiene una clave y
    ningún dato, y seguir con una conversión en cero movería una cantidad
    equivocada. Aquí la transferencia se detiene, que es lo que debe pasar.
  */
  if (montoConvertido === undefined && tasa === '') {
    throw new Error('Respuesta de tasa de cambio inválida');
  }

  return { montoConvertido: montoConvertido ?? 0, tasa };
}

// ─── Comisiones ─────────────────────────────────────────────────────────────

export interface ComisionesDeTransferencia {
  comision: number;
  impuesto: number;
}

export const SIN_COMISIONES: ComisionesDeTransferencia = {
  comision: 0,
  impuesto: 0,
};

/**
 * Comisión e impuesto.
 *
 * El impuesto es el 0,15 % de la Norma 04-04 de la DGII, y lo calcula el
 * backend: aquí no se replica ninguna fórmula fiscal.
 *
 * **Que el resumen falle no bloquea la transferencia**: se muestran en cero,
 * igual que en el original, porque el core los cobra de todas formas y el
 * comprobante trae el valor real. Se anota como divergencia posible en el
 * paso de confirmación.
 */
export function parseComisiones(cuerpo: unknown): ComisionesDeTransferencia {
  const contenido = comoObjeto(leerResult(cuerpo));

  return {
    comision: decimal(contenido, 'commissionAmount', 'CommissionAmount') ?? 0,
    impuesto: decimal(contenido, 'taxAmount', 'TaxAmount') ?? 0,
  };
}

// ─── Resultado de la ejecución ──────────────────────────────────────────────

export interface ResultadoDeTransferencia {
  exito: boolean;
  mensaje: string;
  transaccionId: string;
  estadoId: string;
  comisionCobrada: number;
  tasaAplicada: number;
}

/**
 * Lee la respuesta de `POST /payment-execution/transfer`.
 *
 * El estado `'0'` es aplicada de inmediato y `'1'` es pendiente de aprobación.
 * **Las dos son éxito**, y confundir la segunda con un fallo haría que el
 * cliente reintentara una transferencia que ya está en curso, que es la peor
 * forma de equivocarse en esta pantalla.
 */
export function parseResultadoDeTransferencia(
  cuerpo: unknown,
): ResultadoDeTransferencia {
  const sobre = comoObjeto(cuerpo);
  const exitoDelSobre = esVerdadero(sobre.isSuccess ?? sobre.IsSuccess);
  const falloDelSobre = esVerdadero(sobre.isFailure ?? sobre.IsFailure);

  const item = comoObjeto(leerResult(cuerpo));
  const hayContenido = Object.keys(item).length > 0 && item !== sobre;

  const estadoId = texto(item, 'backendStatusId', 'BackendStatusId');
  const transaccionId = texto(
    item,
    'backendTransactionId',
    'BackendTransactionId',
  );

  const mensaje =
    textoOpcional(item, 'backendMessage', 'BackendMessage') ??
    textoOpcional(item, 'backendStatusDescription', 'BackendStatusDescription');

  const estadoBueno = estadoId === '0' || estadoId === '00' || estadoId === '1';
  const exito =
    !falloDelSobre && (exitoDelSobre || estadoBueno) && hayContenido;

  if (!exito) {
    const error = textoOpcional(sobre, 'error', 'Error', 'detail', 'Detail');
    return {
      exito: false,
      mensaje: mensaje ?? error ?? 'No se pudo procesar la transferencia.',
      transaccionId,
      estadoId,
      comisionCobrada: 0,
      tasaAplicada: 0,
    };
  }

  return {
    exito: true,
    mensaje: mensaje ?? 'Transferencia realizada satisfactoriamente.',
    transaccionId,
    estadoId,
    comisionCobrada:
      decimal(
        item,
        'backendTransactionCommission',
        'BackendTransactionCommission',
      ) ?? 0,
    tasaAplicada:
      decimal(item, 'backendTransactionRate', 'BackendTransactionRate') ?? 0,
  };
}

/** El estado «1» significa que el core la dejó pendiente de aprobación. */
export function quedaPendienteDeAprobacion(
  resultado: ResultadoDeTransferencia,
): boolean {
  return resultado.exito && resultado.estadoId === '1';
}
