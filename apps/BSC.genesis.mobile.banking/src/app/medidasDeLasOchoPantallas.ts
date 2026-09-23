import { BscSpacing } from '@bsc/ui-native';
import { BscTypography } from '@bsc/ui-native';

/**
 * Las medidas y decisiones de composición de las ocho pantallas que quedaban
 * por pasar por el método: beneficiarios, seguridad, token, mis dispositivos,
 * tasa de cambio, comprobantes fiscales, perfil y oficial de cuenta.
 *
 * Mismo método que `medidasDelComprobante.ts`: valores literales de los
 * widgets Dart, con una prueba que los lee del original y comprueba además que
 * el porte los usa. La comparación de textos no había encontrado nada en estas
 * pantallas, y aun así aquí salieron cinco diferencias.
 *
 * **Lo que esto descubrió**, de mayor a menor:
 *
 * 1. El **encabezado «Comprobantes»** salía pegado al borde de la pantalla.
 *    `BscSectionHeader` del original trae su propio relleno
 *    —`fromLTRB(gutter, lg, gutter, sm)`—; el del porte no, y cada pantalla se
 *    lo pone a mano. Comprobantes fiscales se lo había olvidado, así que el
 *    título quedaba a cero de la izquierda con la tarjeta de debajo a 16.
 * 2. La **vista de error de Tasa de cambio** no es el estado vacío genérico:
 *    el original tiene una propia, con el icono en rojo y sin círculo ni
 *    título.
 * 3. El **separador dentro de una tarjeta** iba sangrado en Seguridad y en Mis
 *    dispositivos, donde el original lo escribe a todo el ancho.
 * 4. El **texto de las hojas de confirmación** estaba a 14 sin interlínea,
 *    donde el original hereda `bodyMedium`: 13.5 con interlínea 1.45.
 * 5. El **botón «Consultar»** perdía el `height: 48` del original.
 */

/**
 * Relleno por defecto de `BscSectionHeader` en el original:
 * `EdgeInsets.fromLTRB(gutter, lg, gutter, sm)`.
 *
 * Los valores salen de los tokens, no de números escritos aquí: `gutter` son
 * **20**, no 16, y confundirlos con `md` es fácil porque casi todo lo demás de
 * la pantalla va a 16. La prueba los lee de `bsc_spacing.dart`.
 */
export const ENCABEZADO_DE_SECCION = {
  lateral: BscSpacing.gutter,
  arriba: BscSpacing.lg,
  abajo: BscSpacing.sm,
} as const;

/**
 * El texto de una hoja de confirmación.
 *
 * El original lo escribe como `Text(..., style: TextStyle(color: secondary))`,
 * sin tamaño: hereda el `bodyMedium` del tema. Por eso sale del token y no de
 * un número escrito a mano.
 */
export const TEXTO_DE_LA_HOJA = {
  tamano: BscTypography.bodyMedium.fontSize,
  interlinea: BscTypography.bodyMedium.lineHeight,
} as const;

/**
 * La vista de error de Tasa de cambio, que el original escribe aparte.
 *
 * `_ErrorView` de `exchange_rates_screen.dart`: un icono de error grande y en
 * rojo, el mensaje centrado y, si hay a dónde volver, un botón de 200 de ancho.
 * **No lleva ni el círculo gris ni el título** del estado vacío genérico.
 */
export const ERROR_DE_TASA_DE_CAMBIO = {
  /** `EdgeInsets.all(24)`. */
  relleno: 24,

  /** `Icon(Icons.error_outline, size: 48, color: BscColors.error)`. */
  icono: 48,

  /** `SizedBox(height: 16)` antes del mensaje y antes del botón. */
  separacion: 16,

  /** `SizedBox(width: 200)` alrededor del botón. */
  anchoDelBoton: 200,

  /** `BscPrimaryButton(height: 46)`. */
  altoDelBoton: 46,
} as const;
