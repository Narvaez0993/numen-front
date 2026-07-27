import type { Objective } from '@/shared/domain';

import type { AuthSessionState } from './useAuthStore';

/** Anything profile-shaped the API returns: a session payload or a profile. */
type SessionSource = {
  userId: string;
  email: string;
  displayName: string;
  tier: string;
  emailVerified: boolean;
  currency: string;
  objective: Objective | null;
};

/**
 * The one place a session is built from what the server returned.
 *
 * Four hooks used to list the fields by hand — login, verify, rename and
 * preferences — so adding one meant remembering four spots. `objective` was
 * forgotten in exactly one of them, and because that call spread the previous
 * session (`{ ...session, currency }`), TypeScript saw nothing wrong: the new
 * preference was saved server-side and the app kept reading the old value.
 *
 * Dropping the tokens is the other half of its job: they live in SecureStore, never
 * in this store.
 */
export function toSessionState(source: SessionSource): AuthSessionState {
  return {
    userId: source.userId,
    email: source.email,
    displayName: source.displayName,
    tier: source.tier,
    emailVerified: source.emailVerified,
    currency: source.currency,
    objective: source.objective,
  };
}
