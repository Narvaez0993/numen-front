import type { AgentOutput } from '../../../domain/types/AgentFeed';
import { corteTotal, forTab, groupByYear } from '../summariesList';

function output(overrides: Partial<AgentOutput> = {}): AgentOutput {
  return {
    id: 'out-1',
    kind: 'monthly_summary',
    period: '2026-07',
    slides: [],
    weekly: null,
    plays: [],
    createdAt: '2026-08-01T06:00:00Z',
    readAt: null,
    dismissedAt: null,
    ...overrides,
  };
}

describe('forTab', () => {
  it('keeps only the tab’s kind, in the order it arrived', () => {
    const list = [
      output({ id: 'w31', kind: 'weekly_review', period: '2026-W31' }),
      output({ id: 'jul' }),
      output({ id: 'w30', kind: 'weekly_review', period: '2026-W30' }),
    ];

    expect(forTab(list, 'monthly').map((o) => o.id)).toEqual(['jul']);
    expect(forTab(list, 'weekly').map((o) => o.id)).toEqual(['w31', 'w30']);
  });
});

describe('groupByYear', () => {
  it('groups by the period’s year, not by when it was written', () => {
    // December's Corte is composed on January 1st — it still belongs to 2025.
    const december = output({
      id: 'dec',
      period: '2025-12',
      createdAt: '2026-01-01T06:00:00Z',
    });
    const groups = groupByYear([output({ id: 'jul' }), december]);

    expect(groups).toEqual([
      { year: '2026', items: [expect.objectContaining({ id: 'jul' })] },
      { year: '2025', items: [expect.objectContaining({ id: 'dec' })] },
    ]);
  });

  it('keeps one group while a single year runs', () => {
    const groups = groupByYear([
      output({ id: 'jul', period: '2026-07' }),
      output({ id: 'jun', period: '2026-06' }),
    ]);

    expect(groups).toHaveLength(1);
    expect(groups[0]!.items.map((o) => o.id)).toEqual(['jul', 'jun']);
  });

  it('tolerates an empty list', () => {
    expect(groupByYear([])).toEqual([]);
  });
});

describe('corteTotal', () => {
  it('reads the month from the big-number slide', () => {
    const corte = output({
      slides: [
        { type: 'cover', id: 'cover', text: 'Julio.' },
        { type: 'big_number', id: 'big', amount: 830_000, count: 12, text: '' },
      ],
    });

    expect(corteTotal(corte)).toBe(830_000);
  });

  it('is null when the playlist skipped it — no invented zero', () => {
    expect(
      corteTotal(output({ slides: [{ type: 'cover', id: 'c', text: 'x' }] })),
    ).toBeNull();
  });
});
