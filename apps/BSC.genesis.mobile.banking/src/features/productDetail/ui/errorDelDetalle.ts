import { ProductCategory } from '../../dashboard/data/productContracts';

/**
 * El aviso que el original enseña cuando **no se pudo cargar el detalle**.
 *
 * Cada vista del original tiene el suyo, escrito a mano: «No pudimos cargar la
 * cuenta», «…el préstamo», «…el certificado», «…la tarjeta», los cuatro con un
 * botón «Reintentar».
 *
 * **Por qué existe este archivo.** El porte se tragaba el fallo: si el detalle
 * no cargaba dejaba `detalle` en nulo y seguía dibujando la cabecera y los
 * movimientos, sin decir nada. Un comentario del código afirmaba que eso era
 * «lo que hace el original», y no lo es: el bloc emite `ProductDetailError` y
 * la vista se sustituye entera por el aviso. La diferencia importa porque el
 * cliente se quedaba mirando una pantalla a la que le faltan el límite de
 * sobregiro, la tasa o el titular **sin ninguna señal de que algo falló**, que
 * es exactamente la forma en que un defecto llega a producción.
 */
export function tituloDelErrorDelDetalle(tipo: string): string {
  switch (tipo) {
    case ProductCategory.Loan:
      return 'No pudimos cargar el préstamo';
    case ProductCategory.Certificate:
      return 'No pudimos cargar el certificado';
    case ProductCategory.CreditCard:
      return 'No pudimos cargar la tarjeta';
    default:
      return 'No pudimos cargar la cuenta';
  }
}

/** El original rotula el botón igual en las cuatro vistas. */
export const ETIQUETA_DE_REINTENTO = 'Reintentar';
