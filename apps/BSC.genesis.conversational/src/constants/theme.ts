// Colores del tema - Banco Santa Cruz
export const COLORS = {
  // Colores primarios
  primary: '#002d80', // Azul corporativo
  primaryLight: '#0052AD',
  primaryDark: '#002557',

  // Colores secundarios
  secondary: '#00A651', // Verde corporativo
  secondaryLight: '#4CAF50',
  secondaryDark: '#00802E',

  // Colores de acento
  accent: '#FFA000', // Naranja/Dorado
  accentLight: '#FFCA28',
  accentDark: '#FF6F00',

  // Colores de estado
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',

  // Colores de fondo
  background: '#F5F7FA',
  backgroundLight: '#FFFFFF',
  backgroundDark: '#E8EBF0',

  // Colores de texto
  textPrimary: '#1A1A1A',
  textSecondary: '#666666',
  textDisabled: '#9E9E9E',
  textLight: '#FFFFFF',

  // Colores de bordes
  border: '#E0E0E0',
  borderLight: '#F0F0F0',
  borderDark: '#BDBDBD',

  // Colores del chat
  userMessage: '#003D82',
  botMessage: '#FFFFFF',
  messageBorder: '#E0E0E0',

  // Transparencias
  overlay: 'rgba(0, 0, 0, 0.5)',
  shadowColor: 'rgba(0, 0, 0, 0.1)',
};

// Espaciados
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Tamaños de fuente
export const FONT_SIZES = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 20,
  title: 24,
  heading: 28,
  display: 32,
};

// Pesos de fuente
export const FONT_WEIGHTS = {
  light: '300' as const,
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

// Border radius
export const BORDER_RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  round: 999,
};

// Sombras
export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

// Dimensiones
export const DIMENSIONS = {
  buttonHeight: 48,
  inputHeight: 48,
  headerHeight: 60,
  tabBarHeight: 60,
  iconSize: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 32,
    xl: 40,
  },
};
