import { router } from 'expo-router';
import { useEffect } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/shared/presentation/theme';

import { AUTH_BACK_MAP, type AuthStep } from '../hooks/flowTransitions';
import { useOnboardingFlow } from '../hooks/useOnboardingFlow';
import { useOnboardingStore } from '../stores/useOnboardingStore';

import { AccountScreen } from './AccountScreen';
import { AccountVerifyScreen } from './AccountVerifyScreen';
import { EmailSignupScreen } from './EmailSignupScreen';
import { WelcomeScreen } from './WelcomeScreen';

/**
 * Pre-session flow: welcome hook → account picker → email signup → verify.
 * Lives in the `(auth)` group. On verify the backend issues a session and the
 * RootGate moves the user into the setup flow. A returning user who taps
 * "create account" enters here directly at `account` (welcome already seen).
 */
export function AuthFlow() {
  const { theme } = useTheme();
  const introSeen = useOnboardingStore((s) => s.introSeen);
  const markIntroSeen = useOnboardingStore((s) => s.markIntroSeen);
  const flow = useOnboardingFlow<AuthStep>(
    introSeen ? 'account' : 'welcome1',
    AUTH_BACK_MAP,
  );

  // Passing the welcome hook (reaching the account picker) counts as "intro
  // seen" — from now on a logged-out user lands on login, not the hook.
  useEffect(() => {
    if (flow.screen === 'account' && !introSeen) markIntroSeen();
  }, [flow.screen, introSeen, markIntroSeen]);

  const renderScreen = () => {
    switch (flow.screen) {
      case 'welcome1':
      case 'welcome2':
      case 'welcome3': {
        const idx = (
          flow.screen === 'welcome1' ? 0 : flow.screen === 'welcome2' ? 1 : 2
        ) as 0 | 1 | 2;
        return <WelcomeScreen idx={idx} onAdvance={flow.go} />;
      }
      case 'account':
        return (
          <AccountScreen
            onBack={flow.goBack}
            onEmailSignup={() => flow.go('emailSignup')}
          />
        );
      case 'emailSignup':
        return (
          <EmailSignupScreen
            onBack={flow.goBack}
            onRegistered={(email) => {
              flow.setCtx({ email });
              flow.go('verify');
            }}
          />
        );
      case 'verify':
        return (
          <AccountVerifyScreen
            email={flow.ctx.email}
            onBack={flow.goBack}
            // Session is now issued; hand off to the setup flow. The gate would
            // do this too, but replacing here avoids a frame of the verify view.
            onVerified={() => router.replace('/(onboarding)')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      style={{ flex: 1, backgroundColor: theme.colors.bgBase }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1 }}>{renderScreen()}</View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
