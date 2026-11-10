import type { Objective } from '@/shared/domain';

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

/** What the server already holds of the setup — each step saves its answer as
 *  it is given, so this is the truth about how far a user got. */
export type SetupProgress = {
  /** Empty until the name step: registration does not ask for one. */
  displayName: string;
  objective: Objective | null;
  hasAccount: boolean;
};

/**
 * Where a setup left halfway picks up (HU-03): the first step whose answer the
 * server does not have yet, so nothing already answered is asked again. With
 * everything answered only the first expense is left — it is an invitation, and
 * the step itself lets the user leave it for later.
 */
export function resumeSetupStep(progress: SetupProgress): SetupStep {
  if (progress.displayName.trim() === '') return 'name';
  if (progress.objective === null) return 'goal';
  if (!progress.hasAccount) return 'account';
  return 'magic';
}
