import type { Movimiento } from '../data/transactionContracts';

/**
 * En qué se fue el dinero de la tarjeta, por categoría.
 *
 * Portado de `_SpendBreakdown.from` en `credit_card_detail_view.dart`.
 *
 * **Las categorías son las que ya devuelve el core**, no una taxonomía
 * inventada a partir del texto del comercio. Adivinar la categoría por el
 * nombre del establecimiento produciría un desglose que no coincide con ningún
 * estado de cuenta del banco, y el cliente no tendría forma de cuadrarlo.
 *
 * Dos detalles del original que se conservan tal cual:
 *
 *  - **Solo cuentan los débitos.** Un pago recibido no es un consumo, y meterlo
 *    en el desglose inflaría el total con dinero que el cliente devolvió.
 *  - **El total suma todas las categorías, pero solo se dibujan cuatro.** El
 *    número grande es lo que se gastó en el período, no lo que cabe en las
 *    barras; por eso los porcentajes de las barras no suman cien.
 */

export interface EntradaDelDesglose {
  etiqueta: string;
  monto: number;
}

export interface DesgloseDeConsumos {
  total: number;
  entradas: EntradaDelDesglose[];
}

/** Cuántas barras dibuja el original. */
const CATEGORIAS_VISIBLES = 4;

export function desgloseDeConsumos(
  movimientos: readonly Movimiento[],
): DesgloseDeConsumos {
  const porTipo = new Map<string, number>();
  let total = 0;

  for (const movimiento of movimientos) {
    if (movimiento.tipo !== 'D') continue;

    const tipo = movimiento.tipoDeTransaccion?.trim() ?? '';
    const clave = tipo === '' ? 'Otros consumos' : tipo;

    porTipo.set(clave, (porTipo.get(clave) ?? 0) + movimiento.monto);
    total += movimiento.monto;
  }

  const entradas = [...porTipo.entries()]
    .map(([etiqueta, monto]) => ({ etiqueta, monto }))
    .sort((uno, otro) => otro.monto - uno.monto)
    .slice(0, CATEGORIAS_VISIBLES);

  return { total, entradas };
}
