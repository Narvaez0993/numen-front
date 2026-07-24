import { useMutation } from '@tanstack/react-query';

import { registerUseCase } from '@/core/di/container';

import type { RegisterInputDTO, RegisterOutputDTO } from '../../application';

type Options = {
  onSuccess?: (output: RegisterOutputDTO) => void;
};

/**
 * Creates the account. No session is issued yet — the backend sends a
 * verification code and the flow advances to the verify step.
 */
export function useRegister(options?: Options) {
  return useMutation<RegisterOutputDTO, Error, RegisterInputDTO>({
    mutationFn: async (input) => {
      const result = await registerUseCase.execute(input);
      if (!result.ok) {
        throw result.error;
      }
      return result.value;
    },
    onSuccess: (output) => options?.onSuccess?.(output),
  });
}
