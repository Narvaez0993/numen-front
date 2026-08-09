/**
 * The two modes: what a screen is made of before any accent touches it.
 *
 * `dark` is night, `light` is day — the names stay as they were so every existing
 * `mode === 'dark'` check keeps working. What changed is every value: the old
 * palette was blue-black and cold (`#0A0E1A`), the design's is near-neutral and
 * warm-violet (`#0A0A0D`), and paper is `#E9E6F0` rather than `#F4F5F9`.
 *
 * Surfaces are **translucent on purpose**. In the design a card is white at 5% over
 * night and at 78% over paper, so the aurora behind the page shows through it. Solid
 * hexes would flatten that — the card would sit ON the background instead of IN it.
 */
export type ThemeMode = 'light' | 'dark';

export type ModeColors = {
  /** The page under everything. The aurora is painted over this. */
  bgBase: string;
  /** Where the aurora fades to at the bottom of the page. */
  bgBaseFar: string;
  /** A card. Translucent — the aurora reads through. */
  bgSurface: string;
  /** One step up: icon wells, chips, the sheet over a screen. */
  bgFloat: string;
  /** Pressed and selected states. */
  bgElevated: string;

  borderSubtle: string;
  borderDefault: string;

  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  /** What reads on top of a filled accent. */
  textOnAccent: string;

  /** Money out and money in. The only two colours that mean something fixed. */
  spend: string;
  spendSoft: string;
  income: string;
  incomeSoft: string;

  scrim: string;
  /** How strongly the aurora bleeds into the page, 0..1. */
  auroraStrength: number;
};

export const modeColors: Record<ThemeMode, ModeColors> = {
  dark: {
    bgBase: '#0C0B10',
    bgBaseFar: '#0A0A0D',
    bgSurface: 'rgba(255,255,255,0.05)',
    bgFloat: 'rgba(255,255,255,0.07)',
    bgElevated: 'rgba(255,255,255,0.10)',

    borderSubtle: 'rgba(255,255,255,0.08)',
    borderDefault: 'rgba(255,255,255,0.14)',

    textPrimary: '#F3F1FA',
    textSecondary: 'rgba(243,241,250,0.72)',
    textTertiary: 'rgba(243,241,250,0.62)',
    textOnAccent: '#120F1E',

    spend: '#FF9B8A',
    spendSoft: '#FFC3B6',
    income: '#8CDCBE',
    incomeSoft: '#F7F5FF',

    scrim: 'rgba(0,0,0,0.62)',
    auroraStrength: 0.16,
  },
  light: {
    bgBase: '#F2EFF7',
    bgBaseFar: '#DFDCE6',
    bgSurface: 'rgba(255,255,255,0.78)',
    bgFloat: 'rgba(255,255,255,0.92)',
    bgElevated: 'rgba(255,255,255,1)',

    borderSubtle: 'rgba(26,22,38,0.08)',
    borderDefault: 'rgba(26,22,38,0.14)',

    textPrimary: '#1A1626',
    textSecondary: 'rgba(26,22,38,0.72)',
    textTertiary: 'rgba(26,22,38,0.62)',
    textOnAccent: '#FFFFFF',

    spend: '#C0442E',
    spendSoft: '#A8341E',
    income: '#1C7A5B',
    incomeSoft: '#F4F2F7',

    scrim: 'rgba(26,22,38,0.38)',
    auroraStrength: 0.14,
  },
};
