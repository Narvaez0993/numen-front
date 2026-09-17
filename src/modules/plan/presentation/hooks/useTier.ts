import { useAuthStore } from '@/modules/auth/presentation';
// By path, not through the barrel: the barrel pulls in screens, and the test for
// this hook stubs it to control the stored session. `useMe` has to stay real.
import { useMe } from '@/modules/auth/presentation/hooks/useMe';

export type PlanTier = 'free' | 'plus';

/**
 * What the user's plan actually is, according to the server.
 *
 * It has to be asked, not remembered, and both of the places it used to come
 * from were wrong in different ways:
 *
 * - `useAuthStore.session.tier` is stamped at login and persisted. Upgrade an
 *   account and the app keeps refusing on the old plan until the next sign-in.
 * - `usePlanStore.tier` was hard-coded to `'free'` and never spoke to anything.
 *   It was a placeholder for billing that four screens ended up trusting.
 *
 * The stored session seeds the first render so nothing flickers, and `/auth/me`
 * corrects it. The server is the authority anyway — every gate is enforced there
 * with a 403 — so a client that disagrees can only be wrong in the direction of
 * refusing something the user has paid for.
 */
export function useTier(): PlanTier {
  const stored = useAuthStore((s) => s.session?.tier);
  const { data } = useMe();

  const tier = data?.user.tier ?? stored;
  return tier === 'plus' ? 'plus' : 'free';
}
