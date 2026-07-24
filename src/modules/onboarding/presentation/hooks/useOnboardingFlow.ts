import { useCallback, useState } from 'react';

import {
  EMPTY_ONBOARDING_CONTEXT,
  type OnboardingContext,
} from '../../domain/types/OnboardingContext';

type FlowState<S extends string> = {
  screen: S;
  ctx: OnboardingContext;
  go: (target: S) => void;
  goBack: () => void;
  setCtx: (partial: Partial<OnboardingContext>) => void;
  reset: () => void;
};

/**
 * Generic single-screen state machine shared by the auth and setup flows. The
 * caller supplies the entry screen and a back-edge map (stable module constants
 * like `AUTH_BACK_MAP` / `SETUP_BACK_MAP`).
 */
export function useOnboardingFlow<S extends string>(
  initialScreen: S,
  backMap: Readonly<Record<S, S | null>>,
): FlowState<S> {
  const [screen, setScreen] = useState<S>(initialScreen);
  const [ctx, setCtx] = useState<OnboardingContext>(EMPTY_ONBOARDING_CONTEXT);

  const go = useCallback((target: S) => setScreen(target), []);

  const goBack = useCallback(() => {
    setScreen((current) => backMap[current] ?? current);
  }, [backMap]);

  const updateCtx = useCallback((partial: Partial<OnboardingContext>) => {
    setCtx((prev) => ({ ...prev, ...partial }));
  }, []);

  const reset = useCallback(() => {
    setScreen(initialScreen);
    setCtx(EMPTY_ONBOARDING_CONTEXT);
  }, [initialScreen]);

  return { screen, ctx, go, goBack, setCtx: updateCtx, reset };
}
