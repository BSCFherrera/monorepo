import type { TabParamList } from './routes';

/**
 * Con qué parámetros se entra al asistente de pagos desde el detalle de un
 * producto.
 *
 * Existe como función aparte —y no escrito dentro del navegador— porque es
 * justo donde se perdió un dato y nadie lo vio. El original compone una
 * dirección con **tres** parámetros:
 *
 * ```dart
 * context.go(
 *   '/payments?type=creditCard'
 *   '&product=${Uri.encodeComponent(widget.detail.cardNumber)}'
 *   '&currency=${widget.useDOP ? 'DOP' : 'USD'}',
 * );
 * ```
 *
 * El porte navegaba con el tipo y nada más, así que al abrir el pago desde una
 * tarjeta con el ciclo en dólares seleccionado el asistente caía en la primera
 * tarjeta del cliente y en pesos: sin selector de moneda —porque esa primera
 * tarjeta no tiene ciclo en dólares— y con el monto en la moneda equivocada.
 * El cliente había dicho dos cosas, qué tarjeta y en qué moneda, y el asistente
 * no recibía ninguna.
 */
export function parametrosDePagoDeTarjeta(opciones: {
  numeroDeTarjeta: string;
  codigoMoneda: number;
}): NonNullable<TabParamList['PagosTab']> {
  return {
    tipo: 'tarjeta',
    producto: opciones.numeroDeTarjeta,
    moneda: opciones.codigoMoneda === 840 ? 'USD' : 'DOP',
  };
}
