export type OnboardingScreen =
  | 'welcome1'
  | 'welcome2'
  | 'welcome3'
  | 'auth'
  | 'perso1'
  | 'perso2'
  | 'setup'
  | 'magic'
  | 'confirm';

export type AuthMode = 'signup' | 'login';

export const SCREEN_FLOW: readonly OnboardingScreen[] = [
  'welcome1',
  'welcome2',
  'welcome3',
  'auth',
  'perso1',
  'perso2',
  'setup',
  'magic',
  'confirm',
];

export const BACK_MAP: Readonly<Record<OnboardingScreen, OnboardingScreen | null>> = {
  welcome1: null,
  welcome2: 'welcome1',
  welcome3: 'welcome2',
  auth: 'welcome3',
  perso1: 'auth',
  perso2: 'perso1',
  setup: 'perso2',
  magic: null,
  confirm: null,
};

export function nextWelcome(idx: 0 | 1 | 2): OnboardingScreen {
  if (idx === 0) return 'welcome2';
  if (idx === 1) return 'welcome3';
  return 'auth';
}

export function prevWelcome(idx: 0 | 1 | 2): OnboardingScreen | null {
  if (idx === 0) return null;
  if (idx === 1) return 'welcome1';
  return 'welcome2';
}
