import { router } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useCreateAccount } from '@/modules/accounts/presentation/hooks/useAccountMutations';
import { useAuthStore, useUpdateName } from '@/modules/auth/presentation';
import { completeOnboardingUseCase } from '@/core/di/container';
import { useGoalsStore } from '@/modules/goals/presentation/stores/useGoalsStore';
import { useTheme } from '@/shared/presentation/theme';

import { SETUP_BACK_MAP, type SetupStep } from '../hooks/flowTransitions';
import { useOnboardingFlow } from '../hooks/useOnboardingFlow';
import { useOnboardingStore } from '../stores/useOnboardingStore';

import { ConfirmScreen } from './ConfirmScreen';
import { MagicMomentScreen } from './MagicMomentScreen';
import { PersoGoalScreen } from './PersoGoalScreen';
import { PersoNameScreen } from './PersoNameScreen';
import { SetupScreen } from './SetupScreen';

/**
 * Post-session setup #2: name → goal → account setup → magic moment → confirm.
 * Lives in the `(onboarding)` group and is only reachable with a session (the
 * gate guarantees it). Shown once, right after registration — never on login.
 */
export function SetupFlow() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const hasSession = useAuthStore((s) => s.session !== null);
  const flow = useOnboardingFlow<SetupStep>('name', SETUP_BACK_MAP);
  const markCompleted = useOnboardingStore((s) => s.markCompleted);
  const updateName = useUpdateName();
  const createAccount = useCreateAccount();
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

    // Turn the source the user just described into their first real account, so
    // they land in the app with their own balance instead of an empty screen.
    // Best-effort like the name: a failure must not trap them in the setup.
    if (persisted.sourceName) {
      const isCash = persisted.bankId === 'efectivo';
      createAccount.mutate({
        kind: isCash ? 'cash' : 'debit',
        name: persisted.sourceName,
        sub: '',
        icon: isCash ? 'cash' : 'building-bank',
        color: 'mint',
        balance: persisted.balance,
      });
    }
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
  }, [flow.ctx, markCompleted, createAccount]);

  // Safety net: if we ever reach `confirm` without an expense (e.g. via dev
  // tweaks), finish from an effect, not during render.
  useEffect(() => {
    if (flow.screen === 'confirm' && !flow.ctx.expense) {
      void finish();
    }
  }, [flow.screen, flow.ctx.expense, finish]);

  // Impossible via the gate, but if the session is lost mid-setup render
  // nothing and let the gate route away instead of firing authed calls.
  if (!hasSession) return null;

  const renderScreen = () => {
    switch (flow.screen) {
      case 'name':
        return (
          <PersoNameScreen
            initialValue={flow.ctx.name}
            onContinue={(name) => {
              flow.setCtx({ name });
              // Persist the name to the backend (best-effort) and continue.
              updateName.mutate(name);
              flow.go('goal');
            }}
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
