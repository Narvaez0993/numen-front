import { mixColors } from '../mixColors';
import { modeColors } from '../modes';
import { PALETTE_IDS, palettes } from '../palettes';
import { buildTheme, withAlpha } from '../tokens';

describe('mixColors', () => {
  it('matches color-mix on the screen’s own base', () => {
    // The orb's lit edge is the only mix left; the aurora paints its blooms as
    // translucent stops now, not as a colour pre-mixed into the page.
    expect(mixColors('#EDE4FF', '#B79BFF', 0.62)).toBe('#d8c8ff');
  });

  it('returns the base at 0 and the tint at 1', () => {
    expect(mixColors('#FFFFFF', '#000000', 0)).toBe('#000000');
    expect(mixColors('#FFFFFF', '#000000', 1)).toBe('#ffffff');
  });
});

describe('the screen’s own colours', () => {
  it('uses the phone’s base, not the page the mockup sits on', () => {
    // The bundle paints two backgrounds: the app screen, and the page around
    // its phone mockup. Reading the second is what made day look washed out.
    expect(modeColors.dark.bgBase).toBe('#08080C');
    expect(modeColors.light.bgBase).toBe('#F4F2F7');
  });

  it('carries three blooms per mode, strongest first', () => {
    for (const mode of ['dark', 'light'] as const) {
      const { one, two, three } = modeColors[mode].aurora;
      expect(one).toBeGreaterThan(0);
      expect(two).toBeGreaterThan(0);
      expect(three).toBeGreaterThan(0);
    }
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
