/**
 * GENERATED from `figma/*.json` by `scripts/generate-from-figma.cjs`.
 * Do not edit: change the snapshot and run `pnpm nx run design-system:generate`.
 *
 * Mirrors the Figma library one-to-one. Nothing outside this package should
 * import it directly; `primitives.ts` and the semantic files map it onto the
 * names the apps use.
 */

// ─── BSC · Primitives ──────────────────────────────────────────────────────

export const figmaPalette = {
  brand: {
    blue: {
      50: '#F2F7FF',
      100: '#E8F1FF',
      200: '#D3E3FF',
      300: '#B6D0FF',
      400: '#8DB6FF',
      500: '#6999EF',
      600: '#467CDF',
      700: '#2D63C7',
      800: '#214FA5',
      900: '#003594',
      950: '#082458',
    },
    green: {
      50: '#E5FFE7',
      100: '#D7FBDB',
      200: '#C5EFC9',
      300: '#ACDFB1',
      400: '#89C891',
      500: '#62AF6D',
      600: '#009739',
      700: '#0C7E31',
      800: '#016725',
      900: '#004F1A',
      950: '#00320D',
    },
    neutral: {
      50: '#F4F7F7',
      100: '#EEF1F0',
      200: '#DFE3E2',
      300: '#CCD0CF',
      400: '#B1B7B6',
      500: '#959C9A',
      600: '#7B8281',
      700: '#636B69',
      800: '#505655',
      900: '#3F4443',
      950: '#252928',
    },
  },
  base: {
    white: '#FFFFFF',
    black: '#000000',
    ink: '#1A1F1E',
    inkStrong: '#0F1211',
  },
  error: {
    50: '#FEF2F2',
    100: '#FFE2E2',
    200: '#FFC9C9',
    300: '#FFA2A2',
    400: '#FF6467',
    500: '#FB2C36',
    600: '#E7000B',
    700: '#C10007',
    800: '#9F0712',
    900: '#82181A',
    950: '#460809',
  },
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C6',
    200: '#FEE685',
    300: '#FFD230',
    400: '#FFB900',
    500: '#FE9A00',
    600: '#E17100',
    700: '#BB4D00',
    800: '#973C00',
    900: '#7B3306',
    950: '#461901',
  },
  success: {
    50: '#ECFDF5',
    100: '#D0FAE5',
    200: '#A4F4CF',
    300: '#5EE9B5',
    400: '#00D492',
    500: '#00BC7D',
    600: '#009966',
    700: '#007A55',
    800: '#006045',
    900: '#004F3B',
    950: '#002C22',
  },
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A1A1A1',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0A0A0A',
  },
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DC',
    400: '#99A1AF',
    500: '#6A7282',
    600: '#4A5565',
    700: '#364153',
    800: '#1E2939',
    900: '#101828',
    950: '#030712',
  },
  sky: {
    50: '#F0F9FF',
    100: '#DFF2FE',
    200: '#B8E6FE',
    300: '#74D4FF',
    400: '#00BCFF',
    500: '#00A6F4',
    600: '#0084D1',
    700: '#0069A8',
    800: '#00598A',
    900: '#024A70',
    950: '#052F4A',
  },
  blue: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BEDBFF',
    300: '#8EC5FF',
    400: '#51A2FF',
    500: '#2B7FFF',
    600: '#155DFC',
    700: '#1447E6',
    800: '#193CB8',
    900: '#1C398E',
    950: '#162456',
  },
  indigo: {
    50: '#EEF2FF',
    100: '#E0E7FF',
    200: '#C6D2FF',
    300: '#A3B3FF',
    400: '#7C86FF',
    500: '#615FFF',
    600: '#4F39F6',
    700: '#432DD7',
    800: '#372AAC',
    900: '#312C85',
    950: '#1E1A4D',
  },
  purple: {
    50: '#FAF5FF',
    100: '#F3E8FF',
    200: '#E9D4FF',
    300: '#DAB2FF',
    400: '#C27AFF',
    500: '#AD46FF',
    600: '#9810FA',
    700: '#8200DB',
    800: '#6E11B0',
    900: '#59168B',
    950: '#3C0366',
  },
  pink: {
    50: '#FDF2F8',
    100: '#FCE7F3',
    200: '#FCCEE8',
    300: '#FDA5D5',
    400: '#FB64B6',
    500: '#F6339A',
    600: '#E60076',
    700: '#C6005C',
    800: '#A3004C',
    900: '#861043',
    950: '#510424',
  },
  slate: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CAD5E2',
    400: '#90A1B9',
    500: '#62748E',
    600: '#45556C',
    700: '#314158',
    800: '#1D293D',
    900: '#0F172B',
    950: '#020618',
  },
} as const;

