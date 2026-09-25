/**
 * Primitive tokens — the raw values, with no meaning attached.
 *
 * Nothing outside this package should reference a primitive directly: screens
 * and components use the semantic (`colors`, `spacing`, …) and component
 * (`components`) layers, which point here.
 *
 * Two sources, kept apart on purpose:
 *   - `palette`, `space`, the Figma half of `radiusScale` and `fontWeight`
 *     come from the Figma library (`src/generated/figma.ts`). Figma is the
 *     source of truth: change them there, re-read the snapshot, regenerate.
 *   - `codeOnlyPalette` and the steps marked "code only" have no Figma
 *     counterpart yet. They keep the values the app shipped before Figma was
 *     connected, and live here until the library defines them.
 *
 * Color format, everywhere in this package: `#RRGGBB`, or `#RRGGBBAA` when the
 * color is translucent (alpha is the LAST byte, CSS order).
 */
import { figmaFontWeight, figmaRadius } from './generated/figma';

/**
 * `palette`: the Figma library's color primitives, under their Figma names.
 * `space`: the 4-pt spacing scale (Figma `space/*`).
 */
export { figmaPalette as palette, figmaSpace as space } from './generated/figma';

/**
 * Raw colors the code uses that the Figma library doesn't define: the brand
 * gradients, the chart ramp and a few accents. Named by their old provisional
 * ramp position; they'll move to `palette` when Figma adds them.
 */
export const codeOnlyPalette = {
  navy: {
    500: '#1E5BC6',
    600: '#0B3B8C',
    700: '#0A2E6E',
    900: '#05204F',
  },
  teal: {
    600: '#0E7F63',
    700: '#126F70',
  },
  green: {
    50: '#E8F6EE',
    300: '#4ADE80',
    400: '#34C56D',
    500: '#00A651',
    700: '#00873F',
  },
  slate: {
    75: '#EFF3F9',
    100: '#EEF1F6',
    700: '#334155',
  },
  red: {
    300: '#FF8A8A',
    400: '#FF5A5F',
  },
  blue: {
    400: '#4CA6E8',
    500: '#2B5FD9',
  },
  amber: {
    500: '#F59E0B',
  },
  violet: {
    500: '#7C5CFC',
  },
} as const;

export const radiusScale = {
  ...figmaRadius,
  /** Code only. */
  20: 20,
  /** Code only: modal-sheet top corners. */
  28: 28,
} as const;

export const fontWeight = {
  ...figmaFontWeight,
  /** Code only: the receipt's emphasized total. */
  extrabold: '800',
} as const;

export type FontWeight = (typeof fontWeight)[keyof typeof fontWeight];
