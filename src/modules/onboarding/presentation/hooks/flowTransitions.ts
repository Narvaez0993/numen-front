// The onboarding is split into two single-screen state machines by session
// state:
//   AUTH  (no session yet) → welcome, the account, the code
//   SETUP (session issued)  → name, goal, main account, first expense
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
// The first expense closes it, and it is real: the account it lands on is
// created one step before.
export type SetupStep = 'name' | 'goal' | 'account' | 'magic';

export const SETUP_SCREEN_FLOW: readonly SetupStep[] = [
  'name',
  'goal',
  'account',
  'magic',
];

export const SETUP_BACK_MAP: Readonly<Record<SetupStep, SetupStep | null>> = {
  // `name` is the resume entry point after verify, so it has no back; the first
  // expense comes after an account that already exists, so it has none either.
  name: null,
  goal: 'name',
  account: 'goal',
  magic: null,
};
