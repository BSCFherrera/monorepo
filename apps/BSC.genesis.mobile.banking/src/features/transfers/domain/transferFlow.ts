import type { Producto } from '../../dashboard/data/productContracts';
import {
  cuentaEnmascarada,
  nombreVisible,
  simboloDeMoneda,
  type Beneficiario,
} from '../../beneficiaries/data/beneficiaryContracts';
import {
  codigoDeDocumentoDelCliente,
  esEnDolares,
  subtipoDeTransaccion,
  TipoDeTransferencia,
  usaBeneficiario,
  type ComisionesDeTransferencia,
  type CotizacionDeCambio,
  type CuentaValidada,
  type TipoDeTransferencia as Tipo,
} from '../data/transferContracts';
import type { OrdenDeTransferencia } from '../data/transferRepository';

/**
 * Las cuentas y los importes del asistente, **sin pantalla y sin red**.
 *
 * Portado de `transfer_state.dart` y de la parte de `transfer_bloc.dart` que
 * calcula. Vive aparte de la pantalla por la misma razón por la que
 * `signingOutcome.ts` vive aparte del puente nativo: aquí es donde se decide
 * cuánto dinero se debita y con qué moneda se firma, y eso tiene que poder
 * probarse sin montar una interfaz ni levantar un backend.
 */

export interface DatosDelAsistente {
  tipo: Tipo;
  origen: Producto | null;
  /** Destino en los flujos entre cuentas propias. */
  destinoPropio: Producto | null;
  beneficiario: Beneficiario | null;
  /** Destino resuelto validando un número, en los flujos expreso y propio. */
  validacion: CuentaValidada;
  monto: number;
  comentario: string;
  cotizacion: CotizacionDeCambio | null;
  comisiones: ComisionesDeTransferencia;
}

// ─── Moneda y cuentas ───────────────────────────────────────────────────────

export function monedaDelOrigen(datos: DatosDelAsistente): number {
  return datos.origen?.codigoMoneda === 840 ? 840 : 214;
}

export function monedaDelDestino(datos: DatosDelAsistente): number {
  if (usaBeneficiario(datos.tipo)) {
    return datos.beneficiario !== null &&
      esEnDolares(datos.beneficiario.codigoMoneda)
      ? 840
      : 214;
  }

  const producto = datos.validacion.producto;
  return producto !== null && esEnDolares(producto.moneda) ? 840 : 214;
}

export function hayDestino(datos: DatosDelAsistente): boolean {
  return usaBeneficiario(datos.tipo)
    ? datos.beneficiario !== null
    : datos.validacion.producto !== null;
}

export function cuentaDeDestino(datos: DatosDelAsistente): string {
  if (usaBeneficiario(datos.tipo))
    return datos.beneficiario?.numeroDeCuenta ?? '';
  return datos.validacion.producto?.numero ?? '';
}

export function nombreDelDestino(datos: DatosDelAsistente): string {
  if (usaBeneficiario(datos.tipo)) {
    return datos.beneficiario === null ? '' : nombreVisible(datos.beneficiario);
  }

  const cliente = datos.validacion.cliente;
  if (cliente !== null && cliente.nombreCompleto !== '') {
    return cliente.nombreCompleto;
  }

  const producto = datos.validacion.producto;
  return [producto?.primerNombre, producto?.primerApellido]
    .filter((parte): parte is string => parte !== undefined && parte !== '')
    .join(' ');
}

export function destinoEnmascarado(datos: DatosDelAsistente): string {
  const numero = cuentaDeDestino(datos);
  return numero.length <= 4 ? numero : `****${numero.slice(-4)}`;
}

export function bancoDelDestino(datos: DatosDelAsistente): string | undefined {
  return datos.beneficiario?.banco;
}

export function simboloDelDestino(datos: DatosDelAsistente): string {
  return monedaDelDestino(datos) === 840 ? 'US$' : 'RD$';
}

export function simboloDelOrigen(datos: DatosDelAsistente): string {
  return monedaDelOrigen(datos) === 840 ? 'US$' : 'RD$';
}

