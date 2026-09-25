import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BscColors } from '../theme/colors';
import { BscRadius, BscSpacing } from '../theme/spacing';
import type { ToastProps } from '@bsc/contracts';
import { BscTextStyles } from '../theme/typography';

/**
 * Aviso breve flotante sobre el contenido.
 *
 * Portado del `SnackBar` de la app Flutter, cuyo tema está en `bsc_theme.dart`:
 * flotante, fondo del color del texto principal, texto blanco de 13.5 en peso
 * medio, radio pequeño y 16 de margen por todos lados.
 *
 * Se escribe como componente propio y no con `ToastAndroid` del núcleo de React
 * Native por dos razones: `ToastAndroid` **solo existe en Android** —y en iOS
 * el aviso desaparecería sin dejar rastro, que es peor que no tenerlo— y su
 * apariencia la pone el sistema, así que no se parecería al del original en
 * ninguna de las dos plataformas.
 *
 * Se desvanece solo. Es para confirmar algo que acaba de ocurrir —«número
 * copiado»—, nunca para comunicar un error que el cliente tenga que leer con
 * calma: eso va en un `BscBanner`, que se queda en pantalla.
 */

export type BscToastProps = ToastProps;

const DURACION_POR_DEFECTO = 4_000;
const ENTRADA = 180;
const SALIDA = 220;

export function BscToast({
  message: mensaje,
  durationMs: duracion = DURACION_POR_DEFECTO,
  onHide: onOcultar,
  testID,
}: BscToastProps): React.JSX.Element | null {
  const insets = useSafeAreaInsets();
  const opacidad = useRef(new Animated.Value(0)).current;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (mensaje === null) return undefined;

    setVisible(true);
    Animated.timing(opacidad, {
      toValue: 1,
      duration: ENTRADA,
      useNativeDriver: true,
    }).start();

    const temporizador = setTimeout(() => {
      Animated.timing(opacidad, {
        toValue: 0,
        duration: SALIDA,
        useNativeDriver: true,
      }).start(() => {
        setVisible(false);
        onOcultar();
      });
    }, duracion);

    return () => clearTimeout(temporizador);
  }, [mensaje, duracion, opacidad, onOcultar]);

  if (mensaje === null || !visible) return null;

  return (
    <Animated.View
      style={[
        styles.contenedor,
        { opacity: opacidad, bottom: BscSpacing.md + insets.bottom },
      ]}
      pointerEvents="none"
      testID={testID}
    >
      <View style={styles.barra}>
        <Text style={styles.texto}>{mensaje}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    position: 'absolute',
    left: BscSpacing.md,
    right: BscSpacing.md,
  },
  barra: {
    backgroundColor: BscColors.textPrimary,
    borderRadius: BscRadius.sm,
    paddingHorizontal: BscSpacing.md,
    paddingVertical: 14,
  },
  texto: {
    color: BscColors.textOnDark,
    ...BscTextStyles['Body S/14 Medium'],
  },
});
