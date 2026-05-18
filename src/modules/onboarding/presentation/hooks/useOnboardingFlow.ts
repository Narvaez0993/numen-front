import { useCallback, useState } from 'react';

import {
  EMPTY_ONBOARDING_CONTEXT,
  type OnboardingContext,
} from '../../domain/types/OnboardingContext';

import { type AuthMode, BACK_MAP, type OnboardingScreen } from './flowTransitions';

export type FlowTarget = OnboardingScreen | 'login';

type FlowState = {
  screen: OnboardingScreen;
  mode: AuthMode;
  ctx: OnboardingContext;
  go: (target: FlowTarget) => void;
  goBack: () => void;
  setCtx: (partial: Partial<OnboardingContext>) => void;
  reset: () => void;
};

export function useOnboardingFlow(): FlowState {
  const [screen, setScreen] = useState<OnboardingScreen>('welcome1');
  const [mode, setMode] = useState<AuthMode>('signup');
  const [ctx, setCtx] = useState<OnboardingContext>(EMPTY_ONBOARDING_CONTEXT);

  const go = useCallback((target: FlowTarget) => {
    if (target === 'login') {
      setMode('login');
      setScreen('auth');
      return;
    }
    if (target === 'auth') {
      setMode('signup');
    }
    setScreen(target);
  }, []);

  const goBack = useCallback(() => {
    setScreen((current) => BACK_MAP[current] ?? current);
  }, []);

  const updateCtx = useCallback((partial: Partial<OnboardingContext>) => {
    setCtx((prev) => ({ ...prev, ...partial }));
  }, []);

  const reset = useCallback(() => {
    setScreen('welcome1');
    setMode('signup');
    setCtx(EMPTY_ONBOARDING_CONTEXT);
  }, []);

  return { screen, mode, ctx, go, goBack, setCtx: updateCtx, reset };
}
