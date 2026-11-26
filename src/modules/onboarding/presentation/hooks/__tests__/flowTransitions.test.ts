import {
  AUTH_BACK_MAP,
  AUTH_SCREEN_FLOW,
  resumeSetupStep,
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

describe('HU-03 · Onboarding incompleto: where a setup left halfway resumes', () => {
  const nothing = { displayName: '', objective: null, hasAccount: false };

  it('starts at the name when the server has none', () => {
    expect(resumeSetupStep(nothing)).toBe('name');
    expect(resumeSetupStep({ ...nothing, displayName: '   ' })).toBe('name');
  });

  it('skips the name already given and asks for the objective', () => {
    expect(resumeSetupStep({ ...nothing, displayName: 'Laura' })).toBe('goal');
  });

  it('asks for the first account when only that is missing', () => {
    expect(
      resumeSetupStep({ displayName: 'Laura', objective: 'ahorrar', hasAccount: false }),
    ).toBe('account');
  });

  it('goes straight to the first expense once the account exists', () => {
    expect(
      resumeSetupStep({ displayName: 'Laura', objective: 'gastos', hasAccount: true }),
    ).toBe('magic');
  });
});
