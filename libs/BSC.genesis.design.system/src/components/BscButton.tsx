import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';

import { BscColors } from '../theme/colors';
import { buttonSizeTokens, buttonTokens } from '../componentTokens';
import { BscBorderRadius, BscRadius, BscSpacing } from '../theme/spacing';
import { BscTextStyles, BscTypography } from '../theme/typography';

import { BscSpinner } from './BscSpinner';
import type { ButtonProps, ButtonSize } from '@bsc/contracts';

/**
 * Botones del sistema de diseño BSC.
 *
 * Portados de `BscPrimaryButton` y `BscSecondaryButton` en `bsc_ui.dart`.
 *
 * Los dos comparten una decisión que importa más de lo que parece: **mientras
 * cargan, el botón no desaparece ni cambia de tamaño**, solo reemplaza su texto
 * por un indicador. Un botón que se encoge al pulsarlo mueve todo lo que tiene
 * debajo, y en una pantalla de confirmación de transferencia eso hace que el
 * cliente toque lo que no quería.
 */

export interface BscButtonProps extends ButtonProps {
  /** Elemento a la izquierda del texto, normalmente un icono. */
  leading?: React.ReactNode;
  /**
   * Elemento a la derecha del texto.
   *
   * El original lo declara como `trailingIcon` y lo usa en **siete** botones,
   * siempre el que lleva al paso siguiente, siempre con
   * `Icons.arrow_forward_rounded`. El porte no tenía esta propiedad, así que
   * los siete salían sin flecha; ver `flechaDeAvance.test.tsx`.
   *
   * ⚠️ No la llevan las dos pantallas de confirmación de los asistentes,
   * aunque compartan el mismo pie. Por eso es una propiedad y no un valor fijo.
   */
  trailing?: React.ReactNode;
  style?: ViewStyle;
}

const ALTURA = buttonTokens.height;

/**
 * La geometría de un tamaño de Figma: alto, relleno y píldora.
 *
 * Sin `size` no devuelve nada y el botón queda con la medida de siempre; así
 * cada pantalla se pasa a los tamaños de Figma cuando se rediseña.
 */
function geometria(size: ButtonSize | undefined): ViewStyle | null {
  if (size === undefined) return null;
  const t = buttonSizeTokens[size];
  return {
    height: t.height,
    paddingHorizontal: t.paddingX,
    borderRadius: BscRadius.pill,
  };
}

/** El estilo de texto de un tamaño de Figma, o `null` para el de siempre. */
function textoDelTamano(size: ButtonSize | undefined) {
  return size === undefined ? null : BscTextStyles[buttonSizeTokens[size].textStyle];
}

export function BscPrimaryButton({
  label,
  onPress,
  color,
  loading = false,
  disabled = false,
  leading,
  trailing,
  height: alto,
  size,
  style,
  testID,
}: BscButtonProps): React.JSX.Element {
  const inactivo = disabled || loading || onPress === undefined;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: inactivo, busy: loading }}
      accessibilityLabel={label}
      testID={testID}
      onPress={inactivo ? undefined : onPress}
      style={({ pressed }) => [
        styles.base,
        geometria(size),
        alto !== undefined ? { height: alto } : null,
        styles.primario,
        color !== undefined ? { backgroundColor: color } : null,
        pressed && !inactivo && styles.primarioPresionado,
        // El color propio también manda al pulsar: si no, un botón rojo se
        // volvería azul justo mientras el dedo lo toca.
        pressed && !inactivo && color !== undefined
          ? { backgroundColor: color, opacity: 0.88 }
          : null,
        inactivo && styles.inactivo,
        style,
      ]}
    >
      {loading ? (
        <BscSpinner tamano="inButton" color={BscColors.textOnPrimary} />
      ) : (
        <View style={styles.contenido}>
          {leading}
          <Text style={[styles.textoPrimario, textoDelTamano(size)]} numberOfLines={1}>
            {label}
          </Text>
          {trailing}
        </View>
      )}
    </Pressable>
  );
}

