import { useMutation } from '@tanstack/react-query';

import { verifyEmailUseCase } from '@/core/di/container';

import type { AuthSessionDTO, VerifyEmailInputDTO } from '../../application';
import { toSessionState } from '../stores/toSessionState';
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
      setSession(toSessionState(session));
      options?.onSuccess?.(session);
    },
  });
}
