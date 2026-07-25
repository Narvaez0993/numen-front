import { useMutation } from '@tanstack/react-query';

import { updatePreferencesUseCase } from '@/core/di/container';
import { useCurrencyStore } from '@/shared/presentation/currency/useCurrencyStore';

import type { ProfileDTO } from '../../application';
import type { PreferencesPatch } from '../../domain';
import { useAuthStore } from '../stores/useAuthStore';

/**
 * Persists display preferences server-side. The server is the source of truth,
 * so on success we mirror what it returns into the session and the local
 * currency store — the pickers write locally first for instant feedback and
 * this reconciles them.
 */
export function useUpdatePreferences() {
  const session = useAuthStore((state) => state.session);
  const setSession = useAuthStore((state) => state.setSession);
  const syncCurrency = useCurrencyStore((state) => state.syncFromServer);

  return useMutation<ProfileDTO, Error, PreferencesPatch>({
    mutationFn: async (patch) => {
      const result = await updatePreferencesUseCase.execute(patch);
      if (!result.ok) {
        throw result.error;
      }
      return result.value;
    },
    onSuccess: (profile) => {
      if (session) {
        setSession({ ...session, currency: profile.currency });
      }
      syncCurrency(profile.currency);
    },
  });
}
