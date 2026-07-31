import type { AgentFeed } from '../../../domain/types/AgentFeed';
import { removeInsight } from '../feedCache';

const feed: AgentFeed = {
  insights: [
    { kind: 'uncategorized', key: 'uncat:2026-07', count: 4, spent: 90_000 },
    {
      kind: 'upcoming_charge',
      key: 'charge:ch-1',
      subscriptionId: 's1',
      name: 'Netflix',
      amount: 30_000,
      dueOn: '2026-07-29',
      chargeId: 'ch-1',
    },
  ],
};

describe('removeInsight', () => {
  it('removes exactly the dismissed key', () => {
    const result = removeInsight(feed, 'uncat:2026-07');
    expect(result.insights.map((i) => i.key)).toEqual(['charge:ch-1']);
  });

  it('tolerates an empty cache', () => {
    expect(removeInsight(undefined, 'x').insights).toEqual([]);
  });
});
