import type { Producto } from '../../dashboard/data/productContracts';
import {
  montosEnMoneda,
  type DetalleDeTarjeta,
} from '../../productDetail/data/creditCardDetailContracts';
import type {
  OrdenDePagoDePrestamo,
  OrdenDePagoDeTarjeta,
} from '../data/paymentRepository';
import {
  ETIQUETAS_DE_MONTO,
  SIN_COMISIONES_DE_PAGO,
  TipoDeMonto,
  TipoDePago,
  type ComisionesDePago,
} from '../data/paymentContracts';

/**
 * Los importes y las opciones del asistente de pagos, sin pantalla y sin red.
 *
 * Portado de `payment_state.dart` y de la parte de `payment_bloc.dart` que
 * calcula. La regla que más cuesta de este archivo es que **una tarjeta lleva
 * dos ciclos a la vez**, uno en pesos y otro en dólares, y que cada uno tiene
 * su propio mínimo, su propio balance al corte y su propio balance a la fecha:
 * el selector de moneda no cambia una etiqueta, cambia los tres montos.
 */

export interface DatosDelPago {
  tipo: TipoDePago;
  producto: Producto | null;
  cuentaOrigen: Producto | null;
  /** «DOP» o «USD»: el ciclo de la tarjeta que se está pagando. */
  moneda: 'DOP' | 'USD';
  /**
   * El detalle de la tarjeta que se va a pagar, cuando ya llegó.
   *
   * **D-26**: el listado de productos entrega los dos pagos mínimos cambiados
   * de moneda y el detalle es el coherente. El dato viene así desde el core y
   * no se puede corregir desde el canal (P-03), así que el banco decidió que
   * el asistente pida el detalle de la tarjeta y use su cifra. Es nulo
   * mientras la petición viaja, y entonces se cae al listado: enseñar la cifra
   * vieja un instante es preferible a dejar el asistente en blanco.
   */
  detalleDeLaTarjeta: DetalleDeTarjeta | null;
  tipoDeMonto: TipoDeMonto;
  montoEscrito: number;
  comentario: string;
  cotizacion: { montoConvertido: number; tasa: string } | null;
  comisiones: ComisionesDePago;
}

export function esPrestamo(datos: DatosDelPago): boolean {
  return datos.tipo === TipoDePago.Prestamo;
}

// ─── Monedas ────────────────────────────────────────────────────────────────

/**
 * Moneda en la que se paga.
 *
 * Un préstamo se paga **siempre en su moneda**: no hay selector, porque el core
 * no acepta abonar una cuota en pesos a un préstamo en dólares.
 */
export function monedaDelPago(datos: DatosDelPago): 'DOP' | 'USD' {
  if (esPrestamo(datos)) {
    return datos.producto?.codigoMoneda === 840 ? 'USD' : 'DOP';
  }
  return datos.moneda;
}

export function codigoDeMonedaDelPago(datos: DatosDelPago): number {
  return monedaDelPago(datos) === 'USD' ? 840 : 214;
}

export function codigoDeMonedaDeLaCuenta(datos: DatosDelPago): number {
  return datos.cuentaOrigen?.codigoMoneda === 840 ? 840 : 214;
}

export function necesitaConversion(datos: DatosDelPago): boolean {
  return (
    datos.cuentaOrigen !== null &&
    codigoDeMonedaDelPago(datos) !== codigoDeMonedaDeLaCuenta(datos)
  );
}

/** Una tarjeta con movimiento en dólares ofrece los dos ciclos. */
export function esTarjetaMultimoneda(datos: DatosDelPago): boolean {
  const tarjeta = datos.producto;
  if (tarjeta === null || esPrestamo(datos)) return false;

  return (
    tarjeta.saldoDolares > 0 ||
    tarjeta.pagoMinimoDolares > 0 ||
    tarjeta.disponibleDolares > 0
  );
}

// ─── Montos ─────────────────────────────────────────────────────────────────