/** `CA` o `CC`, que es lo que el backend llama tipo de producto de débito. */
export function tipoDeProductoOrigen(datos: DatosDelAsistente): string {
  return datos.origen?.categoria === 'CC' ? 'CC' : 'CA';
}

/** Para el resumen de comisiones: corriente = 1, ahorro = 2. */
export function tipoOrigenParaComisiones(datos: DatosDelAsistente): number {
  return datos.origen?.categoria === 'CC' ? 1 : 2;
}

export function tipoDestinoParaComisiones(datos: DatosDelAsistente): number {
  if (usaBeneficiario(datos.tipo)) return 2;
  return datos.validacion.producto?.tipo === 'CC' ? 1 : 2;
}

// ─── Importes ───────────────────────────────────────────────────────────────

/**
 * Hace falta convertir cuando origen y destino no comparten moneda.
 *
 * Pedir la cotización igual devolvería una tasa de uno, que no significa nada,
 * y haría más lenta la pantalla que el cliente sí ve.
 */
export function necesitaConversion(datos: DatosDelAsistente): boolean {
  return (
    hayDestino(datos) && monedaDelOrigen(datos) !== monedaDelDestino(datos)
  );
}

/** Lo que llega al destino: es el monto que el cliente escribió. */
export function montoAAcreditar(datos: DatosDelAsistente): number {
  return datos.monto;
}

/** Lo que sale de la cuenta de origen, convertido si hace falta. */
export function montoADebitar(datos: DatosDelAsistente): number {
  if (!necesitaConversion(datos)) return datos.monto;
  return datos.cotizacion?.montoConvertido ?? datos.monto;
}

/**
 * Todo lo que se va de la cuenta: el monto convertido más comisión e impuesto.
 *
 * **Es también el monto de la transacción**, por decisión del banco.
 *
 * Era la divergencia más cara de la oleada 5: el portal cobra `totalDebited`
 * —monto más comisión e impuesto— y la app Flutter cobraba solo el monto. Dos
 * respuestas distintas a «cuánto se debita», y la diferencia es dinero real. El
 * banco resolvió **seguir al portal**, así que aquí se diverge del original a
 * propósito y la divergencia queda anotada en el CHANGELOG.
 *
 * La consecuencia sobre la huella es automática y esa es la gracia del diseño:
 * la huella se deriva del cuerpo, el cuerpo lleva este valor en
 * `transactionAmount`, y el backend recalcula sobre `command.transactionAmount`.
 * No hay un segundo sitio que actualizar ni forma de que los dos se separen.
 */
export function totalDebitado(datos: DatosDelAsistente): number {
  return (
    montoADebitar(datos) + datos.comisiones.comision + datos.comisiones.impuesto
  );
}

/** Se puede pasar al paso de confirmación. */
export function puedeContinuar(datos: DatosDelAsistente): boolean {
  return datos.origen !== null && hayDestino(datos) && datos.monto > 0;
}

// ─── Documento para el resumen de comisiones ────────────────────────────────

/**
 * Tipo y número de documento que pide el resumen de comisiones.
 *
 * En una internacional el original manda siempre 4, sin mirar el beneficiario.
 * Y un número que es todo ceros se envía vacío: el core lo rechaza y lo trata
 * como ausente de todas formas.
 */
export function documentoParaComisiones(datos: DatosDelAsistente): {
  tipo: number;
  numero: string;
} {
  if (usaBeneficiario(datos.tipo)) {
    const tipo =
      datos.tipo === TipoDeTransferencia.Internacional
        ? 4
        : datos.beneficiario?.documentoTipo ?? 1;
    return { tipo, numero: limpio(datos.beneficiario?.documentoNumero) };
  }

  const cliente = datos.validacion.cliente;
  return {
    tipo: cliente === null ? 1 : codigoDeDocumentoDelCliente(cliente),
    numero: limpio(cliente?.documentoNumero),
  };
}

function limpio(numero: string | undefined): string {
  if (numero === undefined || numero === '') return '';
  return /^0+$/.test(numero) ? '' : numero;
}

// ─── La orden que se ejecuta ────────────────────────────────────────────────

