import type { Transaction } from '../../../domain/types/Transaction';
import { groupByDay } from '../groupByDay';

const tx = (overrides: Partial<Transaction>): Transaction => ({
  id: 'x',
  date: '2026-05-14',
  dayBucket: 'hoy',
  description: 'X',
  categoryId: 'cafe',
  accountId: 'bbva_d',
  amount: -1000,
  time: '00:00',
  tag: null,
  ...overrides,
});

describe('groupByDay', () => {
  it('groups by date preserving insertion order', () => {
    const result = groupByDay([
      tx({ id: 'a', date: '2026-05-14' }),
      tx({ id: 'b', date: '2026-05-13', dayBucket: 'ayer' }),
      tx({ id: 'c', date: '2026-05-14' }),
    ]);
    expect(result).toHaveLength(2);
    expect(result[0]?.date).toBe('2026-05-14');
    expect(result[0]?.items.map((t) => t.id)).toEqual(['a', 'c']);
    expect(result[1]?.date).toBe('2026-05-13');
  });

  it('excludes transfers from the day total but keeps them in items', () => {
    const result = groupByDay([
      tx({ id: 'a', amount: -1000 }),
      tx({ id: 'b', amount: -5000, tag: 'transfer' }),
      tx({ id: 'c', amount: -2000 }),
    ]);
    expect(result[0]?.total).toBe(-3000);
    expect(result[0]?.items).toHaveLength(3);
  });
});
