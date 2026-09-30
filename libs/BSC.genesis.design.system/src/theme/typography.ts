import {
  fontFamily as familiaDelToken,
  lineHeightPx,
  textStyles,
  textStyleScale,
  type TextStyleName,
  type TextStyleScaleName,
  type TextStyleToken,
} from '../tokens';

/**
 * Sistema de diseño BSC — escala tipográfica, en la forma que usan los
 * componentes. Los valores viven en `src/tokens`.
 *
 * **Sobre la fuente.** Google Sans Flex no es fuente del sistema en ninguna
 * plataforma: la app empaqueta cortes estáticos (400, 500, 600, 700 y 800)
 * registrados bajo la familia «Google Sans Flex», así que `fontFamily` más
 * `fontWeight` elige el corte correcto en iOS, en Android y en la vista previa
 * web. Ver `libs/BSC.genesis.design.system/assets/fonts/README.md`.
 */
export const fontFamily = familiaDelToken;

/**
 * Un estilo del token en la forma de React Native: con la familia, y sin
 * `figmaStyle`, que es trazabilidad y no un estilo.
 */
type NativeTextStyle<T extends TextStyleToken> = Omit<T, 'figmaStyle'> & {
  fontFamily: string;
};

function toNativeTextStyle<T extends TextStyleToken>(
  token: T,
): NativeTextStyle<T> {
  const resto = { ...token } as Record<string, unknown>;
  delete resto.figmaStyle;
  return {
    fontFamily,
    ...resto,
    lineHeight: lineHeightPx(token),
  } as NativeTextStyle<T>;
}

type Estilos = typeof textStyles;

export const BscTypography = Object.fromEntries(
  (Object.keys(textStyles) as TextStyleName[]).map(nombre => [
    nombre,
    toNativeTextStyle(textStyles[nombre]),
  ]),
) as { [K in TextStyleName]: NativeTextStyle<Estilos[K]> };

export type BscTextStyleToken = keyof typeof BscTypography;

/**
 * Los 44 estilos de texto de Figma, por su nombre exacto
 * (`BscTextStyles['Body S/14 SemiBold']`), con la familia ya puesta. Para el
 * texto que no tiene un rol en `BscTypography`.
 */
export const BscTextStyles = Object.fromEntries(
  (Object.keys(textStyleScale) as TextStyleScaleName[]).map(nombre => [
    nombre,
    { fontFamily, ...textStyleScale[nombre] },
  ]),
) as {
  [K in TextStyleScaleName]: (typeof textStyleScale)[K] & { fontFamily: string };
};
