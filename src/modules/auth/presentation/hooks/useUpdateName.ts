import { useMutation } from '@tanstack/react-query';

import { updateDisplayNameUseCase } from '@/core/di/container';

import type { ProfileDTO } from '../../application';
import { useAuthStore } from '../stores/useAuthStore';

/**
 * Sets the display name after verification and refreshes the session store so
 * the app greets the user by name. Best-effort: the onboarding flow advances
 * regardless (the name is already kept in local flow context for greetings).
 */
export function useUpdateName() {
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation<ProfileDTO, Error, string>({
    mutationFn: async (name) => {
      const result = await updateDisplayNameUseCase.execute(name);
      if (!result.ok) {
        throw result.error;
      }
      return result.value;
    },
    onSuccess: (profile) => {
      setSession({
        userId: profile.userId,
        email: profile.email,
        displayName: profile.displayName,
        tier: profile.tier,
        emailVerified: profile.emailVerified,
        currency: profile.currency,
      });
    },
  });
}
