/**
 * Sistema de diseño BSC — colores, en la forma que usan los componentes.
 *
 * Los valores viven en `@bsc/design-tokens`. Este archivo solo los presenta
 * como un mapa plano (`BscColors.primary`) y traduce los degradados a lo que
 * espera `react-native-linear-gradient`. Cambiar un color es cambiar el token.
 */
import {
  brand,
  categorical,
  gradients,
  line,
  notificationDot,
  onBrand,
  status,
  surface,
  text,
  transaction,
  type GradientToken,
} from '@bsc/design-tokens';

export const BscColors = {
  // ─── Marca: azul ────────────────────────────────────────────────────────
  primary: brand.primary,
  primaryDark: brand.primaryDark,
  primaryDeep: brand.primaryDeep,
  primaryLight: brand.primaryLight,
  primarySoft: brand.primarySoft,

  // ─── Marca: verde ───────────────────────────────────────────────────────
  secondary: brand.secondary,
  secondaryDark: brand.secondaryDark,
  secondaryLight: brand.secondaryLight,
  secondarySoft: brand.secondarySoft,

  /** Punto medio del gradiente de marca: el azul fundiéndose en el verde. */
  teal: brand.teal,

  // ─── Neutros ────────────────────────────────────────────────────────────
  background: surface.background,
  surface: surface.default,
  surfaceVariant: surface.variant,
  surfaceMuted: surface.muted,

  // ─── Texto ──────────────────────────────────────────────────────────────
  textPrimary: text.primary,
  textSecondary: text.secondary,
  textTertiary: text.tertiary,
  textOnPrimary: text.onPrimary,
  textOnDark: text.onDark,

  // ─── Estados ────────────────────────────────────────────────────────────
  success: status.success,
  successSoft: status.successSoft,
  error: status.error,
  errorSoft: status.errorSoft,
  warning: status.warning,
  warningSoft: status.warningSoft,
  info: status.info,
  infoSoft: status.infoSoft,

  // ─── Sobre el gradiente de marca ────────────────────────────────────────
  onBrandPositive: onBrand.positive,
  onBrandNegative: onBrand.negative,

  /** Punto de notificación sin leer. */
  notificationDot,

  // ─── Transacciones ──────────────────────────────────────────────────────
  income: transaction.income,
  expense: transaction.expense,

  // ─── Líneas ─────────────────────────────────────────────────────────────
  border: line.border,
  divider: line.divider,
} as const;

export type BscColorToken = keyof typeof BscColors;

/** Rampa categórica para desgloses de gastos y gráficos. */
export const BscCategoricalColors = categorical;

/**
 * Un degradado en la forma de `react-native-linear-gradient`: colores,
 * paradas y los dos extremos en coordenadas de 0 a 1.
 */
export interface BscGradient {
  colors: readonly string[];
  /** Paradas normalizadas. Ausente significa reparto uniforme. */
  locations?: readonly number[];
  start: { x: number; y: number };
  end: { x: number; y: number };
}

/** Traduce un degradado del paquete de tokens a la forma de React Native. */
export function toNativeGradient(token: GradientToken): BscGradient {
  return {
    colors: token.stops.map(s => s.color),
    locations: token.stops.map(s => s.offset),
    start: token.start,
    end: token.end,
  };
}

/**
 * El gradiente distintivo de BSC: azul marino arriba a la izquierda
 * disolviéndose en el verde institucional abajo a la derecha. Se usa en el
 * fondo del login, la cabecera del dashboard y cada hero de producto.
 */
export const brandGradient = toNativeGradient(gradients.brand);

/**
 * Variante más corta y más azul, para cabeceras compactas donde el verde se
 * leería como un segundo color en vez de como un acento.
 */
export const headerGradient = toNativeGradient(gradients.header);

export const accountCardGradient = toNativeGradient(gradients.accountCard);

export const creditCardGradient = toNativeGradient(gradients.creditCard);

export const greenGradient = toNativeGradient(gradients.green);

/** Gradiente de la acción central elevada de la barra inferior. */
export const diamondGradient = toNativeGradient(gradients.diamond);

export const BscGradients = {
  brand: brandGradient,
  header: headerGradient,
  accountCard: accountCardGradient,
  creditCard: creditCardGradient,
  green: greenGradient,
  diamond: diamondGradient,
} as const;
