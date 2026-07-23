/**
 * Design tokens — Gastos by IM (numen).
 *
 * Values come from the official design bundle `tokens.css`. Do NOT diverge
 * without updating the bundle first.
 */
import type { AccentColor } from '@/shared/domain';

export type { AccentColor };

export type ColorScheme = {
  bgBase: string;
  bgSurface: string;
  bgFloat: string;
  bgElevated: string;

  borderSubtle: string;
  borderDefault: string;

  textPrimary: string;
  textSecondary: string;
  textTertiary: string;

  accentMint: string;
  accentCoral: string;
  accentPurple: string;
  accentAmber: string;
  accentPink: string;

  accentMintBg: string;
  accentCoralBg: string;
  accentPurpleBg: string;
  accentAmberBg: string;
  accentPinkBg: string;

  scrim: string;
  fabShadow: string;
};

const darkColors: ColorScheme = {
  bgBase: '#0A0E1A',
  bgSurface: '#141925',
  bgFloat: '#1C2333',
  bgElevated: '#252D3F',

  borderSubtle: '#1C2333',
  borderDefault: '#252D3F',

  textPrimary: '#FFFFFF',
  textSecondary: '#A8B2C8',
  textTertiary: '#6B7688',

  accentMint: '#00E5A8',
  accentCoral: '#FF6B47',
  accentPurple: '#8B7FFF',
  accentAmber: '#FFB547',
  accentPink: '#FF99C8',

  accentMintBg: 'rgba(0, 229, 168, 0.15)',
  accentCoralBg: 'rgba(255, 107, 71, 0.15)',
  accentPurpleBg: 'rgba(139, 127, 255, 0.15)',
  accentAmberBg: 'rgba(255, 181, 71, 0.15)',
  accentPinkBg: 'rgba(255, 153, 200, 0.15)',

  scrim: 'rgba(0, 0, 0, 0.55)',
  fabShadow: 'transparent',
};

const lightColors: ColorScheme = {
  // Soft gray page so white cards read as a layer (mirrors dark's depth).
  bgBase: '#F4F5F9',
  bgSurface: '#FFFFFF',
  bgFloat: '#F0F2F7',
  bgElevated: '#E8EBF2',

  borderSubtle: '#E5E8F0',
  borderDefault: '#D5D9E3',

  textPrimary: '#0A0E1A',
  textSecondary: '#4C5568',
  textTertiary: '#8A93A8',

  accentMint: '#00B589',
  accentCoral: '#E04D24',
  accentPurple: '#5C4FE8',
  accentAmber: '#D49000',
  accentPink: '#D4477F',

  accentMintBg: 'rgba(0, 181, 137, 0.12)',
  accentCoralBg: 'rgba(224, 77, 36, 0.12)',
  accentPurpleBg: 'rgba(92, 79, 232, 0.12)',
  accentAmberBg: 'rgba(212, 144, 0, 0.12)',
  accentPinkBg: 'rgba(212, 71, 127, 0.12)',

  scrim: 'rgba(10, 14, 26, 0.35)',
  fabShadow: 'rgba(224, 77, 36, 0.3)',
};

export const spacing = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 10,
  xl: 12,
  '2xl': 14,
  '3xl': 16,
  '4xl': 18,
  '5xl': 22,
  '6xl': 26,
} as const;

export const radius = {
  pill: 7,
  sm: 10,
  md: 12,
  lg: 14,
  card: 18,
  hero: 22,
  full: 9999,
} as const;

export const typography = {
  sizes: {
    micro: 10.5,
    caption: 11.5,
    body: 13,
    bodyLarge: 14,
    h2: 14,
    h1: 17,
    display: 30,
  },
  weights: {
    regular: '400',
    medium: '500',
  },
  letterSpacing: {
    tight: -0.02,
    normal: 0,
    wide: 0.08,
    wider: 0.1,
  },
} as const;

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

export const accentColorKey = (
  accent: AccentColor,
  variant: 'fg' | 'bg',
): keyof ColorScheme => {
  const capitalized = accent.charAt(0).toUpperCase() + accent.slice(1);
  return (
    variant === 'bg' ? `accent${capitalized}Bg` : `accent${capitalized}`
  ) as keyof ColorScheme;
};
