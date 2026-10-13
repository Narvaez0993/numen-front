/**
 * The two modes: what a screen is made of before any accent touches it.
 *
 * `dark` is night, `light` is day — the names stay as they were so every existing
 * `mode === 'dark'` check keeps working. What changed is every value: the old
 * palette was blue-black and cold (`#0A0E1A`), the design's is near-neutral
 * (`#08080C`), and paper is `#F4F2F7` rather than `#F4F5F9`.
 *
 * These are the colours of the SCREEN. The bundle also paints the page around its
 * phone mockup, in a different and darker pair — reading those by mistake is what
 * made the first attempt look washed out.
 *
 * The base is flat: the light comes from the three blooms `Aurora` paints on top
 * of it, not from a gradient baked into the colour. That is why there is no
 * "far" stop any more — a bloom fades to nothing, not to another shade.
 *
 * Surfaces are **translucent on purpose**. In the design a card is white at 5% over
 * night and at 78% over paper, so the aurora behind the page shows through it. Solid
 * hexes would flatten that — the card would sit ON the background instead of IN it.
 */
export type ThemeMode = 'light' | 'dark';

export type ModeColors = {
  /** The page under everything. The aurora's blooms are painted over this. */
  bgBase: string;
  /** A card. Translucent — the aurora reads through. */
  bgSurface: string;
  /** One step up: icon wells, chips, the sheet over a screen. */
  bgFloat: string;
  /** Pressed and selected states. */
  bgElevated: string;
  /** A sheet that COVERS rather than floats. The other surfaces are deliberately
   *  translucent so the aurora reads through them, which is right for a card
   *  sitting on a page and wrong for a panel with its own content: at 5–10% white
   *  the screen underneath shows through the text and neither is readable. */
  bgSheet: string;

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
  /** How strongly each of the aurora's three blooms reads, 0..1. */
  aurora: { one: number; two: number; three: number };
};

export const modeColors: Record<ThemeMode, ModeColors> = {
  dark: {
    bgBase: '#08080C',
    bgSurface: 'rgba(255,255,255,0.05)',
    bgFloat: 'rgba(255,255,255,0.07)',
    bgElevated: 'rgba(255,255,255,0.10)',
    bgSheet: 'rgba(20,17,32,0.97)',

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
    aurora: { one: 0.3, two: 0.18, three: 0.16 },
  },
  light: {
    bgBase: '#F4F2F7',
    bgSurface: 'rgba(255,255,255,0.78)',
    bgFloat: 'rgba(255,255,255,0.92)',
    bgElevated: 'rgba(255,255,255,1)',
    bgSheet: 'rgba(250,249,252,0.98)',

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
    aurora: { one: 0.26, two: 0.22, three: 0.2 },
  },
};
