/**
 * Spacing tokens.
 *
 * Everything in the UI snaps to this 4-pt scale so vertical rhythm stays
 * consistent between screens built by different people. Sizes that are not on
 * the scale (a 54-pt button, a 50-pt field) are component tokens — see
 * `components.ts` — not spacing.
 */
import { figmaLayout } from './generated/figma';
import { space } from './primitives';

export const spacing = {
  xxs: space[4],
  xs: space[8],
  sm: space[12],
  md: space[16],
  lg: space[20],
  xl: space[24],
  xxl: space[32],
  /** Horizontal margin of every screen-level container (Figma `grid/mobile/margin`). */
  gutter: figmaLayout.grid.mobile.margin,
} as const;

export type SpacingToken = keyof typeof spacing;