export function pagoMinimo(datos: DatosDelPago): number {
  if (esPrestamo(datos)) return 0;

  const tarjeta = datos.producto;
  if (tarjeta === null) return 0;

  // El detalle manda cuando está (D-26).
  if (datos.detalleDeLaTarjeta !== null) {
    return montosEnMoneda(
      datos.detalleDeLaTarjeta,
      datos.moneda === 'USD' ? 840 : 214,
    ).pagoMinimo;
  }

  return datos.moneda === 'USD'
    ? tarjeta.pagoMinimoDolares
    : tarjeta.pagoMinimoPesos;
}

/**
 * Balance al corte.
 *
 * El contrato de productos no trae un campo propio para el balance del ciclo
 * cerrado, así que se usa el saldo de la tarjeta, que es lo que hace el
 * original cuando el core no manda el del corte por separado.
 */
export function balanceAlCorte(datos: DatosDelPago): number {
  const tarjeta = datos.producto;
  if (tarjeta === null) return 0;
  return datos.moneda === 'USD' ? tarjeta.saldoDolares : tarjeta.saldoPesos;
}

export function balanceALaFecha(datos: DatosDelPago): number {
  const tarjeta = datos.producto;
  if (tarjeta === null) return 0;
  return datos.moneda === 'USD' ? tarjeta.saldoDolares : tarjeta.saldoPesos;
}

/**
 * El saldo que le queda al producto pagado.
 *
 * El comprobante del original lo enseña en la fila de la tarjeta o el préstamo,
 * y lo calcula como el balance menos **el monto del pago**, no menos el total
 * debitado: la comisión y el impuesto salen de la cuenta de origen, no se
 * aplican al producto.
 */
export function nuevoSaldoDelProducto(datos: DatosDelPago): number {
  if (datos.producto === null) return 0;
  return balanceALaFecha(datos) - montoDelPago(datos);
}

export function cuotaDelPrestamo(datos: DatosDelPago): number {
  // El detalle del préstamo trae la cuota; en la lista de productos el core
  // solo manda el saldo, así que el asistente parte de «otro monto» cuando no
  // la conoce. Enseñar cero como cuota sería inventarla.
  return datos.producto?.pagoMinimoPesos ?? 0;
}

/** Lo que se paga, en la moneda del pago y antes de comisiones. */
export function montoDelPago(datos: DatosDelPago): number {
  if (esPrestamo(datos)) {
    return datos.tipoDeMonto === TipoDeMonto.Cuota
      ? cuotaDelPrestamo(datos)
      : datos.montoEscrito;
  }

  switch (datos.tipoDeMonto) {
    case TipoDeMonto.Minimo:
      return pagoMinimo(datos);
    case TipoDeMonto.AlCorte:
      return balanceAlCorte(datos);
    case TipoDeMonto.ALaFecha:
      return balanceALaFecha(datos);
    default:
      return datos.montoEscrito;
  }
}

/** El monto ya convertido a la moneda de la cuenta, si hace falta. */
export function montoADebitar(datos: DatosDelPago): number {
  if (!necesitaConversion(datos)) return montoDelPago(datos);
  return datos.cotizacion?.montoConvertido ?? montoDelPago(datos);
}

/** Un préstamo no paga comisión ni impuesto: el original devuelve cero. */
export function comisionDelPago(datos: DatosDelPago): number {
  return esPrestamo(datos) ? 0 : datos.comisiones.comision;
}

export function impuestoDelPago(datos: DatosDelPago): number {
  return esPrestamo(datos) ? 0 : datos.comisiones.impuesto;
}

export function totalDebitado(datos: DatosDelPago): number {
  return montoADebitar(datos) + comisionDelPago(datos) + impuestoDelPago(datos);
}

export function puedeContinuar(datos: DatosDelPago): boolean {
  return (
    datos.producto !== null &&
    datos.cuentaOrigen !== null &&
    montoDelPago(datos) > 0
  );
}

// ─── Opciones de monto que se ofrecen ───────────────────────────────────────

