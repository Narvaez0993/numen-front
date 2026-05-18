import { useCallback } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { completeOnboardingUseCase } from '@/core/di/container';
import { useTheme } from '@/shared/presentation/theme';

import { useOnboardingFlow } from '../hooks/useOnboardingFlow';
import { useOnboardingStore } from '../stores/useOnboardingStore';

import { AuthScreen } from './AuthScreen';
import { ConfirmScreen } from './ConfirmScreen';
import { MagicMomentScreen } from './MagicMomentScreen';
import { PersoGoalScreen } from './PersoGoalScreen';
import { PersoNameScreen } from './PersoNameScreen';
import { SetupScreen } from './SetupScreen';
import { WelcomeScreen } from './WelcomeScreen';

type Props = {
  onComplete: () => void;
};

export function OnboardingFlow({ onComplete }: Props) {
  const { theme } = useTheme();
  const flow = useOnboardingFlow();
  const markCompleted = useOnboardingStore((s) => s.markCompleted);

  const finish = useCallback(async () => {
    const profile = {
      name: flow.ctx.name,
      goal: flow.ctx.goal,
      bankId: flow.ctx.bankId,
      balance: flow.ctx.balance,
    };
    const result = await completeOnboardingUseCase.execute(profile);
    const persisted = result.ok ? result.value : profile;
    markCompleted(persisted);
    onComplete();
  }, [flow.ctx, markCompleted, onComplete]);

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
      case 'auth':
        return (
          <AuthScreen
            mode={flow.mode}
            onBack={flow.goBack}
            onModeChange={(mode) => flow.go(mode === 'login' ? 'login' : 'auth')}
            onAuthSuccess={() => {
              if (flow.mode === 'login') {
                void finish();
              } else {
                flow.go('perso1');
              }
            }}
          />
        );
      case 'perso1':
        return (
          <PersoNameScreen
            initialValue={flow.ctx.name}
            onBack={flow.goBack}
            onContinue={(name) => {
              flow.setCtx({ name });
              flow.go('perso2');
            }}
          />
        );
      case 'perso2':
        return (
          <PersoGoalScreen
            name={flow.ctx.name}
            initialGoal={flow.ctx.goal}
            onBack={flow.goBack}
            onContinue={(goal) => {
              flow.setCtx({ goal });
              flow.go('setup');
            }}
          />
        );
      case 'setup':
        return (
          <SetupScreen
            initialBankId={flow.ctx.bankId}
            initialBalance={flow.ctx.balance}
            onBack={flow.goBack}
            onContinue={({ bankId, balance }) => {
              flow.setCtx({ bankId, balance });
              flow.go('magic');
            }}
          />
        );
      case 'magic':
        return (
          <MagicMomentScreen
            onDetected={({ transcript, expense }) => {
              flow.setCtx({ transcript, expense });
              flow.go('confirm');
            }}
            onSkip={() => {
              void finish();
            }}
          />
        );
      case 'confirm': {
        const expense = flow.ctx.expense;
        const transcript = flow.ctx.transcript ?? '';
        if (!expense) {
          void finish();
          return null;
        }
        return (
          <ConfirmScreen
            expense={expense}
            transcript={transcript}
            accountValue={flow.ctx.bankId ? flow.ctx.bankId : null}
            onContinue={() => {
              void finish();
            }}
          />
        );
      }
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
