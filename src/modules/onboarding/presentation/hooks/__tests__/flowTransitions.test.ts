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
