import { CURRENCY } from '@bsc/shared';

import type { Producto, ProductosAgrupados } from './productContracts';

/**
 * Resumen patrimonial del cliente.
 *
 * Portado de `_calculateBalanceSummary` en `dashboard_bloc.dart`. Está aquí, en
 * su propio archivo y como función pura, y no dentro de la pantalla: es una
 * regla de negocio —qué cuenta como activo y qué como deuda— y merece prueba
 * propia. En Flutter vivía dentro del BLoC, mezclada con el manejo de la
 * petición, y por eso no tenía ninguna.
 */

export interface ResumenDeBalance {
  /** Lo que el cliente tiene: cuentas y certificados. */
  activosPesos: number;
  activosDolares: number;

  /** Lo que el cliente debe: tarjetas y préstamos. */
  pasivosPesos: number;
  pasivosDolares: number;

  /** Tasa usada para expresar todo en pesos. */
  tasaDolar: number;

  /**
   * Si la tasa vino del servicio del día o es la de respaldo.
   *
   * La tarjeta «Tu balance» lo dice en voz alta: un total consolidado con una
   * tasa vieja no debe parecerse a uno consolidado con la del día.
   */
  usaTasaDelDia: boolean;

  /** Activos y pasivos ya consolidados a pesos. */
  activosTotalesPesos: number;
  pasivosTotalesPesos: number;

  /** Activos menos pasivos, todo convertido a pesos. */
  patrimonioNetoPesos: number;

  /** Qué proporción del total consolidado son activos, de 0 a 100. */
  porcentajeActivos: number;

  // ─── Lo que la cabecera muestra ─────────────────────────────────────────
  //
  // **«Tu dinero disponible» no es el patrimonio neto**, y confundirlos cambia
  // el número más grande de la app. Comparando contra la app Flutter con el
  // mismo cliente, su cifra sale de sumar dos cosas concretas:
  //
  //   Cuentas (solo cuentas, sin certificados) + Crédito disponible
  //
  // Los certificados quedan fuera porque el cliente no puede disponer de ellos
  // sin cancelarlos, y el crédito **suma** en vez de restar porque es poder de
  // compra, no deuda. Un primer porte trató el crédito como pasivo y los
  // certificados como disponible, y el total salió cinco veces más alto.

  /** Saldo disponible en cuentas corrientes y de ahorro, en pesos. */
  cuentasPesos: number;

  /** Crédito disponible en tarjetas, en pesos. */
  creditoDisponiblePesos: number;

  /** Lo que la cabecera anuncia: cuentas más crédito disponible. */
  disponibleTotalPesos: number;

  /**
   * El mismo criterio en dólares, para el chip: cuentas en dólares más el
   * crédito disponible en dólares de las tarjetas. No es `activosDolares`,
   * que incluye certificados y no incluye crédito.
   */
  disponibleDolares: number;
}

/**
 * Tasa de respaldo cuando no hay tasa del día.
 *
 * Coincide con la que usa `operationRisk` para clasificar operaciones en
 * dólares. Si las dos se separaran, una transferencia podría clasificarse con
 * una tasa y mostrarse con otra.
 */
export const TASA_DOLAR_RESPALDO = 59.5;

const esPeso = (producto: Producto): boolean =>
  producto.codigoMoneda === CURRENCY.DOP;

/**
 * Saldo que se muestra de una cuenta.
 *
 * El disponible es lo que el cliente puede usar; el actual incluye fondos
 * retenidos. Si el core no manda disponible, se cae al actual en vez de mostrar
 * cero — un saldo en cero es la clase de error que hace llamar al banco.
 */
function saldoDeCuenta(producto: Producto): number {
  return producto.saldoDisponible !== 0
    ? producto.saldoDisponible
    : producto.saldoActual;
}

/**
 * @param tasaDolar Tasa de venta del día, o `null` si el servicio no la dio.
 *   Se distingue del respaldo a propósito: la pantalla lo advierte.
 */
