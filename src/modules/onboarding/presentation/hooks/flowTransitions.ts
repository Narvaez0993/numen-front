// The onboarding is split into two single-screen state machines by session
// state:
//   AUTH  (no session yet) → welcome hook, account picker, email signup, verify
//   SETUP (session issued)  → name, goal, account setup, magic moment, confirm
// The session is issued at `verify`; from there the RootGate moves the user
// into the SETUP group.

// ── AUTH flow ───────────────────────────────────────────────────────────────
export type AuthStep =
  | 'welcome1'
  | 'welcome2'
  | 'welcome3'
  | 'account'
  | 'emailSignup'
  | 'verify';

export const AUTH_SCREEN_FLOW: readonly AuthStep[] = [
  'welcome1',
  'welcome2',
  'welcome3',
  'account',
  'emailSignup',
  'verify',
];

export const AUTH_BACK_MAP: Readonly<Record<AuthStep, AuthStep | null>> = {
  welcome1: null,
  welcome2: 'welcome1',
  welcome3: 'welcome2',
  account: 'welcome3',
  emailSignup: 'account',
  verify: 'emailSignup',
};

export function nextWelcome(idx: 0 | 1 | 2): AuthStep {
  if (idx === 0) return 'welcome2';
  if (idx === 1) return 'welcome3';
  return 'account';
}

export function prevWelcome(idx: 0 | 1 | 2): AuthStep | null {
  if (idx === 0) return null;
  if (idx === 1) return 'welcome1';
  return 'welcome2';
}

// ── SETUP flow ──────────────────────────────────────────────────────────────
export type SetupStep = 'name' | 'goal' | 'setup' | 'magic' | 'confirm';

export const SETUP_SCREEN_FLOW: readonly SetupStep[] = [
  'name',
  'goal',
  'setup',
  'magic',
  'confirm',
];

export const SETUP_BACK_MAP: Readonly<Record<SetupStep, SetupStep | null>> = {
  // `name` is the resume entry point after verify, so it has no back; `magic`
  // and `confirm` can't reverse into earlier steps.
  name: null,
  goal: 'name',
  setup: 'goal',
  magic: null,
  confirm: null,
};
