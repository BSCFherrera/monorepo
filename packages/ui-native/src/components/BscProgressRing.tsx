import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { BscColors } from '../theme/colors';
import type { ProgressRingProps } from '@bsc/contracts';

/**
 * Anillo de progreso con contenido al centro.
 *
 * Portado de `BscProgressRing` y su `_RingPainter` en `bsc_ui.dart`. El
 * original pinta dos arcos sobre el mismo rectángulo, encogido medio trazo por
 * cada lado para que el grosor no se salga del cuadrado, con extremo redondeado
 * y arrancando a las doce. Aquí se dibuja con dos círculos SVG y un trazo
 * discontinuo cuyo hueco es lo que falta: es la forma de conservar grosor,
 * color y punto de partida sin depender de un indicador nativo, que en Android
 * trae su propia altura y su propia animación.
 *
 * Un valor de cero no dibuja el arco de avance. Con extremo redondeado, un arco
 * de longitud cero se pinta igual como un punto, y ese punto se leería como que
 * algo ya se consumió.
 */

export interface BscProgressRingProps extends ProgressRingProps {
  center?: ReactNode;
}

export function BscProgressRing({
  value,
  size = 64,
  stroke = 7,
  color = BscColors.secondary,
  trackColor = BscColors.surfaceMuted,
  center,
  testID,
}: BscProgressRingProps): React.JSX.Element {
  const avance = Math.min(Math.max(value, 0), 1);
  const radio = (size - stroke) / 2;
  const perimetro = 2 * Math.PI * radio;

  return (
    <View style={{ width: size, height: size }} testID={testID}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radio}
          stroke={trackColor}
          strokeWidth={stroke}
          fill="none"
        />
        {avance > 0 ? (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radio}
            stroke={color}
            strokeWidth={stroke}
            fill="none"
            strokeDasharray={`${perimetro * avance} ${perimetro}`}
            strokeLinecap="round"
            // Un arco SVG empieza a las tres; el del original, a las doce.
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        ) : null}
      </Svg>

      {center === undefined ? null : (
        <View style={styles.centro} pointerEvents="none">
          {center}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  centro: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