export function calcularResumen(
  productos: ProductosAgrupados,
  tasaDolar: number | null = null,
): ResumenDeBalance {
  let activosPesos = 0;
  let activosDolares = 0;
  let pasivosPesos = 0;
  let pasivosDolares = 0;

  // ─── Activos: cuentas y certificados ────────────────────────────────────
  for (const cuenta of productos.cuentas) {
    const saldo = saldoDeCuenta(cuenta);
    if (esPeso(cuenta)) activosPesos += saldo;
    else activosDolares += saldo;
  }

  for (const certificado of productos.certificados) {
    if (esPeso(certificado)) activosPesos += certificado.saldoActual;
    else activosDolares += certificado.saldoActual;
  }

  // ─── Pasivos: tarjetas y préstamos ──────────────────────────────────────
  //
  // Una tarjeta lleva saldo en las dos monedas a la vez, así que sus dos campos
  // se suman cada uno a su lado. No es como una cuenta, que es de una moneda.
  for (const tarjeta of productos.tarjetas) {
    pasivosPesos += tarjeta.saldoPesos;
    pasivosDolares += tarjeta.saldoDolares;
  }

  for (const prestamo of productos.prestamos) {
    // El saldo pendiente es lo que falta por pagar. Si el core no lo manda, se
    // usa el saldo actual.
    const deuda =
      prestamo.saldoPendiente !== 0
        ? prestamo.saldoPendiente
        : prestamo.saldoActual;

    if (esPeso(prestamo)) pasivosPesos += deuda;
    else pasivosDolares += deuda;
  }

  const usaTasaDelDia = tasaDolar !== null && tasaDolar > 0;
  const tasa = usaTasaDelDia ? tasaDolar : TASA_DOLAR_RESPALDO;

  const activosTotales = activosPesos + activosDolares * tasa;
  const pasivosTotales = pasivosPesos + pasivosDolares * tasa;

  // ─── Lo que la cabecera anuncia ─────────────────────────────────────────
  //
  // Solo cuentas en pesos: los certificados no son dinero del que el cliente
  // pueda disponer sin cancelarlos, y los saldos en dólares van en su propio
  // chip, no sumados aquí.
  let cuentasPesos = 0;
  for (const cuenta of productos.cuentas) {
    if (esPeso(cuenta)) cuentasPesos += saldoDeCuenta(cuenta);
  }

  // El crédito disponible **suma**: es poder de compra, no deuda.
  let creditoDisponiblePesos = 0;
  for (const tarjeta of productos.tarjetas) {
    creditoDisponiblePesos += tarjeta.disponiblePesos;
  }

  // El chip de dólares sigue el mismo criterio que el total en pesos: cuentas
  // más crédito, sin certificados.
  let disponibleDolares = 0;
  for (const cuenta of productos.cuentas) {
    if (!esPeso(cuenta)) disponibleDolares += saldoDeCuenta(cuenta);
  }
  for (const tarjeta of productos.tarjetas) {
    disponibleDolares += tarjeta.disponibleDolares;
  }

  const totalConsolidado = activosTotales + pasivosTotales;

  return {
    activosPesos,
    activosDolares,
    pasivosPesos,
    pasivosDolares,
    tasaDolar: tasa,
    usaTasaDelDia,
    activosTotalesPesos: activosTotales,
    pasivosTotalesPesos: pasivosTotales,
    patrimonioNetoPesos: activosTotales - pasivosTotales,
    // Sin productos el porcentaje es cero y no NaN: la barra se dibuja vacía en
    // vez de romperse.
    porcentajeActivos:
      totalConsolidado > 0 ? (activosTotales / totalConsolidado) * 100 : 0,
    cuentasPesos,
    creditoDisponiblePesos,
    disponibleTotalPesos: cuentasPesos + creditoDisponiblePesos,
    disponibleDolares,
  };
}

/**
 * Interpreta la tasa de venta del dólar de `/currency-exchange/rates`.
 *
 * Devuelve `null` si no la encuentra, para que quien llame use la de respaldo
 * de forma explícita en vez de recibir un cero silencioso — una tasa en cero
 * haría que todos los saldos en dólares valieran nada.
 */
export function parseTasaVentaDolar(cuerpo: unknown): number | null {
  // El core responde `{ Value: [ { Currency: '840', Sales: 62.5 } ] }`. Los
  // otros nombres se aceptan porque el mismo endpoint ha devuelto `rates` y
  // `data` en distintos ambientes, y una tasa que no se reconoce degrada la
  // pantalla entera al valor de respaldo sin que nadie se entere.
  const lista = Array.isArray(cuerpo)
    ? cuerpo
    : typeof cuerpo === 'object' && cuerpo !== null
    ? (cuerpo as Record<string, unknown>).Value ??
      (cuerpo as Record<string, unknown>).value ??
      (cuerpo as Record<string, unknown>).rates ??
      (cuerpo as Record<string, unknown>).Rates ??
      (cuerpo as Record<string, unknown>).data
    : null;

  if (!Array.isArray(lista)) return null;

  for (const crudo of lista) {
    if (typeof crudo !== 'object' || crudo === null) continue;
    const fila = crudo as Record<string, unknown>;

    const moneda = String(
      fila.Currency ??
        fila.currency ??
        fila.currencyCode ??
        fila.CurrencyCode ??
        '',
    ).toUpperCase();

    if (moneda !== '840' && moneda !== 'USD') continue;

    // `Sales` es el nombre que usa el core; el resto son alias históricos.
    const venta = Number(
      fila.Sales ??
        fila.sales ??
        fila.sellRate ??
        fila.SellRate ??
        fila.sell ??
        fila.Sell ??
        Number.NaN,
    );

    if (Number.isFinite(venta) && venta > 0) return venta;
  }

  return null;
}
