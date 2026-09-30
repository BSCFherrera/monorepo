import { sheet } from './tokens';

/**
 * Hasta dónde puede crecer una hoja, con el teclado abierto y sin él.
 *
 * **Lo que esto corrige.** El botón «Entrar» de la hoja de acceso no se veía
 * entero con el teclado abierto: quedaba por debajo del borde de la pantalla.
 * Lo reportó el usuario probando en el Pixel.
 *
 * La causa es una diferencia entre Flutter y React Native que no se ve leyendo
 * el porte, porque el porte copia el número correcto. El original limita la
 * hoja a `media.size.height * 0.92` con un `ConstrainedBox`, pero en Flutter
 * **las restricciones del padre mandan sobre las del hijo**: la hoja vive
 * dentro de un `Padding(bottom: viewInsets.bottom)` que ya le ha quitado el
 * alto del teclado, y `BoxConstraints.enforce` recorta ese 0,92 al espacio que
 * de verdad queda. En React Native no hay tal recorte: un `maxHeight` del 92 %
 * se mide contra la pantalla entera y el sobrante se sale por abajo, teclado o
 * no. El contenido que se sale es justo el final de la hoja, que es donde está
 * el botón.
 *
 * Por eso el tope se calcula aquí en vez de escribirse como porcentaje: es un
 * mínimo entre dos cosas, y una de ellas cambia mientras el cliente escribe.
 */

/**
 * `maxHeightFactor` de `BscSheet` en `bsc_ui.dart`.
 *
 * **0,92, no 0,90.** La hoja de acceso del porte tenía 0,90 escrito a mano.
 */
export const SHEET_MAX_HEIGHT_FACTOR = sheet.maxHeightFactor;

export function sheetMaxHeight({
  windowHeight: altoDeLaVentana,
  keyboardHeight: altoDelTeclado = 0,
  factor = SHEET_MAX_HEIGHT_FACTOR,
}: {
  windowHeight: number;
  keyboardHeight?: number;
  factor?: number;
}): number {
  // Sin ventana medida todavía, no se impone tope: mejor una hoja sin límite
  // durante el primer fotograma que una hoja de cero píxeles.
  if (!Number.isFinite(altoDeLaVentana) || altoDeLaVentana <= 0) {
    return Number.POSITIVE_INFINITY;
  }

  const porElDiseno = altoDeLaVentana * factor;
  const porElTeclado = altoDeLaVentana - Math.max(0, altoDelTeclado);

  return Math.max(0, Math.min(porElDiseno, porElTeclado));
}

/**
 * Cuánto espacio hay que reservar por debajo de una hoja cuando el teclado está
 * abierto.
 *
 * **Por qué no basta con lo que React Native reporta.** Descontar el teclado
 * dejó el botón de la hoja 21 píxeles por debajo de su borde en el Pixel 10a,
 * con el relleno inferior del pie oculto del todo. Las medidas del sistema
 * explican la diferencia sin margen de duda:
 *
 * | Qué                                       | Píxeles |
 * | ----------------------------------------- | ------- |
 * | Pantalla (`wm size`)                      | 2424    |
 * | Teclado real (`InsetsSource type=ime`)    | 965     |
 * | Barra de navegación (`navigationBars`)    | 63      |
 * | Lo que la hoja había reservado            | 902     |
 *
 * 965 − 902 son exactamente los 63 de la barra de navegación. La causa son dos
 * sistemas de coordenadas distintos: `keyboardDidShow` mide el teclado contra
 * la **ventana de la aplicación**, que no incluye la barra de navegación,
 * mientras que un `Modal` con `statusBarTranslucent` se dibuja sobre la
 * **pantalla entera**. Reservar lo reportado deja sin cubrir justo esa banda, y
 * ahí es donde cae el final de la hoja.
 *
 * Es la misma trampa que la del 0,92: el número que se copió era correcto y el
 * resultado seguía estando mal, porque el marco lo interpreta en otra escala.
 *
 * El pie sigue sin sumar `insets.bottom` por su cuenta cuando hay teclado —esa
 * banda ya la cubre esta reserva—, así que las dos mitades no se pisan.
 */
export function keyboardOverlap({
  reportedHeight: alturaReportada,
  bottomInset: insetInferior,
}: {
  /** `evento.endCoordinates.height` de `keyboardDidShow`, en puntos. */
  reportedHeight: number;
  /** `useSafeAreaInsets().bottom`: la barra de navegación, en puntos. */
  bottomInset: number;
}): number {
  // Con el teclado cerrado no se reserva nada: el hueco de la barra lo pone el
  // pie, y sumarlo también aquí dejaría un vacío del doble.
  if (!Number.isFinite(alturaReportada) || alturaReportada <= 0) return 0;

  return alturaReportada + Math.max(0, insetInferior);
}
