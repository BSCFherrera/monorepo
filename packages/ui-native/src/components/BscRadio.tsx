import { StyleSheet, View } from 'react-native';

import { BscColors } from '../theme/colors';
import type { RadioProps } from '@bsc/contracts';

/**
 * El círculo de una opción única.
 *
 * Portado del `Radio<bool>` de Material que usa la hoja de alta de
 * beneficiarios. React Native no trae ninguno, y el widget de Material es un
 * anillo de 20 con un punto de 10 dentro cuando está elegido: dibujarlo son
 * doce líneas y evita una dependencia entera de controles de formulario.
 *
 * No es pulsable por sí mismo, igual que en el original: quien lo usa envuelve
 * **toda la fila** en un pulsador, porque una diana de 20 puntos es demasiado
 * pequeña para un dedo y obliga a apuntar.
 */

export type BscRadioProps = RadioProps;

export function BscRadio({
  selected,
  color = BscColors.primary,
  testID,
}: BscRadioProps): React.JSX.Element {
  return (
    <View
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      style={[
        styles.anillo,
        { borderColor: selected ? color : BscColors.border },
      ]}
      testID={testID}
    >
      {selected ? (
        <View style={[styles.punto, { backgroundColor: color }]} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  anillo: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  punto: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
