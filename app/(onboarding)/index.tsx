import { router } from 'expo-router';

import { OnboardingFlow } from '@/modules/onboarding/presentation/screens/OnboardingFlow';

export default function OnboardingRoute() {
  return <OnboardingFlow onComplete={() => router.replace('/')} />;
}
