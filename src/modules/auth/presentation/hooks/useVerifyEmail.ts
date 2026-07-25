import { useMutation } from '@tanstack/react-query';

import { verifyEmailUseCase } from '@/core/di/container';

import type { AuthSessionDTO, VerifyEmailInputDTO } from '../../application';
import { useAuthStore } from '../stores/useAuthStore';

type Options = {
  onSuccess?: (session: AuthSessionDTO) => void;
};

/**
 * Confirms the code and establishes the session. Navigation and onboarding
 * completion are left to the caller via `onSuccess`.
 */
export function useVerifyEmail(options?: Options) {
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation<AuthSessionDTO, Error, VerifyEmailInputDTO>({
    mutationFn: async (input) => {
      const result = await verifyEmailUseCase.execute(input);
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
      });
      options?.onSuccess?.(session);
    },
  });
}
