/**
 * Las medidas literales de la fila «Destino» de la transferencia expresa.
 *
 * Esta fila merece un archivo propio porque es **el único sitio de toda la
 * aplicación Flutter donde el original está roto**, y eso cambia qué significa
 * «ser fiel al original» aquí.
 *
 * ## Lo que hace el original, y por qué no se dibuja
 *
 * `transfer_step_form.dart`, en `_expressInput`, escribe:
 *
 * ```dart
 * Row(
 *   children: [
 *     Expanded(child: TextField(...)),
 *     const SizedBox(width: 10),
 *     SizedBox(
 *       height: 50,
 *       child: BscPrimaryButton(label: 'Validar', height: 48, ...),
 *     ),
 *   ],
 * )
 * ```
 *
 * `BscPrimaryButton` lleva `expanded: true` por defecto, que dentro del
 * componente se traduce en `width: double.infinity`. Un `Row` entrega a sus
 * hijos no flexibles un ancho **no acotado**, así que ese infinito no tiene
 * contra qué resolverse: el botón se lleva todo el espacio y lo desborda, y al
 * `Expanded` del campo no le queda nada.
 *
 * **Medido en el Pixel 10a el 2026-09-18**, sobre la captura de la app Flutter
 * instalada, no deducido del código:
 *
 * | Qué                                  | Medida                          |
 * | ------------------------------------ | ------------------------------- |
 * | Campo «Número de cuenta destino»     | 5 px de ancho = **1,9 dp**      |
 * | Botón «Validar», color `#00A651`     | **cero píxeles en la pantalla** |
 *
 * O sea: en el original **no se puede escribir la cuenta destino**, y la
 * transferencia expresa no se puede usar. No es una diferencia de dos píxeles,
 * que es como venía anotada.
 *
 * ## Qué se porta, entonces
 *
 * Reproducir el defecto sería entregar una pantalla muerta, así que el porte
 * dibuja **lo que el original quiso escribir**, que se lee sin ambigüedad en
 * sus propias medidas:
 *
 *  - El alto es **50**, el del `SizedBox` que envuelve al botón. En Flutter las
 *    restricciones del padre mandan sobre el `height: 48` de dentro, así que
 *    50 es lo que se dibujaría en cuanto el ancho dejara de ser infinito. El
 *    48 nunca llega a aplicarse.
 *  - El ancho es el **intrínseco** del botón: el original no fija ninguno, y la
 *    única forma correcta de escribir esa fila en Flutter habría sido
 *    `expanded: false`, que es lo que hace el propio original en el único otro
 *    botón que va suelto dentro de un `Row` (`today_section.dart`). Con
 *    `expanded: false` el relleno lateral es 24 a cada lado.
 *  - La separación es **10**, que el original sí escribe a mano y no es un
 *    token del sistema.
 *  - La fila **centra**, porque `Row` usa `CrossAxisAlignment.center` por
 *    defecto y el original no lo cambia.
 *
 * Queda registrado como divergencia deliberada en `13-pendientes.md`.
 */
export const MEDIDAS_DEL_DESTINO_EXPRESO = {
  /**
   * Alto del botón «Validar»: el del `SizedBox` que lo envuelve, no el 48 que
   * el original le pasa al componente y que nunca se aplica.
   */
  altoDelBoton: 50,

  /** El `height: 48` que el original escribe y que el padre pisa. */
  altoQueElPadrePisa: 48,

  /** `const SizedBox(width: 10)`, escrito a mano entre el campo y el botón. */
  separacion: 10,

  /** Relleno lateral del botón ajustado a su contenido: `expanded ? 20 : 24`. */
  rellenoLateralDelBoton: 24,
} as const;