// ─── BSC · Semantic (Light / Dark) ─────────────────────────────────────────

/** Shape shared by both modes of the semantic collection. */
export interface FigmaSemanticColors {
  bg: {
    canvas: string;
    surface: string;
    surfaceElevated: string;
    subtle: string;
    inverse: string;
    brand: string;
    disabled: string;
  };
  border: {
    default: string;
    strong: string;
    focus: string;
    disabled: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    onBrand: string;
    onPhoto: string;
    success: string;
    inverse: string;
    disabled: string;
    link: string;
  };
  action: {
    primary: string;
    primaryPressed: string;
    primarySubtle: string;
    primaryText: string;
    confirm: string;
    confirmSubtle: string;
    primaryHover: string;
    disabled: string;
    disabledContent: string;
  };
  brand: {
    green: string;
  };
  feedback: {
    danger: string;
    dangerSubtle: string;
    attention: string;
    attentionSubtle: string;
    success: string;
    successSubtle: string;
    info: string;
    infoSubtle: string;
  };
  overlay: {
    scrim: string;
  };
  icon: {
    primary: string;
    secondary: string;
    inverse: string;
    onBrand: string;
    disabled: string;
  };
}

export const figmaSemanticLight: FigmaSemanticColors = {
  bg: {
    canvas: figmaPalette.brand.neutral[50],
    surface: figmaPalette.base.white,
    surfaceElevated: figmaPalette.base.white,
    subtle: figmaPalette.brand.neutral[50],
    inverse: figmaPalette.brand.neutral[950],
    brand: figmaPalette.brand.blue[900],
    disabled: figmaPalette.brand.neutral[100],
  },
  border: {
    default: figmaPalette.brand.neutral[200],
    strong: figmaPalette.brand.neutral[300],
    focus: figmaPalette.brand.blue[700],
    disabled: figmaPalette.brand.neutral[300],
  },
  text: {
    primary: figmaPalette.brand.neutral[900],
    secondary: figmaPalette.brand.neutral[700],
    tertiary: figmaPalette.brand.neutral[600],
    onBrand: figmaPalette.base.white,
    onPhoto: figmaPalette.base.white,
    success: figmaPalette.success[700],
    inverse: figmaPalette.base.white,
    disabled: figmaPalette.brand.neutral[600],
    link: figmaPalette.brand.blue[900],
  },
  action: {
    primary: figmaPalette.brand.blue[900],
    primaryPressed: figmaPalette.brand.blue[950],
    primarySubtle: figmaPalette.brand.blue[50],
    primaryText: figmaPalette.brand.blue[900],
    confirm: figmaPalette.success[700],
    confirmSubtle: figmaPalette.success[50],
    primaryHover: figmaPalette.brand.blue[800],
    disabled: figmaPalette.brand.neutral[200],
    disabledContent: figmaPalette.brand.neutral[600],
  },
  brand: {
    green: figmaPalette.brand.green[600],
  },
  feedback: {
    danger: figmaPalette.error[700],
    dangerSubtle: figmaPalette.error[100],
    attention: figmaPalette.warning[800],
    attentionSubtle: figmaPalette.warning[100],
    success: figmaPalette.success[700],
    successSubtle: figmaPalette.success[100],
    info: figmaPalette.sky[700],
    infoSubtle: figmaPalette.sky[100],
  },
  overlay: {
    scrim: '#0000007A',
  },
  icon: {
    primary: figmaPalette.brand.neutral[900],
    secondary: figmaPalette.brand.neutral[700],
    inverse: figmaPalette.base.white,
    onBrand: figmaPalette.base.white,
    disabled: figmaPalette.brand.neutral[500],
  },
};

