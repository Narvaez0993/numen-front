import { router } from 'expo-router';
import { useCallback, useRef, useState } from 'react';

import { completeOnboardingUseCase } from '@/core/di/container';
import type { Account } from '@/modules/accounts/domain';
import {
  useAuthStore,
  useUpdateName,
  useUpdatePreferences,
} from '@/modules/auth/presentation';

import type { BankId } from '../../domain';
import { SETUP_BACK_MAP, type SetupStep } from '../hooks/flowTransitions';
import { useOnboardingFlow } from '../hooks/useOnboardingFlow';
import { useOnboardingStore } from '../stores/useOnboardingStore';

import { AccountStep } from './AccountStep';
import { GoalStep } from './GoalStep';
import { MagicStep } from './MagicStep';
import { NameStep } from './NameStep';

/**
 * Post-session setup: name → objective → main account → the first expense.
 * Lives in the `(onboarding)` group and is only reachable with a session (the
 * gate guarantees it). Shown once, right after registration — never on login.
 *
 * Each answer goes to the server when it is given, not all at the end: the
 * name and the objective as they are chosen, the account as it is created. The
 * first expense needs the account to exist, and a setup abandoned halfway
 * resumes without making a second one (HU-03).
 */
export function SetupFlow() {
  const hasSession = useAuthStore((s) => s.session !== null);
  const flow = useOnboardingFlow<SetupStep>('name', SETUP_BACK_MAP);
  const markCompleted = useOnboardingStore((s) => s.markCompleted);
  const updateName = useUpdateName();
  const updatePreferences = useUpdatePreferences();
  const [account, setAccount] = useState<Account | null>(null);
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
    markCompleted(result.ok ? result.value : profile);
    // Explicit group path: cross-group imperative navigation works best so.
    router.replace('/(tabs)');
  }, [flow.ctx, markCompleted]);

  const { setCtx, go } = flow;
  const onAccount = useCallback(
    (created: Account, bankId: BankId | null) => {
      setAccount(created);
      setCtx({ bankId, sourceName: created.name, balance: created.balance });
      go('magic');
    },
    [setCtx, go],
  );

  // Impossible via the gate, but if the session is lost mid-setup render
  // nothing and let the gate route away instead of firing authed calls.
  if (!hasSession) return null;

  switch (flow.screen) {
    case 'name':
      return (
        <NameStep
          initialValue={flow.ctx.name}
          onContinue={(name) => {
            flow.setCtx({ name });
            updateName.mutate(name);
            flow.go('goal');
          }}
        />
      );
    case 'goal':
      return (
        <GoalStep
          name={flow.ctx.name}
          initialGoal={flow.ctx.goal}
          onBack={flow.goBack}
          onContinue={(goal) => {
            flow.setCtx({ goal });
            // It decides what Home leads with — best-effort, it can be changed
            // in Perfil, and a failure must not trap anyone here.
            updatePreferences.mutate({ objective: goal });
            flow.go('account');
          }}
        />
      );
    case 'account':
      return (
        <AccountStep
          onBack={flow.goBack}
          onCreated={onAccount}
          onSkip={() => void finish()}
        />
      );
    case 'magic':
      return account ? (
        <MagicStep account={account} onDone={() => void finish()} />
      ) : null;
    default:
      return null;
  }
}
