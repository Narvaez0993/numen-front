import type { Movement } from '../../../domain';
import { groupByDay } from '../groupByDay';

const TODAY = '2026-07-25';

const mov = (overrides: Partial<Movement>): Movement => ({
  id: 'x',
  type: 'expense',
  description: 'X',
  amount: 1000,
  currency: 'COP',
  source: { type: 'account', id: 'nequi' },
  destination: null,
  categoryId: 'cafe',
  occurredOn: TODAY,
  capturedVia: 'manual',
  subscriptionId: null,
  ...overrides,
});

describe('groupByDay', () => {
  it('groups by day preserving the incoming order', () => {
    const result = groupByDay(
      [
        mov({ id: 'a', occurredOn: '2026-07-25' }),
        mov({ id: 'b', occurredOn: '2026-07-24' }),
        mov({ id: 'c', occurredOn: '2026-07-25' }),
      ],
      TODAY,
    );

    expect(result).toHaveLength(2);
    expect(result[0]?.date).toBe('2026-07-25');
    expect(result[0]?.items.map((m) => m.id)).toEqual(['a', 'c']);
    expect(result[1]?.date).toBe('2026-07-24');
  });

  it('derives the day label instead of reading a stored one', () => {
    const result = groupByDay(
      [
        mov({ occurredOn: '2026-07-25' }),
        mov({ occurredOn: '2026-07-24' }),
        mov({ occurredOn: '2026-07-18' }),
      ],
      TODAY,
    );

    expect(result.map((g) => g.label)).toEqual(['hoy', 'ayer', 'sáb 18 jul']);
  });

  it('nets income against expenses in the day total', () => {
    const result = groupByDay(
      [mov({ amount: 1000 }), mov({ type: 'income', amount: 5000 })],
      TODAY,
    );

    expect(result[0]?.total).toBe(4000);
  });

  it('leaves transfers out of the total but keeps them listed', () => {
    const result = groupByDay(
      [
        mov({ id: 'a', amount: 1000 }),
        mov({
          id: 'b',
          type: 'transfer',
          amount: 500_000,
          destination: { type: 'credit_card', id: 'visa' },
          categoryId: null,
        }),
        mov({ id: 'c', amount: 2000 }),
      ],
      TODAY,
    );

    // Paying a card moves money without making you poorer.
    expect(result[0]?.total).toBe(-3000);
    expect(result[0]?.items).toHaveLength(3);
  });

  it('translates the relative labels', () => {
    const result = groupByDay([mov({ occurredOn: TODAY })], TODAY, 'en', {
      today: 'today',
      yesterday: 'yesterday',
    });

    expect(result[0]?.label).toBe('today');
  });
});
