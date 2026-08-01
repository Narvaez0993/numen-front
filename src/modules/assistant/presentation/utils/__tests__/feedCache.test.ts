import type { AgentFeed, AgentOutput } from '../../../domain/types/AgentFeed';
import { removeInsight, removeOutput, replaceInList, replaceOutput } from '../feedCache';

function corte(overrides: Partial<AgentOutput> = {}): AgentOutput {
  return {
    id: 'out-1',
    kind: 'monthly_summary',
    period: '2026-06',
    slides: [{ type: 'cover', id: 'cover', text: 'Tu junio.' }],
    weekly: null,
    plays: [],
    createdAt: '2026-07-01T06:00:00Z',
    readAt: null,
    dismissedAt: null,
    ...overrides,
  };
}

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
  outputs: [corte()],
  unseenCount: 1,
};

describe('removeInsight', () => {
  it('removes exactly the dismissed key', () => {
    const result = removeInsight(feed, 'uncat:2026-07');
    expect(result.insights.map((i) => i.key)).toEqual(['charge:ch-1']);
    expect(result.outputs).toHaveLength(1);
  });

  it('tolerates an empty cache', () => {
    expect(removeInsight(undefined, 'x').insights).toEqual([]);
  });
});

describe('removeOutput', () => {
  it('pulls the output and recounts the unseen', () => {
    const result = removeOutput(feed, 'out-1');
    expect(result.outputs).toEqual([]);
    expect(result.unseenCount).toBe(0);
  });
});

describe('replaceOutput', () => {
  it('swaps the fresher echo in place and recounts', () => {
    const read = corte({ readAt: '2026-07-31T10:00:00Z' });
    const result = replaceOutput(feed, read);
    expect(result.outputs[0]?.readAt).not.toBeNull();
    expect(result.unseenCount).toBe(0);
  });

  it('leaves a feed without that output untouched', () => {
    const other = corte({ id: 'out-9' });
    expect(replaceOutput(feed, other).outputs.map((o) => o.id)).toEqual(['out-1']);
  });
});

describe('replaceInList', () => {
  it('swaps by id in the shelf cache', () => {
    const read = corte({ readAt: '2026-07-31T10:00:00Z' });
    expect(replaceInList([corte()], read)[0]?.readAt).not.toBeNull();
  });
});