export const figmaSemanticDark: FigmaSemanticColors = {
  bg: {
    canvas: figmaPalette.base.inkStrong,
    surface: figmaPalette.base.ink,
    surfaceElevated: figmaPalette.brand.neutral[950],
    subtle: figmaPalette.brand.neutral[950],
    inverse: figmaPalette.base.white,
    brand: figmaPalette.brand.blue[400],
    disabled: figmaPalette.brand.neutral[900],
  },
  border: {
    default: figmaPalette.brand.neutral[800],
    strong: figmaPalette.brand.neutral[700],
    focus: figmaPalette.brand.blue[300],
    disabled: figmaPalette.brand.neutral[800],
  },
  text: {
    primary: figmaPalette.brand.neutral[100],
    secondary: figmaPalette.brand.neutral[400],
    tertiary: figmaPalette.brand.neutral[500],
    onBrand: figmaPalette.brand.neutral[950],
    onPhoto: figmaPalette.base.white,
    success: figmaPalette.success[300],
    inverse: figmaPalette.brand.neutral[950],
    disabled: figmaPalette.brand.neutral[500],
    link: figmaPalette.brand.blue[300],
  },
  action: {
    primary: figmaPalette.brand.blue[400],
    primaryPressed: figmaPalette.brand.blue[300],
    primarySubtle: figmaPalette.brand.blue[950],
    primaryText: figmaPalette.brand.blue[300],
    confirm: figmaPalette.success[400],
    confirmSubtle: figmaPalette.success[950],
    primaryHover: figmaPalette.brand.blue[500],
    disabled: figmaPalette.brand.neutral[800],
    disabledContent: figmaPalette.brand.neutral[400],
  },
  brand: {
    green: figmaPalette.brand.green[500],
  },
  feedback: {
    danger: figmaPalette.error[400],
    dangerSubtle: figmaPalette.error[800],
    attention: figmaPalette.warning[400],
    attentionSubtle: figmaPalette.warning[800],
    success: figmaPalette.success[300],
    successSubtle: figmaPalette.success[950],
    info: figmaPalette.sky[300],
    infoSubtle: figmaPalette.sky[950],
  },
  overlay: {
    scrim: '#000000A3',
  },
  icon: {
    primary: figmaPalette.brand.neutral[100],
    secondary: figmaPalette.brand.neutral[400],
    inverse: figmaPalette.brand.neutral[950],
    onBrand: figmaPalette.brand.neutral[950],
    disabled: figmaPalette.brand.neutral[500],
  },
};

// ─── BSC · Space & Radius ──────────────────────────────────────────────────

export const figmaSpace = {
  0: 0,
  4: 4,
  8: 8,
  12: 12,
  16: 16,
  20: 20,
  24: 24,
  28: 28,
  32: 32,
  40: 40,
  48: 48,
  64: 64,
  80: 80,
  96: 96,
  128: 128,
  160: 160,
  192: 192,
  224: 224,
  256: 256,
} as const;

export const figmaRadius = {
  4: 4,
  8: 8,
  12: 12,
  16: 16,
  24: 24,
  32: 32,
  full: 999,
} as const;

// ─── BSC · Typography ──────────────────────────────────────────────────────

export const figmaFontFamily = 'Google Sans Flex';

export const figmaFontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export const figmaFontSize = {
  12: 12,
  14: 14,
  16: 16,
  18: 18,
  20: 20,
  24: 24,
  30: 30,
  36: 36,
  48: 48,
  60: 60,
  72: 72,
} as const;

export const figmaLineHeight = {
  18: 18,
  20: 20,
  24: 24,
  28: 28,
  30: 30,
  32: 32,
  38: 38,
  44: 44,
  60: 60,
  72: 72,
  90: 90,
} as const;

export const figmaLetterSpacing = {
  tight: -2,
  normal: 0,
} as const;

