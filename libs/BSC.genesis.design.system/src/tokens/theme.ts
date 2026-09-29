import { colors, colorsDark } from './colors';
import { typography, typographyDark } from './typography';
import { spacing } from './spacing';
import { radius, semanticRadius } from './radius';
import { shadows, shadowsDark } from './shadows';
import { components } from './components';

/**
 * Everything an app needs to style itself, in one object per mode. The two
 * modes follow the Figma library's Light and Dark; tokens the library doesn't
 * define yet (gradients, glows, text over the gradient…) are the same in both.
 */
export const theme = {
  colors,
  typography,
  spacing,
  radius,
  semanticRadius,
  shadows,
  components,
} as const;

export type Theme = typeof theme;

export const darkTheme: Theme = {
  ...theme,
  colors: colorsDark,
  typography: typographyDark,
  shadows: shadowsDark,
};

export const themes = { light: theme, dark: darkTheme } as const;
export type ThemeMode = keyof typeof themes;