export interface OpcionDeMonto {
  tipo: TipoDeMonto;
  etiqueta: string;
  monto: number;
  /** «Otro monto» no tiene cifra: la escribe el cliente. */
  editable: boolean;
}

/**
 * Las opciones que tienen sentido para este producto.
 *
 * **Una opción en cero no se ofrece.** Es la decisión que separa esta pantalla
 * de una que confunde: un «Pago Mínimo RD$ 0.00» en una tarjeta de contado
 * parece que no hay nada que pagar, cuando lo que pasa es que esa tarjeta no
 * tiene mínimo y hay que saldar el total del ciclo. Es el mismo caso que ya
 * apareció en la oleada 3.
 */
export function opcionesDeMonto(datos: DatosDelPago): OpcionDeMonto[] {
  if (esPrestamo(datos)) {
    const cuota = cuotaDelPrestamo(datos);

    return [
      ...(cuota > 0
        ? [
            {
              tipo: TipoDeMonto.Cuota,
              etiqueta: ETIQUETAS_DE_MONTO[TipoDeMonto.Cuota],
              monto: cuota,
              editable: false,
            },
          ]
        : []),
      {
        tipo: TipoDeMonto.Otro,
        etiqueta: ETIQUETAS_DE_MONTO[TipoDeMonto.Otro],
        monto: datos.montoEscrito,
        editable: true,
      },
    ];
  }

  const candidatas: Array<{ tipo: TipoDeMonto; monto: number }> = [
    { tipo: TipoDeMonto.Minimo, monto: pagoMinimo(datos) },
    { tipo: TipoDeMonto.AlCorte, monto: balanceAlCorte(datos) },
  ];

  return [
    ...candidatas
      .filter(c => c.monto > 0)
      .map(c => ({
        tipo: c.tipo,
        etiqueta: ETIQUETAS_DE_MONTO[c.tipo],
        monto: c.monto,
        editable: false,
      })),
    {
      tipo: TipoDeMonto.Otro,
      etiqueta: ETIQUETAS_DE_MONTO[TipoDeMonto.Otro],
      monto: datos.montoEscrito,
      editable: true,
    },
  ];
}

/** La primera opción con monto, o «otro» si ninguna lo tiene. */
export function primeraOpcionValida(datos: DatosDelPago): TipoDeMonto {
  const opciones = opcionesDeMonto(datos);
  return opciones[0]?.tipo ?? TipoDeMonto.Otro;
}

// ─── Presentación ───────────────────────────────────────────────────────────

export function nombreDelProducto(datos: DatosDelPago): string {
  if (datos.producto === null) return '';
  return esPrestamo(datos) ? 'Préstamo' : 'Tarjeta de Crédito';
}

/** El número enmascarado, que es lo que se le enseña al cliente. */
export function numeroVisible(datos: DatosDelPago): string {
  const producto = datos.producto;
  if (producto === null) return '';

  if (producto.numeroEnmascarado !== undefined)
    return producto.numeroEnmascarado;

  const numero = producto.identificacion;
  return numero.length <= 4 ? numero : `****${numero.slice(-4)}`;
}

/**
 * La cuenta de origen enmascarada, para la fila del comprobante.
 *
 * El original enseña `maskedNumber` de la cuenta seleccionada; aquí se deriva
 * igual que el número del producto, con los cuatro últimos dígitos.
 */
export function cuentaDeOrigenEnmascarada(datos: DatosDelPago): string {
  const cuenta = datos.cuentaOrigen;
  if (cuenta === null) return '';

  const numero = cuenta.identificacion;
  return numero.length <= 4 ? numero : `****${numero.slice(-4)}`;
}

export function nombreDeLaCuenta(datos: DatosDelPago): string {
  return datos.cuentaOrigen?.categoria === 'CC'
    ? 'Cuenta Corriente'
    : 'Cuenta de Ahorros';
}

