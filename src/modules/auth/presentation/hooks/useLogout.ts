import { useMutation } from '@tanstack/react-query';

import { logoutUseCase } from '@/core/di/container';

import { useAuthStore } from '../stores/useAuthStore';

type Options = {
  onSuccess?: () => void;
};

/**
 * Revokes the refresh token (best-effort) and clears local session state.
 * Onboarding stays marked complete so the gate routes to login, not signup.
 */
export function useLogout(options?: Options) {
  const clear = useAuthStore((state) => state.clear);

  return useMutation<void, Error, void>({
    mutationFn: () => logoutUseCase.execute(),
    onSettled: () => {
      clear();
      options?.onSuccess?.();
    },
  });
}
