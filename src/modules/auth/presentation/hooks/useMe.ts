import { useQuery } from '@tanstack/react-query';

import { getCurrentUserUseCase } from '@/core/di/container';

import type { AuthSession } from '../../domain';

/** One cache entry for `/auth/me`, shared by everything that asks the server who
 *  this is: the plan gate reads the tier off it, Perfil reads the birthday. */
export const ME_KEY = ['auth', 'me'] as const;

/**
 * Who the server says this is.
 *
 * The stored session is a snapshot of a sign-in and goes stale in ways that
 * matter — the plan most of all — so anything that can change underneath it is
 * asked for again. A plan changes rarely, but "rarely" is not "never", and the
 * cost of being stale is refusing something the user has paid for.
 */
export function useMe() {
  return useQuery<AuthSession | null>({
    queryKey: ME_KEY,
    queryFn: () => getCurrentUserUseCase.execute(),
    staleTime: 60_000,
  });
}