/** Ahorro = 2, corriente = 1, como los espera el core. */
export function tipoDeCuentaOrigen(datos: DatosDelPago): number {
  return datos.cuentaOrigen?.categoria === 'CA' ? 2 : 1;
}

export function saldoDeLaCuenta(datos: DatosDelPago): number {
  const cuenta = datos.cuentaOrigen;
  if (cuenta === null) return 0;
  return cuenta.saldoDisponible !== 0
    ? cuenta.saldoDisponible
    : cuenta.saldoActual;
}

// ─── La orden que se ejecuta ────────────────────────────────────────────────

/**
 * La orden de pago de una tarjeta.
 *
 * **El número que viaja es el completo**, no el enmascarado: el core no sabe
 * resolver `4539********0668`, y el backend recalcula la huella sobre este
 * mismo campo.
 */
export function ordenDeTarjeta(
  datos: DatosDelPago,
  customerCode: string,
): OrdenDePagoDeTarjeta {
  return {
    numeroDeTarjeta: datos.producto?.identificacion ?? '',
    cuentaOrigen: datos.cuentaOrigen?.identificacion ?? '',
    /*
      **El monto del pago, sin comisión ni impuesto.** El core los calcula y
      los cobra en un movimiento aparte, y el BFF ni siquiera se los reenvía:
      al core le llega solo `paymentAmount`. Sumárselos aplicaría de más a la
      tarjeta y haría que el impuesto se recalculara sobre la cifra inflada.
      El total con cargos se le enseña al cliente, no se envía.
    */
    monto: montoADebitar(datos),
    monedaDelPago: codigoDeMonedaDelPago(datos),
    customerCode,
    comentario: datos.comentario === '' ? undefined : datos.comentario,
    tipoDeCuentaOrigen: tipoDeCuentaOrigen(datos),
    nombreDeCuentaOrigen: nombreDeLaCuenta(datos),
    monedaDeCuentaOrigen: codigoDeMonedaDeLaCuenta(datos),
    nombreDeLaTarjeta: nombreDelProducto(datos),
    ...(necesitaConversion(datos)
      ? {
          montoConvertido: montoADebitar(datos),
          monedaConvertida: codigoDeMonedaDeLaCuenta(datos),
          ...(datos.cotizacion !== null ? { tasa: datos.cotizacion.tasa } : {}),
        }
      : {}),
    comision: comisionDelPago(datos),
    impuesto: impuestoDelPago(datos),
  };
}

export function ordenDePrestamo(
  datos: DatosDelPago,
  customerCode: string,
): OrdenDePagoDePrestamo {
  const esCuota = datos.tipoDeMonto === TipoDeMonto.Cuota;

  return {
    numeroDePrestamo: datos.producto?.identificacion ?? '',
    cuentaOrigen: datos.cuentaOrigen?.identificacion ?? '',
    // El monto del pago, por la misma razón que en la tarjeta: el impuesto lo
    // aplica el core aparte. Hoy los préstamos no cobran comisión ni impuesto,
    // así que las dos cifras coinciden; el día que cobren, esto ya está bien.
    monto: montoADebitar(datos),
    moneda: codigoDeMonedaDelPago(datos),
    customerCode,
    // El original manda 1 al pagar la cuota y 0 en cualquier otro monto.
    numeroDeCuota: esCuota ? 1 : 0,
    // 1 es cuota y 2 abono a capital.
    tipoDePago: esCuota ? 1 : 2,
  };
}

/** Un asistente recién abierto. */
export function pagoVacio(tipo: TipoDePago): DatosDelPago {
  return {
    tipo,
    producto: null,
    cuentaOrigen: null,
    moneda: 'DOP',
    detalleDeLaTarjeta: null,
    tipoDeMonto:
      tipo === TipoDePago.Prestamo ? TipoDeMonto.Cuota : TipoDeMonto.Minimo,
    montoEscrito: 0,
    comentario: '',
    cotizacion: null,
    comisiones: SIN_COMISIONES_DE_PAGO,
  };
}