export function BscSecondaryButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  leading,
  trailing,
  height: alto,
  size,
  style,
  testID,
}: BscButtonProps): React.JSX.Element {
  const inactivo = disabled || loading || onPress === undefined;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: inactivo, busy: loading }}
      accessibilityLabel={label}
      testID={testID}
      onPress={inactivo ? undefined : onPress}
      style={({ pressed }) => [
        styles.base,
        geometria(size),
        alto !== undefined ? { height: alto } : null,
        styles.secundario,
        pressed && !inactivo && styles.secundarioPresionado,
        inactivo && styles.inactivo,
        style,
      ]}
    >
      {loading ? (
        <BscSpinner tamano="inButton" color={BscColors.primary} />
      ) : (
        <View style={styles.contenido}>
          {leading}
          <Text style={[styles.textoSecundario, textoDelTamano(size)]} numberOfLines={1}>
            {label}
          </Text>
          {trailing}
        </View>
      )}
    </Pressable>
  );
}

/**
 * Botón de texto, sin superficie. Para acciones terciarias.
 *
 * Con `size` es el «Tertiary» de la biblioteca de Figma: el mismo alto, relleno
 * y texto que un botón con superficie de ese tamaño, pero sin fondo. Se estira
 * al ancho que le dé su contenedor, igual que los otros dos. Sin `size`
 * conserva la forma de siempre: tan ancho como su texto.
 *
 * Acepta `color` y `leading` porque el original los usa: el `TextButton.icon`
 * de «Revocar» en «Mis dispositivos» va en rojo y con el icono de bloqueo, y
 * sin esto habría que pintarlo con un estilo suelto en esa pantalla, que es
 * justo como los botones vuelven a divergir unos de otros.
 */
export function BscTextButton({
  label,
  onPress,
  color,
  leading,
  disabled = false,
  size,
  style,
  testID,
}: BscButtonProps): React.JSX.Element {
  const inactivo = disabled || onPress === undefined;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: inactivo }}
      accessibilityLabel={label}
      testID={testID}
      onPress={inactivo ? undefined : onPress}
      style={({ pressed }) => [
        styles.texto,
        size !== undefined ? [geometria(size), styles.textoConTamano] : null,
        pressed && !inactivo && styles.textoPresionado,
        style,
      ]}
    >
      <View style={styles.contenido}>
        {leading}
        <Text
          numberOfLines={size === undefined ? undefined : 1}
          style={[
            styles.textoTerciario,
            textoDelTamano(size),
            color !== undefined && { color },
            inactivo && styles.textoInactivo,
          ]}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: ALTURA,
    borderRadius: BscBorderRadius.button,
    alignItems: 'center',
    justifyContent: 'center',
    // 20 literal del original (`expanded ? 20 : 24`), no el token `md`.
    paddingHorizontal: buttonTokens.paddingXExpanded,
  },
  contenido: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: BscSpacing.xs,
  },
  primario: {
    backgroundColor: BscColors.primary,
  },
  primarioPresionado: {
    backgroundColor: BscColors.primaryDark,
  },
  secundario: {
    backgroundColor: BscColors.surface,
    borderWidth: 1.5,
    borderColor: BscColors.primary,
  },
  secundarioPresionado: {
    backgroundColor: BscColors.primarySoft,
  },
  inactivo: {
    opacity: 0.5,
  },
  textoPrimario: {
    ...BscTypography.labelLarge,
    color: BscColors.textOnPrimary,
  },
  textoSecundario: {
    ...BscTypography.labelLarge,
    color: BscColors.primary,
  },
  texto: {
    paddingVertical: BscSpacing.xs,
    paddingHorizontal: BscSpacing.xs,
    alignItems: 'center',
  },
  textoConTamano: {
    justifyContent: 'center',
  },
  textoPresionado: {
    opacity: 0.6,
  },
  textoTerciario: {
    ...BscTypography.labelLarge,
    color: BscColors.primary,
  },
  textoInactivo: {
    color: BscColors.textTertiary,
  },
});
