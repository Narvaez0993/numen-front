import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  applyPlayUseCase,
  dismissCorteUseCase,
  markCorteReadUseCase,
} from '@/core/di/container';
import { invalidateMoneyViews } from '@/shared/presentation/query/moneyViews';

import type { AgentFeed, AgentOutput } from '../../domain/types/AgentFeed';
import { removeOutput, replaceInList, replaceOutput } from '../utils/feedCache';
import { AGENT_FEED_KEY } from './useAgentFeed';
import { SUMMARIES_KEY, corteKey } from './useCortes';

/** The server's echo is the truth — patch every cache that holds this output. */
function patchEverywhere(
  queryClient: ReturnType<typeof useQueryClient>,
  output: AgentOutput,
) {
  queryClient.setQueryData<AgentFeed>(AGENT_FEED_KEY, (old) =>
    replaceOutput(old, output),
  );
  queryClient.setQueryData<AgentOutput[]>(SUMMARIES_KEY, (old) =>
    replaceInList(old, output),
  );
  queryClient.setQueryData<AgentOutput>(corteKey(output.id), output);
}

/** Fired when a Corte opens. Losing one is a shrug — the pill just stays. */
export function useMarkCorteRead() {
  const queryClient = useQueryClient();
  return useMutation<AgentOutput, Error, string>({
    mutationFn: async (outputId) => {
      const result = await markCorteReadUseCase.execute(outputId);
      if (!result.ok) throw result.error;
      return result.value;
    },
    onSuccess: (output) => patchEverywhere(queryClient, output),
  });
}

/** Hides the card from the feed; «Resúmenes» keeps the history untouched. */
export function useDismissCorte() {
  const queryClient = useQueryClient();
  return useMutation<AgentOutput, Error, string>({
    mutationFn: async (outputId) => {
      const result = await dismissCorteUseCase.execute(outputId);
      if (!result.ok) throw result.error;
      return result.value;
    },
    onMutate: (outputId) => {
      queryClient.setQueryData<AgentFeed>(AGENT_FEED_KEY, (old) =>
        removeOutput(old, outputId),
      );
    },
  });
}

export type ApplyPlayVariables = {
  outputId: string;
  playId: string;
  accountId: string | null;
  today: string;
};

/**
 * Aplicar una jugada. The 200 may carry an `applied` play or a `failed` one —
 * both are truth, both land in the caches. Money views refresh either way:
 * an applied cap or contribution changed screens this module has never met.
 */
export function useApplyPlay() {
  const queryClient = useQueryClient();
  return useMutation<AgentOutput, Error, ApplyPlayVariables>({
    mutationFn: async (variables) => {
      const result = await applyPlayUseCase.execute(variables);
      if (!result.ok) throw result.error;
      return result.value;
    },
    onSuccess: (output) => {
      patchEverywhere(queryClient, output);
      invalidateMoneyViews(queryClient);
    },
  });
}
