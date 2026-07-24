export type OnboardingScreen =
  | 'welcome1'
  | 'welcome2'
  | 'welcome3'
  | 'name'
  | 'account'
  | 'verify'
  | 'goal'
  | 'setup'
  | 'magic'
  | 'confirm';

export const SCREEN_FLOW: readonly OnboardingScreen[] = [
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
];

export const BACK_MAP: Readonly<Record<OnboardingScreen, OnboardingScreen | null>> = {
  welcome1: null,
  welcome2: 'welcome1',
  welcome3: 'welcome2',
  name: 'welcome3',
  account: 'name',
  verify: 'account',
  // Once the session is issued at `verify`, the auth steps are behind us.
  goal: null,
  setup: 'goal',
  magic: null,
  confirm: null,
};

export function nextWelcome(idx: 0 | 1 | 2): OnboardingScreen {
  if (idx === 0) return 'welcome2';
  if (idx === 1) return 'welcome3';
  return 'name';
}

export function prevWelcome(idx: 0 | 1 | 2): OnboardingScreen | null {
  if (idx === 0) return null;
  if (idx === 1) return 'welcome1';
  return 'welcome2';
}