/** The library's 44 text styles. Line height and letter spacing in px. */
export const figmaTextStyles = {
  'Title XXL/72 Regular': { fontSize: 72, fontWeight: '400', lineHeight: 90, letterSpacing: -2 },
  'Title XXL/72 Medium': { fontSize: 72, fontWeight: '500', lineHeight: 90, letterSpacing: -2 },
  'Title XXL/72 SemiBold': { fontSize: 72, fontWeight: '600', lineHeight: 90, letterSpacing: -2 },
  'Title XXL/72 Bold': { fontSize: 72, fontWeight: '700', lineHeight: 90, letterSpacing: -2 },
  'Title XL/60 Regular': { fontSize: 60, fontWeight: '400', lineHeight: 72, letterSpacing: -2 },
  'Title XL/60 Medium': { fontSize: 60, fontWeight: '500', lineHeight: 72, letterSpacing: -2 },
  'Title XL/60 SemiBold': { fontSize: 60, fontWeight: '600', lineHeight: 72, letterSpacing: -2 },
  'Title XL/60 Bold': { fontSize: 60, fontWeight: '700', lineHeight: 72, letterSpacing: -2 },
  'Title L/48 Regular': { fontSize: 48, fontWeight: '400', lineHeight: 60, letterSpacing: -2 },
  'Title L/48 Medium': { fontSize: 48, fontWeight: '500', lineHeight: 60, letterSpacing: -2 },
  'Title L/48 SemiBold': { fontSize: 48, fontWeight: '600', lineHeight: 60, letterSpacing: -2 },
  'Title L/48 Bold': { fontSize: 48, fontWeight: '700', lineHeight: 60, letterSpacing: -2 },
  'Title MD/36 Regular': { fontSize: 36, fontWeight: '400', lineHeight: 44, letterSpacing: -2 },
  'Title MD/36 Medium': { fontSize: 36, fontWeight: '500', lineHeight: 44, letterSpacing: -2 },
  'Title MD/36 SemiBold': { fontSize: 36, fontWeight: '600', lineHeight: 44, letterSpacing: -2 },
  'Title MD/36 Bold': { fontSize: 36, fontWeight: '700', lineHeight: 44, letterSpacing: -2 },
  'Title S/30 Regular': { fontSize: 30, fontWeight: '400', lineHeight: 38, letterSpacing: 0 },
  'Title S/30 Medium': { fontSize: 30, fontWeight: '500', lineHeight: 38, letterSpacing: 0 },
  'Title S/30 SemiBold': { fontSize: 30, fontWeight: '600', lineHeight: 38, letterSpacing: 0 },
  'Title S/30 Bold': { fontSize: 30, fontWeight: '700', lineHeight: 38, letterSpacing: 0 },
  'Title XS/24 Regular': { fontSize: 24, fontWeight: '400', lineHeight: 32, letterSpacing: 0 },
  'Title XS/24 Medium': { fontSize: 24, fontWeight: '500', lineHeight: 32, letterSpacing: 0 },
  'Title XS/24 SemiBold': { fontSize: 24, fontWeight: '600', lineHeight: 32, letterSpacing: 0 },
  'Title XS/24 Bold': { fontSize: 24, fontWeight: '700', lineHeight: 32, letterSpacing: 0 },
  'Subtitle/20 Regular': { fontSize: 20, fontWeight: '400', lineHeight: 30, letterSpacing: 0 },
  'Subtitle/20 Medium': { fontSize: 20, fontWeight: '500', lineHeight: 30, letterSpacing: 0 },
  'Subtitle/20 SemiBold': { fontSize: 20, fontWeight: '600', lineHeight: 30, letterSpacing: 0 },
  'Subtitle/20 Bold': { fontSize: 20, fontWeight: '700', lineHeight: 30, letterSpacing: 0 },
  'Body L/18 Regular': { fontSize: 18, fontWeight: '400', lineHeight: 28, letterSpacing: 0 },
  'Body L/18 Medium': { fontSize: 18, fontWeight: '500', lineHeight: 28, letterSpacing: 0 },
  'Body L/18 SemiBold': { fontSize: 18, fontWeight: '600', lineHeight: 28, letterSpacing: 0 },
  'Body L/18 Bold': { fontSize: 18, fontWeight: '700', lineHeight: 28, letterSpacing: 0 },
  'Body MD/16 Regular': { fontSize: 16, fontWeight: '400', lineHeight: 24, letterSpacing: 0 },
  'Body MD/16 Medium': { fontSize: 16, fontWeight: '500', lineHeight: 24, letterSpacing: 0 },
  'Body MD/16 SemiBold': { fontSize: 16, fontWeight: '600', lineHeight: 24, letterSpacing: 0 },
  'Body MD/16 Bold': { fontSize: 16, fontWeight: '700', lineHeight: 24, letterSpacing: 0 },
  'Body S/14 Regular': { fontSize: 14, fontWeight: '400', lineHeight: 20, letterSpacing: 0 },
  'Body S/14 Medium': { fontSize: 14, fontWeight: '500', lineHeight: 20, letterSpacing: 0 },
  'Body S/14 SemiBold': { fontSize: 14, fontWeight: '600', lineHeight: 20, letterSpacing: 0 },
  'Body S/14 Bold': { fontSize: 14, fontWeight: '700', lineHeight: 20, letterSpacing: 0 },
  'Caption/12 Regular': { fontSize: 12, fontWeight: '400', lineHeight: 18, letterSpacing: 0 },
  'Caption/12 Medium': { fontSize: 12, fontWeight: '500', lineHeight: 18, letterSpacing: 0 },
  'Caption/12 SemiBold': { fontSize: 12, fontWeight: '600', lineHeight: 18, letterSpacing: 0 },
  'Caption/12 Bold': { fontSize: 12, fontWeight: '700', lineHeight: 18, letterSpacing: 0 },
} as const;

