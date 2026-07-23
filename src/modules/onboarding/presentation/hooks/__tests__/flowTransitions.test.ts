import { BACK_MAP, nextWelcome, prevWelcome, SCREEN_FLOW } from '../flowTransitions';

describe('SCREEN_FLOW', () => {
  it('matches the exact order from the design bundle', () => {
    expect(SCREEN_FLOW).toEqual([
      'welcome1',
      'welcome2',
      'welcome3',
      'auth',
      'perso1',
      'perso2',
      'setup',
      'magic',
      'confirm',
    ]);
  });
});

describe('BACK_MAP', () => {
  it('has no back from welcome1, magic and confirm', () => {
    expect(BACK_MAP.welcome1).toBeNull();
    expect(BACK_MAP.magic).toBeNull();
    expect(BACK_MAP.confirm).toBeNull();
  });

  it('chains back the welcome screens and the perso/setup steps', () => {
    expect(BACK_MAP.welcome2).toBe('welcome1');
    expect(BACK_MAP.welcome3).toBe('welcome2');
    expect(BACK_MAP.auth).toBe('welcome3');
    expect(BACK_MAP.perso1).toBe('auth');
    expect(BACK_MAP.perso2).toBe('perso1');
    expect(BACK_MAP.setup).toBe('perso2');
  });
});

describe('welcome navigation helpers', () => {
  it('advances from each welcome and jumps to auth from welcome3', () => {
    expect(nextWelcome(0)).toBe('welcome2');
    expect(nextWelcome(1)).toBe('welcome3');
    expect(nextWelcome(2)).toBe('auth');
  });

  it('returns null from welcome1 going back and chains otherwise', () => {
    expect(prevWelcome(0)).toBeNull();
    expect(prevWelcome(1)).toBe('welcome1');
    expect(prevWelcome(2)).toBe('welcome2');
  });
});
