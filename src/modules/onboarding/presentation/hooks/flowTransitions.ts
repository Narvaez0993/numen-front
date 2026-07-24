export type OnboardingScreen =
  | 'welcome1'
  | 'welcome2'
  | 'welcome3'
  | 'account'
  | 'emailSignup'
  | 'verify'
  | 'name'
  | 'goal'
  | 'setup'
  | 'magic'
  | 'confirm';

export const SCREEN_FLOW: readonly OnboardingScreen[] = [
  'welcome1',
  'welcome2',
  'welcome3',
  'account',
  'emailSignup',
  'verify',
  'name',
  'goal',
  'setup',
  'magic',
  'confirm',
];

export const BACK_MAP: Readonly<Record<OnboardingScreen, OnboardingScreen | null>> = {
  welcome1: null,
  welcome2: 'welcome1',
  welcome3: 'welcome2',
  account: 'welcome3',
  emailSignup: 'account',
  verify: 'emailSignup',
  // The session is issued at `verify`; the name is the first personalization
  // step and the resume entry point, so it has no back.
  name: null,
  goal: 'name',
  setup: 'goal',
  magic: null,
  confirm: null,
};

export function nextWelcome(idx: 0 | 1 | 2): OnboardingScreen {
  if (idx === 0) return 'welcome2';
  if (idx === 1) return 'welcome3';
  return 'account';
}

export function prevWelcome(idx: 0 | 1 | 2): OnboardingScreen | null {
  if (idx === 0) return null;
  if (idx === 1) return 'welcome1';
  return 'welcome2';
}
