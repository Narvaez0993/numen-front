export const palette = {
  white: '#FFFFFF',
  black: '#000000',
  neutral50: '#FAFAFA',
  neutral100: '#F4F4F5',
  neutral200: '#E4E4E7',
  neutral400: '#A1A1AA',
  neutral600: '#52525B',
  neutral800: '#27272A',
  neutral900: '#18181B',
  brand500: '#6D5BFF',
  brand600: '#5443FF',
  success500: '#22C55E',
  danger500: '#EF4444',
  warning500: '#F59E0B',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
} as const;

export const radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

export const typography = {
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
  },
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const;

export type ColorScheme = {
  background: string;
  surface: string;
  textPrimary: string;
  textSecondary: string;
  textInverse: string;
  border: string;
  primary: string;
  primaryPressed: string;
  success: string;
  danger: string;
  warning: string;
};

const lightColors: ColorScheme = {
  background: palette.white,
  surface: palette.neutral50,
  textPrimary: palette.neutral900,
  textSecondary: palette.neutral600,
  textInverse: palette.white,
  border: palette.neutral200,
  primary: palette.brand500,
  primaryPressed: palette.brand600,
  success: palette.success500,
  danger: palette.danger500,
  warning: palette.warning500,
};

const darkColors: ColorScheme = {
  background: palette.neutral900,
  surface: palette.neutral800,
  textPrimary: palette.neutral50,
  textSecondary: palette.neutral400,
  textInverse: palette.neutral900,
  border: palette.neutral800,
  primary: palette.brand500,
  primaryPressed: palette.brand600,
  success: palette.success500,
  danger: palette.danger500,
  warning: palette.warning500,
};

export type Theme = {
  colors: ColorScheme;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
};

export type ThemeMode = 'light' | 'dark';

export const themes: Record<ThemeMode, Theme> = {
  light: { colors: lightColors, spacing, radius, typography },
  dark: { colors: darkColors, spacing, radius, typography },
};
