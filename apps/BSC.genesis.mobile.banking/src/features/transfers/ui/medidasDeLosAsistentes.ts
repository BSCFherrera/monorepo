import { BscSpacing } from '@bsc/design-system';

/**
 * Las medidas literales de los asistentes de transferencia y de pago.
 *
 * Mismo método que `medidasDeLasOchoPantallas.ts`: los valores salen de los
 * widgets Dart y una prueba los lee del original **y** comprueba que el porte
 * los usa. Sin la segunda mitad alguien reescribe un número a mano y la prueba
 * se queda en verde.
 *
 * **Lo que esto descubrió:**
 *
 * 1. **Los botones del pie miden 50, no 54.** Los cuatro pasos —el formulario y
 *    la confirmación de transferencia, y los dos de pago— pasan `height: 50` a
 *    mano. El porte no pasaba ninguno, así que usaba el 54 por defecto de
 *    `BscPrimaryButton`. Son los botones más grandes de la pantalla y el error
 *    se repetía en las cuatro.
 * 2. **«Cargando beneficiarios…» iba sin indicador.** El original pone un
 *    `CircularProgressIndicator` de 18 con trazo 2 junto al texto; el porte
 *    solo escribía el texto, así que durante la espera la pantalla no daba
 *    ninguna señal de estar haciendo algo.
 *
 * ⚠️ **Un 48 no siempre es un botón.** El `height: 48` de los comprobantes es
 * el círculo de un icono de acción, no un control, y cambiarlo habría estropeado
 * la fila de «Compartir». Se comprobó leyendo el widget, no buscando el número.
 */

/**
 * La barra de acciones al pie de cada paso.
 *
 * `_bottomBar` en `transfer_step_form.dart`, `transfer_step_confirmation.dart`,
 * `payment_step_form.dart` y `payment_step_confirmation.dart`. Los cuatro
 * escriben lo mismo.
 */
export const PIE_DEL_ASISTENTE = {
  /** `EdgeInsets.fromLTRB(16, 12, 16, 16)`. */
  lateral: 16,
  arriba: 12,
  abajo: 16,

  /**
   * `height: 50`, escrito a mano en los cuatro pasos.
   *
   * **No es el 54 por defecto de `BscPrimaryButton`.** El original declara
   * `this.height = 54` en el botón y luego lo pisa aquí, que es justo el caso
   * que un porte se come si solo mira el componente compartido.
   */
  altoDelBoton: 50,

  /** `SizedBox(width: BscSpacing.sm)` entre los dos botones. */
  separacion: BscSpacing.sm,

  /** `Expanded` y `Expanded(flex: 2)`: el de continuar es el doble de ancho. */
  proporcionCancelar: 1,
  proporcionContinuar: 2,
} as const;

/**
 * El cuerpo de cada paso.
 *
 * `EdgeInsets.fromLTRB(16, 20, 16, 16)`, igual en el formulario y en la
 * confirmación.
 */
export const CUERPO_DEL_PASO = {
  lateral: 16,
  arriba: 20,
  abajo: 16,
} as const;

/**
 * La espera mientras llegan los beneficiarios.
 *
 * `_beneficiarySelector` de `transfer_step_form.dart`: el contenedor del
 * desplegable —`symmetric(horizontal: 14, vertical: 6)`— con un relleno interno
 * de 8 arriba y abajo, de modo que **el alto efectivo es 14**, y dentro un
 * indicador junto al texto.
 */
export const CARGANDO_BENEFICIARIOS = {
  /** `_dropdownContainer`: `symmetric(horizontal: 14, vertical: 6)`. */
  lateral: 14,
  /** 6 del contenedor más 8 del `Padding` de dentro. */
  vertical: 14,

  /** `SizedBox(width: 18, height: 18)`. */
  indicador: 18,

  /** `CircularProgressIndicator(strokeWidth: 2)`. */
  trazo: 2,

  /** `SizedBox(width: 12)` entre el indicador y el texto. */
  separacion: 12,
} as const;
