import { router } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { completeOnboardingUseCase } from '@/core/di/container';
import { useGoalsStore } from '@/modules/goals/presentation/stores/useGoalsStore';
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

export function OnboardingFlow() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const flow = useOnboardingFlow();
  const markCompleted = useOnboardingStore((s) => s.markCompleted);
  const finishingRef = useRef(false);

  const finish = useCallback(async () => {
    if (finishingRef.current) return;
    finishingRef.current = true;
    const profile = {
      name: flow.ctx.name,
      goal: flow.ctx.goal,
      bankId: flow.ctx.bankId,
      balance: flow.ctx.balance,
    };
    const result = await completeOnboardingUseCase.execute(profile);
    const persisted = result.ok ? result.value : profile;
    markCompleted(persisted);
    if (persisted.goal === 'ahorrar') {
      const goalsStore = useGoalsStore.getState();
      if (!goalsStore.goals.some((g) => g.id === 'goal-onboarding')) {
        goalsStore.addGoal({
          id: 'goal-onboarding',
          name: 'Mi primera meta',
          iconName: 'target',
          color: 'mint',
          target: 1_000_000,
          saved: 0,
          projectionMonth: '',
        });
      }
    }
    // Navigate explicitly to the tabs group. Expo Router v4 cross-group
    // imperative navigation works best with an explicit group path.
    router.replace('/(tabs)');
  }, [flow.ctx, markCompleted]);

  // Safety net: if we ever reach `confirm` without an expense (e.g. via dev
  // tweaks), finish from an effect, not during render.
  useEffect(() => {
    if (flow.screen === 'confirm' && !flow.ctx.expense) {
      void finish();
    }
  }, [flow.screen, flow.ctx.expense, finish]);

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
        if (!expense) {
          // Safety effect above will finish; render nothing meanwhile.
          return null;
        }
        return (
          <ConfirmScreen
            expense={expense}
            transcript={flow.ctx.transcript ?? ''}
            accountValue={
              flow.ctx.bankId ? t(`onboarding.setup.banks.${flow.ctx.bankId}`) : null
            }
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
