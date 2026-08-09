import { mixColors } from '../mixColors';
import { modeColors } from '../modes';
import { PALETTE_IDS, palettes } from '../palettes';
import { buildTheme, withAlpha } from '../tokens';

describe('mixColors', () => {
  it('matches color-mix at the design’s aurora strength', () => {
    // 16% of #7C5CFF into #0C0B10 — the night violet aurora, verbatim.
    expect(mixColors('#7C5CFF', '#0C0B10', 0.16)).toBe('#1e1836');
  });

  it('returns the base at 0 and the tint at 1', () => {
    expect(mixColors('#FFFFFF', '#000000', 0)).toBe('#000000');
    expect(mixColors('#FFFFFF', '#000000', 1)).toBe('#ffffff');
  });
});

describe('the palettes', () => {
  it('carries a distinct set per mode', () => {
    // Ten palettes, not five: an accent that reads as violet ink on paper is
    // unreadable as violet glow on black.
    for (const id of PALETTE_IDS) {
      expect(palettes.dark[id].acc).not.toBe(palettes.light[id].acc);
    }
  });

  it('defines every palette in both modes', () => {
    for (const id of PALETTE_IDS) {
      expect(palettes.dark[id]).toBeDefined();
      expect(palettes.light[id]).toBeDefined();
    }
  });
});

describe('buildTheme', () => {
  it('takes the accent from the palette and the ink from the mode', () => {
    const jade = buildTheme('dark', 'jade');
    expect(jade.colors.accentPurple).toBe(palettes.dark.jade.acc);
    expect(jade.colors.textPrimary).toBe(modeColors.dark.textPrimary);
  });

  it('keeps money in and money out fixed to the mode, not the palette', () => {
    // The only two colours that mean something regardless of taste.
    const violeta = buildTheme('light', 'violeta');
    const cobre = buildTheme('light', 'cobre');
    expect(violeta.colors.accentCoral).toBe(cobre.colors.accentCoral);
    expect(violeta.colors.accentMint).toBe(cobre.colors.accentMint);
  });

  it('still answers every key the screens already read', () => {
    // The whole point of composing rather than replacing: no flag day.
    const theme = buildTheme('dark');
    for (const key of [
      'bgBase',
      'bgSurface',
      'bgFloat',
      'bgElevated',
      'borderSubtle',
      'borderDefault',
      'textPrimary',
      'textSecondary',
      'textTertiary',
      'accentMint',
      'accentCoral',
      'accentPurple',
      'accentAmber',
      'accentPink',
      'accentMintBg',
      'accentCoralBg',
      'accentPurpleBg',
      'accentAmberBg',
      'accentPinkBg',
      'scrim',
      'fabShadow',
    ] as const) {
      expect(theme.colors[key]).toBeTruthy();
    }
  });
});

describe('withAlpha', () => {
  it('turns a hex into an rgba of the same colour', () => {
    expect(withAlpha('#FF9B8A', 0.16)).toBe('rgba(255, 155, 138, 0.16)');
  });
});
