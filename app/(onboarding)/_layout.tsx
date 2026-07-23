import { Slot } from 'expo-router';

// Slot (not Stack) so the onboarding route stays within the root navigator.
// A nested Stack here would create its own history and prevent
// `router.replace('/(tabs)/')` from crossing groups cleanly.
export default function OnboardingLayout() {
  return <Slot />;
}
