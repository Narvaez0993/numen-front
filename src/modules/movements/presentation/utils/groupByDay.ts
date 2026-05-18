import type { Transaction } from '../../domain/types/Transaction';

export type DayGroup = {
  date: string;
  dayBucket: string;
  items: Transaction[];
  /** Sum of non-transfer items only. */
  total: number;
};

export function groupByDay(transactions: Transaction[]): DayGroup[] {
  const order: string[] = [];
  const map = new Map<string, DayGroup>();
  for (const tx of transactions) {
    if (!map.has(tx.date)) {
      map.set(tx.date, { date: tx.date, dayBucket: tx.dayBucket, items: [], total: 0 });
      order.push(tx.date);
    }
    const group = map.get(tx.date)!;
    group.items.push(tx);
    if (tx.tag !== 'transfer') {
      group.total += tx.amount;
    }
  }
  return order.map((d) => map.get(d)!);
}
