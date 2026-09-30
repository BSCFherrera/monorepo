import { useState, type ReactNode } from 'react';
import {
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Polygon } from 'react-native-svg';

import { BscGradients, type BscGradient } from '../theme/colors';
import { overlay } from '../tokens';
import type { GradientBackdropProps } from '@bsc/contracts';

/**
 * Fondo con el gradiente de marca y sus facetas.
 *
 * Es la firma visual del producto: aparece en el login, la cabecera del
 * dashboard y cada *hero* de producto.
 *
 * **Las facetas importan.** Portado de `BscBrandBackdrop` y `_FacetPainter` en
 * `bsc_ui.dart`: sobre el gradiente se dibujan tres polígonos —dos claros y una
 * cuña oscura— que le dan al fondo la sensación de un cristal tallado. Sin
 * ellos el gradiente se ve plano, y esa diferencia se nota de inmediato al
 * poner las dos apps lado a lado.
 *
 * Las coordenadas son las mismas del original, expresadas como fracción del
 * ancho y el alto.
 */
export interface BscGradientBackdropProps extends GradientBackdropProps {
  children?: ReactNode;
  gradient?: BscGradient;
  style?: StyleProp<ViewStyle>;
}

/** Colores de las facetas que se dibujan sobre el degradado. */
const FACETA_CLARA = overlay.facetLight;
const FACETA_TENUE = overlay.facetFaint;
const CUNA_OSCURA = overlay.wedgeDark;

function Facetas({
  ancho,
  alto,
}: {
  ancho: number;
  alto: number;
}): React.JSX.Element {
  const w = ancho;
  const h = alto;

  return (
    <Svg
      style={StyleSheet.absoluteFill}
      width={w}
      height={h}
      pointerEvents="none"
    >
      {/* Faceta grande que barre desde el borde derecho hacia abajo. */}
      <Polygon
        points={`${w * 0.52},${-h * 0.1} ${w * 1.15},${h * 0.28} ${w * 1.15},${
          h * 1.05
        } ${w * 0.2},${h * 1.05}`}
        fill={FACETA_CLARA}
      />

      {/* Contrafaceta que atrapa la esquina superior derecha. */}
      <Polygon
        points={`${w * 0.72},${-h * 0.05} ${w * 1.1},${h * 0.02} ${w * 1.1},${
          h * 0.62
        }`}
        fill={FACETA_TENUE}
      />

      {/* Cuña de sombra que ancla la esquina inferior izquierda. */}
      <Polygon
        points={`${-w * 0.1},${h * 0.55} ${w * 0.42},${h * 1.1} ${-w * 0.1},${
          h * 1.1
        }`}
        fill={CUNA_OSCURA}
      />
    </Svg>
  );
}

export function BscGradientBackdrop({
  children,
  gradient = BscGradients.brand,
  showFacets = true,
  style,
}: BscGradientBackdropProps): React.JSX.Element {
  // Las facetas se dibujan en proporción al tamaño real, así que hay que
  // medirlo. Flutter lo resuelve con `CustomPaint`, que recibe el tamaño ya
  // calculado.
  const [tamano, setTamano] = useState({ ancho: 0, alto: 0 });

  const alMedir = (evento: LayoutChangeEvent): void => {
    const { width, height } = evento.nativeEvent.layout;
    setTamano({ ancho: width, alto: height });
  };

  return (
    <LinearGradient
      colors={[...gradient.colors]}
      locations={gradient.locations ? [...gradient.locations] : undefined}
      start={gradient.start}
      end={gradient.end}
      style={[styles.lleno, style]}
      onLayout={alMedir}
    >
      {showFacets && tamano.ancho > 0 ? (
        <Facetas ancho={tamano.ancho} alto={tamano.alto} />
      ) : null}
      {children}
    </LinearGradient>
  );
}

/** Variante que no ocupa toda la pantalla, para cabeceras y tarjetas. */
export function BscGradientSurface({
  children,
  gradient = BscGradients.header,
  showFacets = true,
  style,
}: BscGradientBackdropProps): React.JSX.Element {
  const [tamano, setTamano] = useState({ ancho: 0, alto: 0 });

  return (
    <LinearGradient
      colors={[...gradient.colors]}
      locations={gradient.locations ? [...gradient.locations] : undefined}
      start={gradient.start}
      end={gradient.end}
      style={style}
      onLayout={evento => {
        const { width, height } = evento.nativeEvent.layout;
        setTamano({ ancho: width, alto: height });
      }}
    >
      {showFacets && tamano.ancho > 0 ? (
        <View style={styles.recorte} pointerEvents="none">
          <Facetas ancho={tamano.ancho} alto={tamano.alto} />
        </View>
      ) : null}
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  lleno: {
    flex: 1,
  },
  // Las facetas se salen del borde a propósito; hay que recortarlas para que no
  // se dibujen fuera de la cabecera.
  recorte: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
});
