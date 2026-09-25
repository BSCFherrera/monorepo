import { type ViewStyle } from 'react-native';

import {
  coloredShadow as coloredShadowToken,
  layout,
  radius,
  semanticRadius,
  shadows,
  sheet,
  spacing,
  type ShadowToken,
} from '@bsc/design-tokens';

/**
 * Sistema de diseño BSC — espaciado, radios y sombras, en la forma que usan
 * los componentes. Los valores viven en `@bsc/design-tokens`.
 *
 * Toda la interfaz se ajusta a la escala de 4 puntos para que el ritmo vertical
 * sea consistente entre pantallas hechas por personas distintas.
 */
export const BscSpacing = spacing;

export const screenPadding = {
  paddingHorizontal: layout.screenPaddingX,
} as const;

export const BscRadius = radius;

export const BscBorderRadius = {
  card: semanticRadius.card,
  button: semanticRadius.button,
  field: semanticRadius.field,
  chip: semanticRadius.chip,
} as const;

/** Radio superior de las hojas modales. */
export const sheetTopRadius = {
  borderTopLeftRadius: sheet.topRadius,
  borderTopRightRadius: sheet.topRadius,
} as const;

/**
 * Sombras.
 *
 * Cada token es una pila de capas —color, desplazamiento, desenfoque y
 * extensión—, igual que en Figma. Se traduce a `boxShadow`, que React Native
 * dibuja igual en iOS y en Android (nueva arquitectura) y que React Native
 * Web pasa tal cual a CSS. No hay aproximación por plataforma: el desenfoque
 * es el mismo número que en Figma y la sombra puede apuntar hacia arriba
 * también en Android.
 */
export function toNativeShadow(token: ShadowToken): ViewStyle {
  return {
    boxShadow: token.map(capa => ({
      offsetX: capa.offsetX,
      offsetY: capa.offsetY,
      blurRadius: capa.blur,
      spreadDistance: capa.spread,
      color: capa.color,
    })),
  };
}

export const BscShadows = {
  /**
   * Elevación en reposo de las tarjetas de contenido (`Shadow/MD` de Figma).
   */
  card: toNativeShadow(shadows.card),

  /** `Shadow/SM` de Figma. */
  subtle: toNativeShadow(shadows.subtle),

  /** Barra inferior y hojas: la sombra apunta hacia arriba. */
  bar: toNativeShadow(shadows.bar),
} as const;

/** Desenfoque y desplazamiento de las sombras de color, tomados del token. */
const [BRILLO] = coloredShadowToken('#000000');

/**
 * Sombra de color, para botones y elementos destacados. Recibe el color ya
 * con su opacidad (`withAlpha(color, 0.28)`), que es como la usan las pantallas.
 */
export function coloredShadow(colorConAlfa: string): ViewStyle {
  return toNativeShadow([{ ...BRILLO!, color: colorConAlfa }]);
}

/** Sombra azul de marca, la de uso más frecuente. */
export const primaryShadow = toNativeShadow(shadows.primary);

/** Convierte `#RRGGBB` a `rgba(r, g, b, a)`. */
export function withAlpha(hex: string, alpha: number): string {
  const limpio = hex.replace('#', '');
  const r = parseInt(limpio.slice(0, 2), 16);
  const g = parseInt(limpio.slice(2, 4), 16);
  const b = parseInt(limpio.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
