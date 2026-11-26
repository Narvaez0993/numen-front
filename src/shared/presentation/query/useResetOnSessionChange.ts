import type { QueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

/**
 * Empties the query cache when the signed-in user goes away or is replaced:
 * signing out, a session that expires, or another account signing in on the
 * same device. The cache is keyed by screen, not by user, so without this the
 * next account would be shown — and the setup would trust — the previous one's
 * profile and accounts until each query refetched.
 *
 * Going from no user to a user (signing in, or the session rehydrating at
 * launch) keeps the cache: there is nobody else's data in it to drop.
 */
export function useResetOnSessionChange(
  queryClient: QueryClient,
  sessionKey: string | null,
): void {
  const previous = useRef(sessionKey);

  useEffect(() => {
    const before = previous.current;
    previous.current = sessionKey;
    if (before !== null && before !== sessionKey) queryClient.clear();
  }, [queryClient, sessionKey]);
}