export type FigmaTextStyleName = keyof typeof figmaTextStyles;

// ─── BSC · Effects (Light / Dark) ──────────────────────────────────────────

/** One drop-shadow layer, as Figma and CSS describe it. */
export interface FigmaShadowLayer {
  /** `#RRGGBBAA` — the opacity lives in the color. */
  color: string;
  offsetX: number;
  offsetY: number;
  blur: number;
  spread: number;
}

export type FigmaShadowScale = Record<'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl', readonly FigmaShadowLayer[]>;

export const figmaShadowsLight: FigmaShadowScale = {
  xs: [
    { color: '#0000000D', offsetX: 0, offsetY: 1, blur: 2, spread: 0 },
  ],
  sm: [
    { color: '#0000000F', offsetX: 0, offsetY: 1, blur: 2, spread: 0 },
    { color: '#0000001A', offsetX: 0, offsetY: 1, blur: 3, spread: 0 },
  ],
  md: [
    { color: '#0000000F', offsetX: 0, offsetY: 2, blur: 4, spread: -2 },
    { color: '#0000001A', offsetX: 0, offsetY: 4, blur: 8, spread: -2 },
  ],
  lg: [
    { color: '#00000008', offsetX: 0, offsetY: 4, blur: 6, spread: -2 },
    { color: '#00000014', offsetX: 0, offsetY: 12, blur: 16, spread: -4 },
  ],
  xl: [
    { color: '#00000008', offsetX: 0, offsetY: 8, blur: 8, spread: -4 },
    { color: '#00000014', offsetX: 0, offsetY: 20, blur: 24, spread: -4 },
  ],
  '2xl': [
    { color: '#0000002E', offsetX: 0, offsetY: 24, blur: 48, spread: -12 },
  ],
  '3xl': [
    { color: '#00000024', offsetX: 0, offsetY: 32, blur: 64, spread: -12 },
  ],
};

export const figmaShadowsDark: FigmaShadowScale = {
  xs: [
    { color: '#0000002E', offsetX: 0, offsetY: 1, blur: 2, spread: 0 },
  ],
  sm: [
    { color: '#00000033', offsetX: 0, offsetY: 1, blur: 2, spread: 0 },
    { color: '#0000003D', offsetX: 0, offsetY: 1, blur: 3, spread: 0 },
  ],
  md: [
    { color: '#00000033', offsetX: 0, offsetY: 2, blur: 4, spread: -2 },
    { color: '#00000042', offsetX: 0, offsetY: 4, blur: 8, spread: -2 },
  ],
  lg: [
    { color: '#0000002E', offsetX: 0, offsetY: 4, blur: 6, spread: -2 },
    { color: '#0000003D', offsetX: 0, offsetY: 12, blur: 16, spread: -4 },
  ],
  xl: [
    { color: '#00000029', offsetX: 0, offsetY: 8, blur: 8, spread: -4 },
    { color: '#00000038', offsetX: 0, offsetY: 20, blur: 24, spread: -4 },
  ],
  '2xl': [
    { color: '#00000052', offsetX: 0, offsetY: 24, blur: 48, spread: -12 },
  ],
  '3xl': [
    { color: '#0000004D', offsetX: 0, offsetY: 32, blur: 64, spread: -12 },
  ],
};

export const figmaBlur = {
  sm: 8,
  md: 16,
  lg: 24,
  xl: 40,
} as const;

// ─── BSC · Layout ──────────────────────────────────────────────────────────

export const figmaLayout = {
  viewport: {
    desktop: {
      macbookPro: {
        width: 1440,
        height: 900,
      },
    },
    tablet: {
      ipadMini: {
        width: 768,
        height: 1194,
      },
    },
    mobile: {
      iphone13Mini: {
        width: 375,
        height: 812,
      },
      iphone14: {
        width: 390,
        height: 844,
      },
      iphone17ProMax: {
        width: 440,
        height: 956,
      },
    },
  },
  grid: {
    desktop: {
      columns: 12,
      margin: 112,
      gutter: 32,
    },
    tablet: {
      columns: 6,
      margin: 32,
      gutter: 32,
    },
    mobile: {
      columns: 4,
      margin: 16,
      gutter: 16,
    },
    container: {
      gutter: 32,
      columns: {
        2: 2,
        3: 3,
        5: 5,
        6: 6,
        12: 12,
      },
      margin: 0,
    },
  },
  container: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
  },
} as const;
