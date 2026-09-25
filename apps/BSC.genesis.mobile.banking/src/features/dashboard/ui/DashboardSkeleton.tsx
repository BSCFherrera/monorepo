import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import { BscColors, BscRadius, BscSpacing } from '@bsc/ui-native';

/**
 * El marcador de posición del dashboard mientras cargan los productos.
 *
 * Portado de `_DashboardSkeleton` de `dashboard_screen.dart`, con sus medidas
 * literales. El comentario del original dice para qué existe y merece
 * repetirse: **imita la forma de lo que va a llegar, para que la página no dé
 * un salto** cuando llegan los datos.
 *
 * El porte enseñaba en su lugar un círculo girando centrado, que ni ocupa el
 * mismo sitio ni evita el salto. No se veía revisando el porte porque un
 * indicador de carga parece siempre razonable.
 *
 * **Sin dependencia nueva.** El original usa el paquete `shimmer`, que anima
 * un degradado entre `surfaceMuted` y `surfaceVariant`. Aquí es una animación
 * de opacidad con `Animated`, que ya viene en React Native: el efecto es el
 * mismo brillo que va y viene, y no añade nada al `package.json`.
 */

/** Las medidas literales de `_DashboardSkeleton`. */
export const MEDIDAS_DEL_ESQUELETO = {
  /** `_bar(width: 120, height: 18)` — el rótulo de la primera sección. */
  primerRotulo: { ancho: 120, alto: 18 },

  /** `_bar(height: 76)` — la tarjeta de balance. */
  primerBloque: 76,

  /** `_bar(width: 140, height: 18)` — el rótulo de la segunda sección. */
  segundoRotulo: { ancho: 140, alto: 18 },

  /** `_bar(height: 220)` — la lista de productos. */
  segundoBloque: 220,
} as const;

/** Cuánto tarda el brillo en ir y volver, en milisegundos. */
const DURACION = 900;

export function DashboardSkeleton(): React.JSX.Element {
  const brillo = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const bucle = Animated.loop(
      Animated.sequence([
        Animated.timing(brillo, {
          toValue: 1,
          duration: DURACION,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(brillo, {
          toValue: 0,
          duration: DURACION,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    bucle.start();
    return () => bucle.stop();
  }, [brillo]);

  const opacidad = brillo.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.45],
  });

  const barra = (alto: number, ancho?: number): React.JSX.Element => (
    <Animated.View
      style={[
        estilosDelEsqueleto.barra,
        { height: alto, opacity: opacidad },
        ancho === undefined ? null : { width: ancho },
      ]}
    />
  );

  return (
    <View style={estilosDelEsqueleto.contenedor} testID="dashboard-esqueleto">
      <View style={estilosDelEsqueleto.separacionMinima} />
      {barra(
        MEDIDAS_DEL_ESQUELETO.primerRotulo.alto,
        MEDIDAS_DEL_ESQUELETO.primerRotulo.ancho,
      )}
      <View style={estilosDelEsqueleto.separacionPequena} />
      {barra(MEDIDAS_DEL_ESQUELETO.primerBloque)}
      <View style={estilosDelEsqueleto.separacionMedia} />
      {barra(
        MEDIDAS_DEL_ESQUELETO.segundoRotulo.alto,
        MEDIDAS_DEL_ESQUELETO.segundoRotulo.ancho,
      )}
      <View style={estilosDelEsqueleto.separacionPequena} />
      {barra(MEDIDAS_DEL_ESQUELETO.segundoBloque)}
    </View>
  );
}

export const estilosDelEsqueleto = StyleSheet.create({
  contenedor: {
    paddingHorizontal: BscSpacing.gutter,
  },
  barra: {
    width: '100%',
    borderRadius: BscRadius.md,
    // El original pinta las barras de blanco y deja que el brillo las module.
    backgroundColor: BscColors.surfaceMuted,
  },
  separacionMinima: { height: BscSpacing.xs },
  separacionPequena: { height: BscSpacing.sm },
  separacionMedia: { height: BscSpacing.md },
});
