import {
  comoLista,
  decimal,
  entero,
  leerResult,
} from '../../../core/network/envelopes';

/**
 * Las tasas de compra y venta del banco.
 *
 * Portado de `exchange_rate.dart` y su fuente de datos. El endpoint responde
 * con el sobre `Result<T>` —`{ Value, IsSuccess, Error }`—, no con
 * `ApiResponse<T>`: es de los que pasan por MediatR. Confundirlos no da error,
 * da una lista vacía, y ya ha pasado cuatro veces en esta migración.
 */

/** Códigos ISO numéricos que el backend devuelve. */
export const MONEDA_DOLAR = 840;
export const MONEDA_EURO = 978;

export interface TasaDeCambio {
  /** ISO numérico: 840 el dólar, 978 el euro. */
  moneda: number;
  /** A cuánto **compra** el banco la divisa. */
  compra: number;
  /** A cuánto la **vende**. */
  venta: number;
}

/**
 * El símbolo corto de la columna «MONEDA».
 *
 * Una moneda que el porte no conozca se muestra con su código en vez de
 * desaparecer o quedarse en blanco: es la misma lección que dejó el catálogo de
 * productos, donde una categoría desconocida borraba la fila entera.
 */
export function simboloDeMoneda(moneda: number): string {
  switch (moneda) {
    case MONEDA_DOLAR:
      return 'US$';
    case MONEDA_EURO:
      return 'EUR';
    default:
      return String(moneda);
  }
}

/** El nombre largo, bajo el símbolo. */
export function nombreDeMoneda(moneda: number): string {
  switch (moneda) {
    case MONEDA_DOLAR:
      return 'Dólar Estadounidense';
    case MONEDA_EURO:
      return 'Euro';
    default:
      return `Moneda ${moneda}`;
  }
}

/**
 * Lo que cuesta convertir un monto a pesos.
 *
 * Se separa de la pantalla porque es la única aritmética de la oleada 8 y
 * conviene que tenga prueba: el conversor es lo que el cliente usa para decidir
 * cuánto va a transferir.
 */
export function convertirAPesos(
  monto: number,
  tasa: TasaDeCambio,
  usandoVenta: boolean,
): number {
  return monto * (usandoVenta ? tasa.venta : tasa.compra);
}

export function parseTasas(cuerpo: unknown): TasaDeCambio[] {
  return comoLista(leerResult(cuerpo)).map(fila => ({
    moneda: entero(fila, 'Currency', 'currency') ?? 0,
    compra: decimal(fila, 'Buys', 'buys') ?? 0,
    venta: decimal(fila, 'Sales', 'sales') ?? 0,
  }));
}
