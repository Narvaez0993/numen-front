/**
 * Design tokens — Deshka.
 *
 * Values come from the official design bundle (`Deshka App.dc.html` /
 * `Deshka App Dia.dc.html`). Do NOT diverge without updating the bundle first.
 *
 * A theme is composed, not looked up: `mode` gives the surfaces and the ink,
 * `palette` gives the accent, the orb and the aurora. `buildTheme` puts them
 * together. That is why `themes` is gone — there is no longer a fixed pair of
 * themes to index, there are ten.
 *
 * The `ColorScheme` keys are deliberately unchanged. Every screen still reads
 * `theme.colors.bgSurface` and `theme.colors.accentCoral`, so the app keeps
 * running while it is redesigned one screen at a time — the alternative was a
 * flag day across forty components, which is exactly the kind of all-at-once
 * change this migration is trying not to make.
 */
import type { AccentColor } from '@/shared/domain';

import { modeColors, type ThemeMode } from './modes';
import {
  DEFAULT_PALETTE,
  paletteFor,
  type PaletteColors,
  type PaletteId,
} from './palettes';

export type { AccentColor };
export type { ThemeMode } from './modes';
export type { PaletteColors, PaletteId } from './palettes';
export {
  DEFAULT_PALETTE,
  isPaletteId,
  PALETTE_IDS,
  PALETTE_NAMES,
  palettes,
} from './palettes';
export { modeColors } from './modes';

export type ColorScheme = {
  bgBase: string;
  bgSurface: string;
  bgFloat: string;
  bgSheet: string;
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

/** `#RRGGBB` → `rgba(r,g,b,a)`. Tints are computed, not pasted, so a palette
 *  swap moves its own soft variants with it. */
export function withAlpha(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * The five named accents the app assigns to categories, accounts and people.
 *
 * The redesign is monochrome and does not use them — a screen is ink plus one
 * accent. They stay because the data does: the API still carries a `color` per
 * category and per account, and screens not yet redesigned still paint it. Each
 * one now borrows from the palette family so a half-migrated app never shows a
 * colour from the old system next to one from the new.
 */
function namedAccents(mode: ThemeMode, palette: PaletteColors) {
  const m = modeColors[mode];
  const warm = mode === 'dark' ? '#F0B489' : '#A85718';
  const rose = mode === 'dark' ? '#F2A5C4' : '#A83568';
  const tint = mode === 'dark' ? 0.16 : 0.12;

  return {
    accentMint: m.income,
    accentCoral: m.spend,
    accentPurple: palette.acc,
    accentAmber: warm,
    accentPink: rose,

    accentMintBg: withAlpha(m.income, tint),
    accentCoralBg: withAlpha(m.spend, tint),
    accentPurpleBg: withAlpha(palette.acc, tint),
    accentAmberBg: withAlpha(warm, tint),
    accentPinkBg: withAlpha(rose, tint),
  };
}

function colorsFor(mode: ThemeMode, palette: PaletteColors): ColorScheme {
  const m = modeColors[mode];
  return {
    bgBase: m.bgBase,
    bgSurface: m.bgSurface,
    bgFloat: m.bgFloat,
    bgSheet: m.bgSheet,
    bgElevated: m.bgElevated,

    borderSubtle: m.borderSubtle,
    borderDefault: m.borderDefault,

    textPrimary: m.textPrimary,
    textSecondary: m.textSecondary,
    textTertiary: m.textTertiary,

    ...namedAccents(mode, palette),

    scrim: m.scrim,
    fabShadow: withAlpha(palette.acc, mode === 'dark' ? 0.38 : 0.28),
  };
}

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

/** The design's own scale: 14 is the card, 22 the hero, 2–3 the bars of a chart. */
export const radius = {
  bar: 2,
  barLg: 3,
  pill: 7,
  sm: 10,
  md: 12,
  lg: 14,
  card: 14,
  panel: 18,
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
  /** The raw palette, for the screens that paint the orb and the aurora. */
  palette: PaletteColors;
  paletteId: PaletteId;
  mode: ThemeMode;
  /** Everything the mode owns, including the aurora strength and the far stop. */
  surfaces: (typeof modeColors)[ThemeMode];
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
};

export function buildTheme(
  mode: ThemeMode,
  paletteId: PaletteId = DEFAULT_PALETTE,
): Theme {
  const palette = paletteFor(mode, paletteId);
  return {
    colors: colorsFor(mode, palette),
    palette,
    paletteId,
    mode,
    surfaces: modeColors[mode],
    spacing,
    radius,
    typography,
  };
}

export const accentColorKey = (
  accent: AccentColor,
  variant: 'fg' | 'bg',
): keyof ColorScheme => {
  const capitalized = accent.charAt(0).toUpperCase() + accent.slice(1);
  return (
    variant === 'bg' ? `accent${capitalized}Bg` : `accent${capitalized}`
  ) as keyof ColorScheme;
};
