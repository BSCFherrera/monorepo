import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BscColors } from '../theme/colors';
import { BscRadius } from '../theme/spacing';
import type { SegmentedProps } from '@bsc/contracts';
import { BscTextStyles } from '../theme/typography';

/**
 * Control segmentado compacto.
 *
 * Portado de `BscSegmented` en `bsc_ui.dart`. El original lo usa para elegir
 * período y, en el detalle de tarjeta, para elegir moneda: una tarjeta del
 * banco lleva los ciclos en pesos y en dólares a la vez, y este control es lo
 * que decide cuál de los dos se está mirando.
 *
 * Medidas literales del original: 3 de relleno en el contenedor, 14×7 en cada
 * segmento, texto de 12.5 en seminegrita, y cápsula en los dos niveles. Los
 * colores son parámetros porque sobre el degradado de la cabecera el fondo pasa
 * a blanco translúcido y el texto a blanco, mientras que sobre una superficie
 * clara se queda con el gris de variante y el azul de marca.
 */

export type BscSegmentedProps = SegmentedProps;

export function BscSegmented({
  labels,
  selectedIndex,
  onChange,
  background = BscColors.surfaceVariant,
  selectedColor = BscColors.surface,
  selectedTextColor = BscColors.primary,
  textColor = BscColors.textSecondary,
  testID,
}: BscSegmentedProps): React.JSX.Element {
  return (
    <View
      style={[styles.contenedor, { backgroundColor: background }]}
      testID={testID}
    >
      {labels.map((etiqueta, indice) => {
        const activo = indice === selectedIndex;

        return (
          <Pressable
            key={etiqueta}
            accessibilityRole="button"
            accessibilityState={{ selected: activo }}
            accessibilityLabel={etiqueta}
            onPress={() => onChange(indice)}
            style={[
              styles.segmento,
              activo ? { backgroundColor: selectedColor } : null,
            ]}
            testID={testID === undefined ? undefined : `${testID}-${indice}`}
          >
            <Text
              style={[
                styles.texto,
                { color: activo ? selectedTextColor : textColor },
              ]}
            >
              {etiqueta}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    padding: 3,
    borderRadius: BscRadius.pill,
  },
  segmento: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: BscRadius.pill,
  },
  texto: {
    ...BscTextStyles['Caption/12 SemiBold'],
  },
});
