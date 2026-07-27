import { useMutation } from '@tanstack/react-query';

import { loginUseCase } from '@/core/di/container';

import type { AuthSessionDTO, LoginInputDTO } from '../../application';
import { useAuthStore } from '../stores/useAuthStore';

type Options = {
  onSuccess?: (session: AuthSessionDTO) => void;
};

/**
 * Persists the session metadata on success and defers navigation to the root
 * gate, which reacts to the store. `onSuccess` lets the caller add flow-level
 * behavior (e.g. marking onboarding complete for a returning user).
 */
export function useLogin(options?: Options) {
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation<AuthSessionDTO, Error, LoginInputDTO>({
    mutationFn: async (input) => {
      const result = await loginUseCase.execute(input);
      if (!result.ok) {
        throw result.error;
      }
      return result.value;
    },
    onSuccess: (session) => {
      setSession({
        userId: session.userId,
        email: session.email,
        displayName: session.displayName,
        tier: session.tier,
        emailVerified: session.emailVerified,
        currency: session.currency,
        objective: session.objective,
      });
      options?.onSuccess?.(session);
    },
  });
}
