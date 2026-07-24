import { router } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '@/modules/auth/presentation';
import { completeOnboardingUseCase } from '@/core/di/container';
import { useGoalsStore } from '@/modules/goals/presentation/stores/useGoalsStore';
import { useTheme } from '@/shared/presentation/theme';

import { useOnboardingFlow } from '../hooks/useOnboardingFlow';
import { useOnboardingStore } from '../stores/useOnboardingStore';

import { AccountScreen } from './AccountScreen';
import { AccountVerifyScreen } from './AccountVerifyScreen';
import { ConfirmScreen } from './ConfirmScreen';
import { MagicMomentScreen } from './MagicMomentScreen';
import { PersoGoalScreen } from './PersoGoalScreen';
import { PersoNameScreen } from './PersoNameScreen';
import { SetupScreen } from './SetupScreen';
import { WelcomeScreen } from './WelcomeScreen';

export function OnboardingFlow() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  // Returning from a partial signup (verified, session issued) resumes at the
  // personalization steps instead of restarting the welcome sequence.
  const hasSession = useAuthStore((s) => s.session !== null);
  const flow = useOnboardingFlow(hasSession ? 'goal' : 'welcome1');
  const markCompleted = useOnboardingStore((s) => s.markCompleted);
  const finishingRef = useRef(false);

  const finish = useCallback(async () => {
    if (finishingRef.current) return;
    finishingRef.current = true;
    const profile = {
      name: flow.ctx.name,
      goal: flow.ctx.goal,
      bankId: flow.ctx.bankId,
      sourceName: flow.ctx.sourceName,
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
      case 'name':
        return (
          <PersoNameScreen
            initialValue={flow.ctx.name}
            onBack={flow.goBack}
            onContinue={(name) => {
              flow.setCtx({ name });
              flow.go('account');
            }}
          />
        );
      case 'account':
        return (
          <AccountScreen
            name={flow.ctx.name}
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
            onVerified={() => flow.go('goal')}
          />
        );
      case 'goal':
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
            initialSourceName={flow.ctx.sourceName}
            initialBalance={flow.ctx.balance}
            onBack={flow.goBack}
            onContinue={({ bankId, sourceName, balance }) => {
              flow.setCtx({ bankId, sourceName, balance });
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
              flow.ctx.sourceName ??
              (flow.ctx.bankId ? t(`onboarding.setup.banks.${flow.ctx.bankId}`) : null)
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
