import {
  AUTH_BACK_MAP,
  AUTH_SCREEN_FLOW,
  nextWelcome,
  prevWelcome,
  SETUP_BACK_MAP,
  SETUP_SCREEN_FLOW,
} from '../flowTransitions';

describe('AUTH flow (pre-session)', () => {
  it('runs welcome hook → account → email → verify', () => {
    expect(AUTH_SCREEN_FLOW).toEqual([
      'welcome1',
      'welcome2',
      'welcome3',
      'account',
      'emailSignup',
      'verify',
    ]);
  });

  it('has no back from welcome1 and chains the rest', () => {
    expect(AUTH_BACK_MAP.welcome1).toBeNull();
    expect(AUTH_BACK_MAP.welcome2).toBe('welcome1');
    expect(AUTH_BACK_MAP.welcome3).toBe('welcome2');
    expect(AUTH_BACK_MAP.account).toBe('welcome3');
    expect(AUTH_BACK_MAP.emailSignup).toBe('account');
    expect(AUTH_BACK_MAP.verify).toBe('emailSignup');
  });
});

describe('SETUP flow (post-session)', () => {
  it('runs name → goal → setup → magic → confirm', () => {
    expect(SETUP_SCREEN_FLOW).toEqual(['name', 'goal', 'setup', 'magic', 'confirm']);
  });

  it('has no back from name, magic and confirm; chains goal and setup', () => {
    expect(SETUP_BACK_MAP.name).toBeNull();
    expect(SETUP_BACK_MAP.magic).toBeNull();
    expect(SETUP_BACK_MAP.confirm).toBeNull();
    expect(SETUP_BACK_MAP.goal).toBe('name');
    expect(SETUP_BACK_MAP.setup).toBe('goal');
  });
});

describe('welcome navigation helpers', () => {
  it('advances from each welcome and jumps to account from welcome3', () => {
    expect(nextWelcome(0)).toBe('welcome2');
    expect(nextWelcome(1)).toBe('welcome3');
    expect(nextWelcome(2)).toBe('account');
  });

  it('returns null from welcome1 going back and chains otherwise', () => {
    expect(prevWelcome(0)).toBeNull();
    expect(prevWelcome(1)).toBe('welcome1');
    expect(prevWelcome(2)).toBe('welcome2');
  });
});
