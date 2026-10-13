import {
  AUTH_BACK_MAP,
  AUTH_SCREEN_FLOW,
  SETUP_BACK_MAP,
  SETUP_SCREEN_FLOW,
} from '../flowTransitions';

describe('AUTH flow (pre-session)', () => {
  it('runs welcome → the account → the code', () => {
    expect(AUTH_SCREEN_FLOW).toEqual(['welcome', 'signup', 'verify']);
  });

  it('has no back from the welcome and chains the rest', () => {
    expect(AUTH_BACK_MAP.welcome).toBeNull();
    expect(AUTH_BACK_MAP.signup).toBe('welcome');
    expect(AUTH_BACK_MAP.verify).toBe('signup');
  });
});

describe('SETUP flow (post-session)', () => {
  it('runs name → goal → account → the first expense', () => {
    expect(SETUP_SCREEN_FLOW).toEqual(['name', 'goal', 'account', 'magic']);
  });

  it('has no back from name or the first expense; chains goal and account', () => {
    expect(SETUP_BACK_MAP.name).toBeNull();
    expect(SETUP_BACK_MAP.magic).toBeNull();
    expect(SETUP_BACK_MAP.goal).toBe('name');
    expect(SETUP_BACK_MAP.account).toBe('goal');
  });
});
