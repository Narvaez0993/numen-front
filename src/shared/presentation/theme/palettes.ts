/**
 * The five accent palettes, in both modes.
 *
 * Values come verbatim from the design bundle (`Deshka App.dc.html` for night,
 * `Deshka App Dia.dc.html` for day). Do NOT diverge without updating the bundle.
 *
 * The theme has **two axes**, not one. Mode (night/day) owns the surfaces and the
 * ink; the palette owns the accent, the orb and the aurora. They are not
 * independent lookups of the same hex: an accent that reads well as violet ink on
 * paper is unreadable as violet glow on black, so every palette carries a distinct
 * set per mode — ten palettes, not five.
 *
 * The design is otherwise **monochrome**: a screen is ink, one accent, and the two
 * semantic colours for money in and money out. There is no per-category rainbow,
 * which is why nothing here is keyed by category.
 */
import type { ThemeMode } from './modes';

export type PaletteId = 'violeta' | 'indigo' | 'jade' | 'cobre' | 'rosa';

export const PALETTE_IDS: readonly PaletteId[] = [
  'violeta',
  'indigo',
  'jade',
  'cobre',
  'rosa',
] as const;

export type PaletteColors = {
  /** The accent: links, active states, the figure a screen leads with. */
  acc: string;
  /** One step softer — secondary accents and icon strokes. */
  acc2: string;
  /** Softest — hairlines and accent text on accent backgrounds. */
  acc3: string;

  /** The orb's gradient, light core to dark rim. */
  orb1: string;
  orb2: string;
  orb3: string;
  /** What reads on top of the orb. */
  orbInk: string;

  /** The aurora behind the page: three tints bled into the background. */
  au1: string;
  au2: string;
  au3: string;
};

const night: Record<PaletteId, PaletteColors> = {
  violeta: {
    acc: '#C4A6FF',
    acc2: '#D8C7FF',
    acc3: '#E4D7FF',
    orb1: '#EDE4FF',
    orb2: '#B79BFF',
    orb3: '#6C4BFF',
    orbInk: '#FFFFFF',
    au1: '#7C5CFF',
    au2: '#C45CFF',
    au3: '#2E7BFF',
  },
  indigo: {
    acc: '#9DB6FF',
    acc2: '#BACBFF',
    acc3: '#D8E2FF',
    orb1: '#E6EEFF',
    orb2: '#8FACFF',
    orb3: '#3552D8',
    orbInk: '#FFFFFF',
    au1: '#3F6BFF',
    au2: '#4FA8FF',
    au3: '#6C4BFF',
  },
  jade: {
    acc: '#7FD9C0',
    acc2: '#A4E6D3',
    acc3: '#C9F2E6',
    orb1: '#E4FBF4',
    orb2: '#6FD3B9',
    orb3: '#127C64',
    orbInk: '#FFFFFF',
    au1: '#1FA184',
    au2: '#4FC9FF',
    au3: '#2FB89A',
  },
  cobre: {
    acc: '#F0B489',
    acc2: '#F6C9A8',
    acc3: '#FBDFC9',
    orb1: '#FFEFE2',
    orb2: '#E89F6E',
    orb3: '#B05A1E',
    orbInk: '#FFFFFF',
    au1: '#D97A34',
    au2: '#FF9E86',
    au3: '#FF8A4C',
  },
  rosa: {
    acc: '#F2A5C4',
    acc2: '#F7C0D6',
    acc3: '#FBDCE8',
    orb1: '#FFEDF4',
    orb2: '#EC93BB',
    orb3: '#A83568',
    orbInk: '#FFFFFF',
    au1: '#E05B95',
    au2: '#FF7AB0',
    au3: '#C45CFF',
  },
};

const day: Record<PaletteId, PaletteColors> = {
  violeta: {
    acc: '#5B3BD6',
    acc2: '#7C5CFF',
    acc3: '#4B2FBF',
    orb1: '#EDE4FF',
    orb2: '#A98BFF',
    orb3: '#5B3BD6',
    orbInk: '#FFFFFF',
    au1: '#9678FF',
    au2: '#FFAAD2',
    au3: '#8CBEFF',
  },
  indigo: {
    acc: '#2F4CC7',
    acc2: '#5A78F0',
    acc3: '#22389B',
    orb1: '#E6EEFF',
    orb2: '#7E9BFF',
    orb3: '#2F4CC7',
    orbInk: '#FFFFFF',
    au1: '#7C9BFF',
    au2: '#A8C6FF',
    au3: '#B7A6FF',
  },
  jade: {
    acc: '#0F7A62',
    acc2: '#1AA184',
    acc3: '#0B5A48',
    orb1: '#E4FBF4',
    orb2: '#4FC3A6',
    orb3: '#0F7A62',
    orbInk: '#FFFFFF',
    au1: '#5FD0B4',
    au2: '#A9EBDC',
    au3: '#7FD3FF',
  },
  cobre: {
    acc: '#A85718',
    acc2: '#D97A34',
    acc3: '#8A4512',
    orb1: '#FFEFE2',
    orb2: '#E89F6E',
    orb3: '#A85718',
    orbInk: '#FFFFFF',
    au1: '#F0A469',
    au2: '#FFC7A8',
    au3: '#FFB07A',
  },
  rosa: {
    acc: '#A83568',
    acc2: '#D6558C',
    acc3: '#8A2551',
    orb1: '#FFEDF4',
    orb2: '#EC93BB',
    orb3: '#A83568',
    orbInk: '#FFFFFF',
    au1: '#F09BC0',
    au2: '#FFC2DA',
    au3: '#D8A6FF',
  },
};

export const palettes: Record<ThemeMode, Record<PaletteId, PaletteColors>> = {
  dark: night,
  light: day,
};

export const DEFAULT_PALETTE: PaletteId = 'violeta';

/** Display names, as the design writes them in Perfil → Color. */
export const PALETTE_NAMES: Record<PaletteId, string> = {
  violeta: 'Violeta',
  indigo: 'Índigo',
  jade: 'Jade',
  cobre: 'Cobre',
  rosa: 'Rosa',
};

export function paletteFor(mode: ThemeMode, id: PaletteId): PaletteColors {
  return palettes[mode][id];
}

export function isPaletteId(value: string): value is PaletteId {
  return (PALETTE_IDS as readonly string[]).includes(value);
}