/**
 * Traduce el estado del asistente a la orden que se firma y se envía.
 *
 * **Es la única traducción**, y por eso la huella se puede calcular sobre su
 * resultado: no hay forma de que la pantalla firme una cosa y envíe otra.
 */
export function ordenDeLaTransferencia(
  datos: DatosDelAsistente,
): OrdenDeTransferencia {
  const conBeneficiario = usaBeneficiario(datos.tipo);

  return {
    cuentaOrigen: datos.origen?.identificacion ?? '',
    tipoDeProductoOrigen: tipoDeProductoOrigen(datos),
    cuentaDestino: cuentaDeDestino(datos),
    /*
      **El monto que el cliente pidió mover, sin comisión y sin impuesto.**

      El core calcula el impuesto de forma intrínseca y lo cobra en un
      movimiento aparte, así que interpreta este campo como el monto a
      transferir. Mandarle el total hace dos daños a la vez: el beneficiario
      recibe de más y el impuesto se recalcula sobre la cifra inflada. Medido
      en cuentas reales el 2026-09-17: una transferencia de RD$ 100.00 acreditó
      100.15 al destino y debitó 100.30 del origen.

      El «Total debitado» que el cliente lee en la confirmación y en el
      comprobante sale de `totalDebitado(datos)` y es **informativo**: le dice
      cuánto saldrá de su cuenta cuando el core aplique lo suyo. Enviar y
      mostrar son dos cosas distintas y conviene no volver a unirlas.
    */
    monto: montoADebitar(datos),
    monedaOrigen: monedaDelOrigen(datos),
    monedaDestino: monedaDelDestino(datos),
    comentario: datos.comentario === '' ? undefined : datos.comentario,
    beneficiarioId: conBeneficiario
      ? datos.beneficiario?.id ?? undefined
      : undefined,
    subtipo: conBeneficiario ? null : subtipoDeTransaccion(datos.tipo),
    ...(conBeneficiario ? {} : destinoSinBeneficiario(datos)),
  };
}

/**
 * El cliente y el producto de destino que el core pide en los flujos sin
 * beneficiario. Se componen con lo que devolvió la validación de cuenta.
 */
function destinoSinBeneficiario(datos: DatosDelAsistente): {
  clienteDestino?: Record<string, unknown>;
  productoDestino?: Record<string, unknown>;
} {
  const cliente = datos.validacion.cliente;
  const producto = datos.validacion.producto;

  const resultado: {
    clienteDestino?: Record<string, unknown>;
    productoDestino?: Record<string, unknown>;
  } = {};

  if (cliente !== null) {
    const nombre = producto?.primerNombre ?? '';
    const apellido = producto?.primerApellido ?? '';

    resultado.clienteDestino = {
      identificationType: String(codigoDeDocumentoDelCliente(cliente)),
      identificationNumber: cliente.documentoNumero,
      customerFullName: cliente.nombreCompleto,
      customerShortName: nombre !== '' ? nombre : cliente.nombreCompleto,
      firstName: nombre,
      lastName: apellido,
      email: cliente.email ?? '',
      relationship: 'TITULAR',
    };
  }

  if (producto !== null) {
    const moneda = esEnDolares(producto.moneda) ? '840' : '214';

    resultado.productoDestino = {
      number: producto.numero,
      type: producto.tipo,
      status: 'ACTIVE',
      currency: moneda,
      currencyDescription: moneda === '214' ? 'Dominican Peso' : 'US Dollar',
      hasTwoBalances: 'N',
      firstName: producto.primerNombre ?? '',
      lastName: producto.primerApellido ?? '',
    };
  }

  return resultado;
}

// ─── Presentación de un beneficiario en el selector ─────────────────────────

export function lineaDeBeneficiario(beneficiario: Beneficiario): string {
  const cuenta = cuentaEnmascarada(beneficiario);
  return beneficiario.banco === undefined
    ? cuenta
    : `${cuenta} · ${beneficiario.banco}`;
}

export function simboloDeBeneficiario(beneficiario: Beneficiario): string {
  return simboloDeMoneda(beneficiario);
}
