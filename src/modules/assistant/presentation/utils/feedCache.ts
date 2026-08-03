/** Pure cache surgery for the agent feed — a dismissal never refetches. */

import type { AgentFeed, AgentOutput } from '../../domain/types/AgentFeed';

const EMPTY: AgentFeed = { insights: [], outputs: [], unseenCount: 0 };

export function removeInsight(feed: AgentFeed | undefined, key: string): AgentFeed {
  const base = feed ?? EMPTY;
  return { ...base, insights: base.insights.filter((insight) => insight.key !== key) };
}

/** Dismissing an output pulls it from the feed (never from the shelf). */
export function removeOutput(feed: AgentFeed | undefined, outputId: string): AgentFeed {
  const base = feed ?? EMPTY;
  const outputs = base.outputs.filter((output) => output.id !== outputId);
  return {
    ...base,
    outputs,
    unseenCount: outputs.filter((o) => o.readAt === null).length,
  };
}

/** The server echoed a fresher output (read, applied) — swap it in place. */
export function replaceOutput(
  feed: AgentFeed | undefined,
  output: AgentOutput,
): AgentFeed {
  const base = feed ?? EMPTY;
  const outputs = base.outputs.map((o) => (o.id === output.id ? output : o));
  return {
    ...base,
    outputs,
    unseenCount: outputs.filter((o) => o.readAt === null).length,
  };
}

/** Same swap for the shelf's list cache. */
export function replaceInList(
  list: AgentOutput[] | undefined,
  output: AgentOutput,
): AgentOutput[] {
  return (list ?? []).map((o) => (o.id === output.id ? output : o));
}
