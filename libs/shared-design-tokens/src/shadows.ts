/**
 * Shadow tokens, kept platform-neutral: each one is a stack of drop-shadow
 * layers (color, offset, blur, spread) — what Figma, CSS `box-shadow` and
 * React Native's `boxShadow` all describe, so one token renders the same on
 * iOS, Android and web.
 *
 * `card` and `subtle` are the Figma library's `Shadow/MD` and `Shadow/SM`.
 * `bar` and `primary` have no Figma counterpart yet and stay code only.
 */
import {
  figmaShadowsDark,
  figmaShadowsLight,
  type FigmaShadowLayer,
  type FigmaShadowScale,
} from './generated/figma';
import { codeOnlyPalette } from './primitives';

export type ShadowLayer = FigmaShadowLayer;

/** Layers are painted in order, the first one on top (CSS order). */
export type ShadowToken = readonly ShadowLayer[];

/** The library's full elevation scale (`Shadow/XS` … `Shadow/3XL`). */
export const shadowScale: FigmaShadowScale = figmaShadowsLight;
export const shadowScaleDark: FigmaShadowScale = figmaShadowsDark;

/**
 * Code only. Bottom bar / sheet lift: the shadow points upward, which none of
 * the library's shadows do.
 */
export const barShadow: ShadowToken = [
  { color: '#0F203314', offsetX: 0, offsetY: -6, blur: 24, spread: 0 },
];

/** Alpha byte for colored glows: 28 % (0.28 × 255 ≈ 71 = 0x47). */
const GLOW_ALPHA = '47';

/** Code only. Colored glow under buttons and highlighted elements. `color` is `#RRGGBB`. */
export function coloredShadow(color: string): ShadowToken {
  if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
    throw new Error(`coloredShadow expects #RRGGBB, got "${color}"`);
  }
  return [
    { color: `${color.toUpperCase()}${GLOW_ALPHA}`, offsetX: 0, offsetY: 8, blur: 18, spread: 0 },
  ];
}

function buildShadows(scale: FigmaShadowScale) {
  return {
    /** Resting elevation for content cards. */
    card: scale.md,
    subtle: scale.sm,
    bar: barShadow,
    /**
     * Code only. The glow's color is frozen at the pre-Figma brand navy, like
     * the gradients; it doesn't follow `brand.primary`.
     */
    primary: coloredShadow(codeOnlyPalette.navy[600]),
  };
}

export type Shadows = ReturnType<typeof buildShadows>;

export const shadows: Shadows = buildShadows(shadowScale);
export const shadowsDark: Shadows = buildShadows(shadowScaleDark);

/** The brand-blue glow, the most common colored shadow. */
export const primaryShadow: ShadowToken = shadows.primary;
