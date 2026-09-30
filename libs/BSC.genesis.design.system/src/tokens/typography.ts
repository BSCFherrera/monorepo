/**
 * Typography tokens.
 *
 * Font: Google Sans Flex, the Figma library's `family/primary`. It is not a
 * system font on either platform: the app bundles static cuts of it (see
 * `libs/BSC.genesis.design.system/assets/fonts`).
 *
 * Every role points at one of the library's text styles, which fixes its size,
 * weight, line height and letter spacing. The library has no role names, so
 * the role → style choice below is ours: the nearest size, same weight. The
 * color attached to a role is code only (Figma text styles carry no color).
 */
import { colors, colorsDark, type Colors } from './colors';
import {
  figmaFontFamily,
  figmaTextStyles,
  type FigmaTextStyleName,
} from './generated/figma';
import { type FontWeight } from './primitives';

export const fontFamily = figmaFontFamily;

/**
 * The Figma library's text styles, by their exact Figma name
 * (`'Body S/14 SemiBold'`). For text that has no role above; a screen built
 * from a Figma frame can use the style name the frame shows.
 */
export const textStyleScale = figmaTextStyles;
export type TextStyleScaleName = FigmaTextStyleName;

export interface TextStyleToken {
  fontSize: number;
  fontWeight: FontWeight;
  /** In px, as Figma gives it. */
  lineHeight: number;
  /** In px. */
  letterSpacing: number;
  color?: string;
  /** The Figma text style this role is built from. */
  figmaStyle: FigmaTextStyleName;
}

function style(name: FigmaTextStyleName, color?: string): TextStyleToken {
  return { ...figmaTextStyles[name], ...(color === undefined ? {} : { color }), figmaStyle: name };
}

function buildTextStyles(c: Colors) {
  return {
    // ─── Display — reserved for balances on a gradient hero ─────────────
    displaySmall: style('Title MD/36 Bold'),

    // ─── Headlines ──────────────────────────────────────────────────────
    headlineLarge: style('Title S/30 Bold', c.text.primary),
    headlineMedium: style('Title XS/24 Bold', c.text.primary),
    headlineSmall: style('Subtitle/20 Bold', c.text.primary),

    // ─── Titles ─────────────────────────────────────────────────────────
    titleLarge: style('Body L/18 Bold', c.text.primary),
    titleMedium: style('Body MD/16 SemiBold', c.text.primary),
    titleSmall: style('Body S/14 SemiBold', c.text.primary),

    // ─── Body ───────────────────────────────────────────────────────────
    bodyLarge: style('Body MD/16 Regular', c.text.primary),
    bodyMedium: style('Body S/14 Regular', c.text.secondary),
    bodySmall: style('Caption/12 Regular', c.text.secondary),

    // ─── Labels ─────────────────────────────────────────────────────────
    labelLarge: style('Body S/14 SemiBold'),
    labelMedium: style('Caption/12 Medium'),
    labelSmall: style('Caption/12 Medium'),

    // ─── Amounts ────────────────────────────────────────────────────────
    /** Hero balance on a gradient surface (dashboard, product detail). */
    balanceHero: style('Title MD/36 Bold', c.text.onDark),
    /** Decimals / currency suffix beside a hero balance. */
    balanceCents: style('Subtitle/20 SemiBold', c.text.onDarkSubtle),
    /** Amount inside a light card (product rows, statements). */
    amount: style('Body MD/16 Bold', c.text.primary),
    amountLarge: style('Title XS/24 Bold', c.text.primary),

    // ─── Utility ────────────────────────────────────────────────────────
    /** Uppercase micro-label above grouped content. */
    overline: style('Caption/12 SemiBold', c.text.tertiary),
    /** Caption under an icon in a quick-action grid. */
    actionLabel: style('Caption/12 Medium', c.text.primary),
  } satisfies Record<string, TextStyleToken>;
}

export type TextStyles = ReturnType<typeof buildTextStyles>;
export type TextStyleName = keyof TextStyles;

export const textStyles: TextStyles = buildTextStyles(colors);
export const textStylesDark: TextStyles = buildTextStyles(colorsDark);

/**
 * Line height in pixels, for React Native. Figma already gives it in px, so
 * this is the token's own value; kept so callers don't depend on the unit.
 */
export function lineHeightPx(style: TextStyleToken): number {
  return style.lineHeight;
}

export const typography = {
  fontFamily,
  textStyles,
} as const;

export const typographyDark: typeof typography = {
  fontFamily,
  textStyles: textStylesDark,
};
