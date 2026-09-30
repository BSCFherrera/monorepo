/**
 * Component tokens — sizes that belong to one kind of control.
 *
 * These are deliberately off the 4-pt spacing scale where the design is (a
 * 54-pt button, a 50-pt field): naming them here is what keeps those numbers
 * from being retyped by hand across screens and apps.
 *
 * Only reusable controls live here. Measurements that belong to a single
 * screen stay with that screen's feature code.
 */
import { spacing } from './spacing';
import { radius } from './radius';
import { fontWeight } from './primitives';
import { type TextStyleScaleName } from './typography';

export const button = {
  height: 54,
  /** Inside an empty state, where a full-height button would dominate. */
  heightCompact: 46,
  /** The "query" action next to a filter. */
  heightQuery: 48,
  /** Horizontal padding when the button stretches to the container width. */
  paddingXExpanded: 20,
  /** Horizontal padding when the button hugs its label. */
  paddingXHug: 24,
  iconLeading: 19,
  iconTrailing: 18,
} as const;

/**
 * Button sizes of the Figma library (`Buttons/Button`, `Size` property), read
 * from the library's `_Base Button base` component on 2026-09-23.
 *
 * Every size is a pill (`radius/full`) with an 8-pt gap between icon and
 * label. The label styles were measured on the SignIn screen (`lg` → 16
 * Medium, `md` → 14 Medium); `sm` and `xl` follow the same pairs.
 *
 * Buttons without a `size` keep `button.height` (54): screens move to these
 * one at a time.
 */
export const buttonSizes = {
  sm: { height: 36, paddingX: 14, textStyle: 'Body S/14 Medium' },
  md: { height: 40, paddingX: 16, textStyle: 'Body S/14 Medium' },
  lg: { height: 44, paddingX: 18, textStyle: 'Body MD/16 Medium' },
  xl: { height: 48, paddingX: 20, textStyle: 'Body MD/16 Medium' },
} as const satisfies Record<string, { height: number; paddingX: number; textStyle: TextStyleScaleName }>;

export const separator = {
  /** Between rows inside a card. */
  betweenRows: 16,
  /** Between blocks: they sit flush, the card edges separate them. */
  betweenBlocks: 0,
} as const;

export const textField = {
  height: 50,
  paddingX: 14,
  paddingY: 14,
} as const;

/** Spinner diameter by where it appears. */
export const spinner = {
  fullScreen: 36,
  screenList: 28,
  transactionList: 26,
  inRow: 24,
  inButton: 20,
  besideField: 18,
} as const;

export const sheet = {
  /** A modal sheet never grows past this fraction of the window height. */
  maxHeightFactor: 0.92,
  topRadius: radius.sheet,
} as const;

/** Transfer / payment receipt. */
export const receipt = {
  header: {
    circle: 80,
    icon: 56,
    titleGap: 16,
    titleFontSize: 20,
    amountGap: 6,
    amountFontSize: 28,
  },
  card: {
    padding: 18,
    gapBeforeTotal: 6,
  },
  subtitle: {
    fontSize: 11,
    gapBelow: 8,
  },
  line: {
    paddingY: 4,
    keyFontSize: 13,
    keyWeight: fontWeight.medium,
    valueFontSize: 13,
    valueWeight: fontWeight.semibold,
    emphasizedKeyFontSize: 14,
    emphasizedKeyWeight: fontWeight.bold,
    emphasizedValueFontSize: 16,
    emphasizedValueWeight: fontWeight.extrabold,
  },
  row: {
    iconBox: 36,
    icon: 18,
    gap: 10,
    titleFontSize: 13,
    subtitleFontSize: 12,
    amountFontSize: 13,
    tagFontSize: 11,
  },
  /** Opacity of the tinted square behind a row icon. */
  iconBackgroundOpacity: 0.12,
} as const;

/** Screen-level layout shared by every app. */
export const layout = {
  screenPaddingX: spacing.gutter,
} as const;

export const components = {
  button,
  buttonSizes,
  separator,
  textField,
  spinner,
  sheet,
  receipt,
  layout,
} as const;
