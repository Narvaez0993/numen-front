// The onboarding is split into two single-screen state machines by session
// state:
//   AUTH  (no session yet) → welcome, the account, the code
//   SETUP (session issued)  → name, goal, account setup, magic moment, confirm
// The session is issued at `verify`; from there the RootGate moves the user
// into the SETUP group.

// ── AUTH flow ───────────────────────────────────────────────────────────────
// Three screens, as the design draws them. The welcome used to be a three-slide
// carousel and the account two screens (pick a method, then the form).
export type AuthStep = 'welcome' | 'signup' | 'verify';

export const AUTH_SCREEN_FLOW: readonly AuthStep[] = ['welcome', 'signup', 'verify'];

export const AUTH_BACK_MAP: Readonly<Record<AuthStep, AuthStep | null>> = {
  welcome: null,
  signup: 'welcome',
  verify: 'signup',
};

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
