import { useMutation, useQueryClient } from '@tanstack/react-query';

import { dismissCorteUseCase, markCorteReadUseCase } from '@/core/di/container';

import type { AgentFeed, AgentOutput } from '../../domain/types/AgentFeed';
import { removeOutput, replaceInList, replaceOutput } from '../utils/feedCache';
import { AGENT_FEED_KEY } from './useAgentFeed';
import { CORTES_KEY, corteKey } from './useCortes';

/** The server's echo is the truth — patch every cache that holds this output. */
function patchEverywhere(
  queryClient: ReturnType<typeof useQueryClient>,
  output: AgentOutput,
) {
  queryClient.setQueryData<AgentFeed>(AGENT_FEED_KEY, (old) =>
    replaceOutput(old, output),
  );
  queryClient.setQueryData<AgentOutput[]>(CORTES_KEY, (old) =>
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

/** Hides the card from the feed; the shelf keeps the history untouched. */
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
