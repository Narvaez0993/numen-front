import { useMutation } from '@tanstack/react-query';

import { loginUseCase } from '@/core/di/container';

import type { LoginInputDTO, LoginOutputDTO } from '../../application';
import { useAuthStore } from '../stores/useAuthStore';

export function useLogin() {
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation<LoginOutputDTO, Error, LoginInputDTO>({
    mutationFn: async (input) => {
      const result = await loginUseCase.execute(input);
      if (!result.ok) {
        throw result.error;
      }
      return result.value;
    },
    onSuccess: (data) => {
      setSession({
        userId: data.userId,
        email: data.email,
        displayName: data.displayName,
        accessToken: data.accessToken,
      });
    },
  });
}
