import { useMutation } from '@tanstack/react-query';

import { resendCodeUseCase } from '@/core/di/container';

import type { ResendCodeInputDTO } from '../../application';

type Options = {
  onSuccess?: () => void;
};

/** Requests a fresh verification code. The backend enforces the cooldown. */
export function useResendCode(options?: Options) {
  return useMutation<void, Error, ResendCodeInputDTO>({
    mutationFn: async (input) => {
      const result = await resendCodeUseCase.execute(input);
      if (!result.ok) {
        throw result.error;
      }
    },
    onSuccess: () => options?.onSuccess?.(),
  });
}
