import { BACK_MAP, nextWelcome, prevWelcome, SCREEN_FLOW } from '../flowTransitions';

describe('SCREEN_FLOW', () => {
  it('matches the auth-woven order', () => {
    expect(SCREEN_FLOW).toEqual([
      'welcome1',
      'welcome2',
      'welcome3',
      'name',
      'account',
      'verify',
      'goal',
      'setup',
      'magic',
      'confirm',
    ]);
  });
});

describe('BACK_MAP', () => {
  it('has no back from welcome1, goal, magic and confirm', () => {
    expect(BACK_MAP.welcome1).toBeNull();
    expect(BACK_MAP.goal).toBeNull();
    expect(BACK_MAP.magic).toBeNull();
    expect(BACK_MAP.confirm).toBeNull();
  });

  it('chains back the welcome screens and the account steps', () => {
    expect(BACK_MAP.welcome2).toBe('welcome1');
    expect(BACK_MAP.welcome3).toBe('welcome2');
    expect(BACK_MAP.name).toBe('welcome3');
    expect(BACK_MAP.account).toBe('name');
    expect(BACK_MAP.verify).toBe('account');
    expect(BACK_MAP.setup).toBe('goal');
  });
});

describe('welcome navigation helpers', () => {
  it('advances from each welcome and jumps to name from welcome3', () => {
    expect(nextWelcome(0)).toBe('welcome2');
    expect(nextWelcome(1)).toBe('welcome3');
    expect(nextWelcome(2)).toBe('name');
  });

  it('returns null from welcome1 going back and chains otherwise', () => {
    expect(prevWelcome(0)).toBeNull();
    expect(prevWelcome(1)).toBe('welcome1');
    expect(prevWelcome(2)).toBe('welcome2');
  });
});
