/**
 * BSC design system — semantic color tokens.
 *
 * Colors named by the job they do, not by their hue. Apps and components only
 * ever use these.
 *
 * Built once per mode from the Figma library's semantic collection
 * (`BSC · Semantic`, Light and Dark). Where the code has a role the library
 * doesn't define yet (gradients, chart ramp, text over the gradient…), the
 * value comes from `codeOnlyPalette` and is the same in both modes.
 *
 * Translucent values are `#RRGGBBAA` (alpha last).
 */
import {
  figmaSemanticDark,
  figmaSemanticLight,
  type FigmaSemanticColors,
} from './generated/figma';
import { codeOnlyPalette as codeOnly } from './primitives';

// ─── Gradients (code only) ─────────────────────────────────────────────────

export interface GradientStop {
  color: string;
  /** 0–1 along the gradient line. */
  offset: number;
}

/**
 * A linear gradient, described by its two end points in 0–1 box coordinates
 * (0,0 = top-left, 1,1 = bottom-right) rather than an angle.
 *
 * Points are what React Native gradients take, and they map to CSS as
 * `linear-gradient(to bottom right, …)`. An angle wouldn't: on a non-square
 * box `135deg` doesn't land on the corners, and the design does.
 */
export interface GradientToken {
  stops: readonly GradientStop[];
  start: { x: number; y: number };
  end: { x: number; y: number };
}

const TOP_LEFT = { x: 0, y: 0 } as const;
const BOTTOM_RIGHT = { x: 1, y: 1 } as const;

/**
 * The signature BSC gradient: navy dissolving into the institutional green.
 * Used on the login background, the dashboard header and every product hero.
 */
export const brandGradient: GradientToken = {
  stops: [
    { color: codeOnly.navy[700], offset: 0 },
    { color: codeOnly.navy[600], offset: 0.38 },
    { color: codeOnly.teal[600], offset: 0.8 },
    { color: codeOnly.green[500], offset: 1 },
  ],
  start: TOP_LEFT,
  end: BOTTOM_RIGHT,
};

/** Shorter, bluer variant for compact headers, where green would read as a second color. */
export const headerGradient: GradientToken = {
  stops: [
    { color: codeOnly.navy[700], offset: 0 },
    { color: codeOnly.navy[600], offset: 0.55 },
    { color: codeOnly.teal[700], offset: 1 },
  ],
  start: TOP_LEFT,
  end: BOTTOM_RIGHT,
};

export const accountCardGradient: GradientToken = brandGradient;

export const creditCardGradient: GradientToken = {
  stops: [
    { color: codeOnly.navy[700], offset: 0 },
    { color: codeOnly.navy[600], offset: 0.5 },
    { color: codeOnly.navy[500], offset: 1 },
  ],
  start: TOP_LEFT,
  end: BOTTOM_RIGHT,
};

export const greenGradient: GradientToken = {
  stops: [
    { color: codeOnly.green[700], offset: 0 },
    { color: codeOnly.green[500], offset: 0.5 },
    { color: codeOnly.green[400], offset: 1 },
  ],
  start: TOP_LEFT,
  end: BOTTOM_RIGHT,
};

/** Gradient for the elevated center action in the bottom bar. */
export const diamondGradient: GradientToken = {
  stops: [
    { color: codeOnly.navy[600], offset: 0 },
    { color: codeOnly.teal[600], offset: 1 },
  ],
  start: TOP_LEFT,
  end: BOTTOM_RIGHT,
};

export const gradients = {
  brand: brandGradient,
  header: headerGradient,
  accountCard: accountCardGradient,
  creditCard: creditCardGradient,
  green: greenGradient,
  diamond: diamondGradient,
} as const;

/** Categorical ramp for spend breakdowns / charts. Order matters. Code only. */
export const categorical = [
  codeOnly.blue[500],
  codeOnly.green[500],
  codeOnly.blue[400],
  codeOnly.violet[500],
  codeOnly.amber[500],
  codeOnly.teal[600],
] as const;

// ─── Semantic colors, per mode ─────────────────────────────────────────────

function buildColors(figma: FigmaSemanticColors) {
  const status = {
    success: figma.feedback.success,
    successSoft: figma.feedback.successSubtle,
    error: figma.feedback.danger,
    errorSoft: figma.feedback.dangerSubtle,
    warning: figma.feedback.attention,
    warningSoft: figma.feedback.attentionSubtle,
    info: figma.feedback.info,
    infoSoft: figma.feedback.infoSubtle,
  };

  return {
    /**
     * Brand blue is the primary action color; green is reserved for
     * positive/confirmation states.
     */
    brand: {
      ...figma.brand,
      primary: figma.action.primary,
      primaryDark: figma.action.primaryPressed,
      primarySoft: figma.action.primarySubtle,
      secondary: figma.brand.green,
      /** Code only. */
      primaryDeep: codeOnly.navy[900],
      /** Code only. */
      primaryLight: codeOnly.navy[500],
      /** Code only. */
      secondaryDark: codeOnly.green[700],
      /** Code only. */
      secondaryLight: codeOnly.green[400],
      /** Code only. */
      secondarySoft: codeOnly.green[50],
      /** Code only. Mid stop of the brand gradient (blue melting into green). */
      teal: codeOnly.teal[600],
    },

    surface: {
      /** Screen background behind cards. */
      background: figma.bg.canvas,
      default: figma.bg.surface,
      variant: figma.bg.subtle,
      /** Code only. */
      muted: codeOnly.slate[75],
    },

    text: {
      ...figma.text,
      onPrimary: figma.text.onBrand,
      /** Text over the brand gradient, which is dark in both modes. */
      onDark: figma.text.onPhoto,
      /** Code only. Secondary text over the brand gradient. White 78 %. */
      onDarkMuted: '#FFFFFFC7',
      /** Code only. Decimals / currency suffix beside a hero balance. White 70 %. */
      onDarkSubtle: '#FFFFFFB3',
    },

    status,

    /** Code only. Status colors tuned for legibility against the brand gradient. */
    onBrand: {
      positive: codeOnly.green[300],
      negative: codeOnly.red[300],
    },

    /** Code only. */
    notificationDot: codeOnly.red[400],

    transaction: {
      income: status.success,
      /** Code only. */
      expense: codeOnly.slate[700],
    },

    line: {
      border: figma.border.default,
      /** Code only. */
      divider: codeOnly.slate[100],
    },

    overlay: {
      ...figma.overlay,
      /** Code only. Light facet over the brand gradient backdrop. White 5.5 %. */
      facetLight: '#FFFFFF0E',
      /** Code only. Fainter facet over the brand gradient backdrop. White 3.5 %. */
      facetFaint: '#FFFFFF09',
      /** Code only. Dark wedge over the brand gradient backdrop. Navy at 12 %. */
      wedgeDark: '#041B3D1F',
    },

    // Groups that exist only in Figma, exposed under Figma's names.
    bg: figma.bg,
    border: figma.border,
    icon: figma.icon,
    action: figma.action,
    feedback: figma.feedback,

    categorical,
    gradients,
  };
}

export type Colors = ReturnType<typeof buildColors>;

export const colors: Colors = buildColors(figmaSemanticLight);
export const colorsDark: Colors = buildColors(figmaSemanticDark);

// Light-mode groups as named exports, for consumers that import them directly.
export const {
  brand,
  surface,
  text,
  status,
  onBrand,
  notificationDot,
  transaction,
  line,
  overlay,
} = colors;
