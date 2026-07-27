/**
 * What the user said they came for, asked once in the onboarding and stored with
 * their preferences.
 *
 * It lives in `shared` because three modules speak it: `auth` owns it as a
 * preference, `onboarding` asks for it, and `home` uses it to decide **which figure
 * the hero leads with**. Same reason `CurrencyCode` lives here.
 */
export type Objective = 'gastos' | 'ahorrar' | 'deudas';

export const OBJECTIVES: readonly Objective[] = ['gastos', 'ahorrar', 'deudas'];
