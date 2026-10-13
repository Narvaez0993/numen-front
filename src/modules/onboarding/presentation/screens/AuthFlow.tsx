import { router } from 'expo-router';
import { useEffect } from 'react';

import { VerifyScreen } from '@/modules/auth/presentation';

import { AUTH_BACK_MAP, type AuthStep } from '../hooks/flowTransitions';
import { useOnboardingFlow } from '../hooks/useOnboardingFlow';
import { useOnboardingStore } from '../stores/useOnboardingStore';

import { SignupScreen } from './SignupScreen';
import { WelcomeScreen } from './WelcomeScreen';

/**
 * Pre-session flow: welcome → the account → the code. Lives in the `(auth)`
 * group. On verify the backend issues a session and the RootGate moves the
 * user into the setup flow. A returning user who taps «Crear una» enters here
 * directly at `signup` (the welcome already seen).
 *
 * Each screen draws its own frame — the aurora, the safe area, the keyboard —
 * because the login and the standalone code screen need the same one outside
 * this flow.
 */
export function AuthFlow() {
  const introSeen = useOnboardingStore((s) => s.introSeen);
  const markIntroSeen = useOnboardingStore((s) => s.markIntroSeen);
  const flow = useOnboardingFlow<AuthStep>(
    introSeen ? 'signup' : 'welcome',
    AUTH_BACK_MAP,
  );

  // Getting past the welcome counts as having seen it: from now on a logged-out
  // user lands on the login, not on the welcome.
  useEffect(() => {
    if (flow.screen === 'signup' && !introSeen) markIntroSeen();
  }, [flow.screen, introSeen, markIntroSeen]);

  switch (flow.screen) {
    case 'welcome':
      return (
        <WelcomeScreen
          onStart={() => flow.go('signup')}
          onHaveAccount={() => router.push('/(auth)/login')}
        />
      );
    case 'signup':
      return (
        <SignupScreen
          onBack={flow.goBack}
          onRegistered={(email) => {
            flow.setCtx({ email });
            flow.go('verify');
          }}
        />
      );
    case 'verify':
      return (
        <VerifyScreen
          email={flow.ctx.email}
          onBack={flow.goBack}
          // Session is now issued; hand off to the setup flow. The gate would
          // do this too, but replacing here avoids a frame of the code screen.
          onVerified={() => router.replace('/(onboarding)')}
        />
      );
    default:
      return null;
  }
}
