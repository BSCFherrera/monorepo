/** Corner-radius tokens. */
import { radiusScale } from './primitives';

export const radius = {
  xs: radiusScale[8],
  sm: radiusScale[12],
  md: radiusScale[16],
  lg: radiusScale[20],
  xl: radiusScale[24],
  sheet: radiusScale[28],
  pill: radiusScale.full,
} as const;

/** Radius by the element it shapes. */
export const semanticRadius = {
  card: radius.md,
  button: radius.md,
  field: radius.sm,
  chip: radius.pill,
  /** Only the top corners are rounded (borderTopLeft/RightRadius in RN). */
  sheetTop: radius.sheet,
} as const;

export type RadiusToken = keyof typeof radius;
