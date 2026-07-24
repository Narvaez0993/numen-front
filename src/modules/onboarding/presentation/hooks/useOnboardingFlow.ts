import { useCallback, useState } from 'react';

import {
  EMPTY_ONBOARDING_CONTEXT,
  type OnboardingContext,
} from '../../domain/types/OnboardingContext';

import { BACK_MAP, type OnboardingScreen } from './flowTransitions';

type FlowState = {
  screen: OnboardingScreen;
  ctx: OnboardingContext;
  go: (target: OnboardingScreen) => void;
  goBack: () => void;
  setCtx: (partial: Partial<OnboardingContext>) => void;
  reset: () => void;
};

export function useOnboardingFlow(
  initialScreen: OnboardingScreen = 'welcome1',
): FlowState {
  const [screen, setScreen] = useState<OnboardingScreen>(initialScreen);
  const [ctx, setCtx] = useState<OnboardingContext>(EMPTY_ONBOARDING_CONTEXT);

  const go = useCallback((target: OnboardingScreen) => setScreen(target), []);

  const goBack = useCallback(() => {
    setScreen((current) => BACK_MAP[current] ?? current);
  }, []);

  const updateCtx = useCallback((partial: Partial<OnboardingContext>) => {
    setCtx((prev) => ({ ...prev, ...partial }));
  }, []);

  const reset = useCallback(() => {
    setScreen('welcome1');
    setCtx(EMPTY_ONBOARDING_CONTEXT);
  }, []);

  return { screen, ctx, go, goBack, setCtx: updateCtx, reset };
}
