import { StyleSheet, Text, View } from 'react-native';

import { BscColors } from '../theme/colors';
import { BscRadius, BscSpacing } from '../theme/spacing';
import type { MeterBarProps } from '@bsc/contracts';
import { BscTextStyles } from '../theme/typography';

/**
 * Barra horizontal con etiqueta, para desgloses por categoría.
 *
 * Portada de `BscMeterBar` en `bsc_ui.dart`. Medidas literales del original:
 * 104 de ancho fijo para la etiqueta, 8 de alto de barra, 40 para el porcentaje
 * alineado a la derecha, y 7 de respiro arriba y abajo.
 *
 * El ancho fijo de la etiqueta es lo que alinea verticalmente todas las barras
 * de un desglose: con la etiqueta al tamaño de su texto, cada barra arrancaría
 * en una posición distinta y el desglose dejaría de leerse como una comparación.
 */

export type BscMeterBarProps = MeterBarProps;

export function BscMeterBar({
  label,
  value,
  valueLabel,
  color = BscColors.primary,
  testID,
}: BscMeterBarProps): React.JSX.Element {
  const proporcion = Math.min(Math.max(value, 0), 1);

  return (
    <View style={styles.fila} testID={testID}>
      <Text style={styles.etiqueta} numberOfLines={1}>
        {label}
      </Text>

      <View style={styles.carril}>
        <View
          style={[
            styles.relleno,
            { backgroundColor: color, width: `${proporcion * 100}%` },
          ]}
        />
      </View>

      <Text style={styles.valor}>{valueLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
  },
  etiqueta: {
    width: 104,
    ...BscTextStyles['Caption/12 Regular'],
    color: BscColors.textSecondary,
  },
  carril: {
    flex: 1,
    height: 8,
    borderRadius: BscRadius.pill,
    backgroundColor: BscColors.surfaceMuted,
    overflow: 'hidden',
  },
  relleno: {
    height: '100%',
    borderRadius: BscRadius.pill,
  },
  valor: {
    width: 40,
    marginLeft: BscSpacing.sm,
    textAlign: 'right',
    ...BscTextStyles['Caption/12 SemiBold'],
    color: BscColors.textPrimary,
  },
});
