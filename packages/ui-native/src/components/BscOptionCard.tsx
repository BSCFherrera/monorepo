import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BscColors } from '../theme/colors';
import { BscRadius, BscSpacing, withAlpha } from '../theme/spacing';
import type { OptionCardProps } from '@bsc/contracts';
import { BscTextStyles } from '../theme/typography';

/**
 * Tarjeta de opción seleccionable, de las que van en fila.
 *
 * Portada de `BscOptionCard` en `bsc_ui.dart`. El original la usa en los
 * selectores de monto —«Mínimo / Al corte / Otro»— y la marca seleccionada con
 * borde azul de 1.6 y relleno azul suave, frente a 1 y blanco en reposo.
 *
 * Lleva su propio `flex: 1` porque en el original es un `Expanded`: las tres
 * opciones reparten el ancho por igual, y una que se ajuste a su texto haría
 * que «Otro» quedara la mitad de ancha que «Al corte».
 */

export type BscOptionCardProps = OptionCardProps;

export function BscOptionCard({
  title,
  subtitle,
  selected,
  onPress,
  testID,
}: BscOptionCardProps): React.JSX.Element {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      testID={testID}
      style={styles.hueco}
    >
      <View style={[styles.tarjeta, selected ? styles.elegida : null]}>
        <Text
          style={[styles.titulo, selected ? styles.tituloElegido : null]}
          numberOfLines={1}
        >
          {title}
        </Text>
        {subtitle === undefined ? null : (
          <Text
            style={[
              styles.subtitulo,
              selected ? styles.subtituloElegido : null,
            ]}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hueco: {
    flex: 1,
  },
  tarjeta: {
    paddingHorizontal: BscSpacing.sm,
    paddingVertical: 14,
    borderRadius: BscRadius.sm,
    backgroundColor: BscColors.surface,
    borderWidth: 1,
    borderColor: BscColors.border,
  },
  elegida: {
    backgroundColor: BscColors.primarySoft,
    borderColor: BscColors.primary,
    borderWidth: 1.6,
  },
  titulo: {
    ...BscTextStyles['Body S/14 SemiBold'],
    color: BscColors.textPrimary,
  },
  tituloElegido: {
    color: BscColors.primary,
  },
  subtitulo: {
    marginTop: 3,
    ...BscTextStyles['Caption/12 Medium'],
    color: BscColors.textSecondary,
  },
  subtituloElegido: {
    color: withAlpha(BscColors.primary, 0.75),
  },
});
