/** Pure cache surgery for the agent feed — a dismissal never refetches. */

import type { AgentFeed } from '../../domain/types/AgentFeed';

export function removeInsight(feed: AgentFeed | undefined, key: string): AgentFeed {
  const base = feed ?? { insights: [] };
  return { ...base, insights: base.insights.filter((insight) => insight.key !== key) };
}
