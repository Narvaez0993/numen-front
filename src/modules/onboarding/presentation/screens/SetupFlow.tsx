import { router } from 'expo-router';
import { useCallback, useRef, useState } from 'react';

import { completeOnboardingUseCase } from '@/core/di/container';
import type { Account } from '@/modules/accounts/domain';
import { useAccounts } from '@/modules/accounts/presentation/hooks/useAccounts';
import {
  useAuthStore,
  useMe,
  useUpdateName,
  useUpdatePreferences,
} from '@/modules/auth/presentation';

import type { BankId, OnboardingContext } from '../../domain';
import {
  resumeSetupStep,
  SETUP_BACK_MAP,
  type SetupStep,
} from '../hooks/flowTransitions';
import { useOnboardingFlow } from '../hooks/useOnboardingFlow';
import { useOnboardingStore } from '../stores/useOnboardingStore';

import { OnbFrame } from '../components/OnbFrame';

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
 * name and the objective as they are chosen, the account as it is created. So
 * a setup abandoned halfway (HU-03) resumes at the first step the server has no
 * answer for — it used to start over at the name every time — and the steps
 * already answered are not asked again.
 */
export function SetupFlow() {
  const session = useAuthStore((s) => s.session);
  // The server's word, not the snapshot stored at sign-in: the snapshot is from
  // before any step was answered. If the server cannot be reached the snapshot
  // is the best there is, and an unknown account sends the user to the account
  // step, which moves on by itself if one turns out to exist.
  const me = useMe();
  const accounts = useAccounts();

  if (session === null) return null;
  if (me.isPending || accounts.isPending) return <OnbFrame>{null}</OnbFrame>;

  // Both are the server's answer: the profile asked now, and the one each step
  // saved into the session when it was answered (the profile can be a minute
  // old). A name or an objective, once given, cannot be taken back from the
  // app, so whichever of the two has it is right.
  const user = me.data?.user;
  const displayName = user?.displayName.trim() ? user.displayName : session.displayName;
  const objective = user?.objective ?? session.objective;
  const account = accounts.data?.accounts[0] ?? null;

  return (
    <SetupSteps
      start={resumeSetupStep({ displayName, objective, hasAccount: account !== null })}
      answered={{
        name: displayName,
        goal: objective,
        sourceName: account?.name ?? null,
        balance: account?.balance ?? 0,
      }}
      account={account}
    />
  );
}

type StepsProps = {
  start: SetupStep;
  /** What the server already holds — the later steps greet with the name. */
  answered: Partial<OnboardingContext>;
  /** The first account, when the setup is picked up after creating it. */
  account: Account | null;
};

/** The steps themselves, mounted once the starting step is known. */
function SetupSteps({ start, answered, account: existing }: StepsProps) {
  const hasSession = useAuthStore((s) => s.session !== null);
  const flow = useOnboardingFlow<SetupStep>(start, SETUP_BACK_MAP, answered);
  const markCompleted = useOnboardingStore((s) => s.markCompleted);
  const updateName = useUpdateName();
  const updatePreferences = useUpdatePreferences();
  const [account, setAccount] = useState<Account | null>(existing);
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
