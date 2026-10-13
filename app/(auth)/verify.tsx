import { router, useLocalSearchParams } from 'expo-router';

import { VerifyScreen } from '@/modules/auth/presentation';
import { useOnboardingStore } from '@/modules/onboarding/presentation/stores/useOnboardingStore';

export default function VerifyRoute() {
  const { email } = useLocalSearchParams<{ email?: string }>();

  return (
    <VerifyScreen
      email={email ?? ''}
      onBack={() => router.back()}
      onVerified={(session) => {
        // Returning user verifying from login: complete onboarding so the
        // gate routes to tabs.
        useOnboardingStore.getState().markCompleted({
          name: session.displayName,
          goal: null,
          bankId: null,
          sourceName: null,
          balance: 0,
        });
      }}
    />
  );
}
