import { dayLabel } from '@/shared/presentation/utils/dates';

import type { Movement } from '../../domain';
import { signedAmount } from '../../domain';

export type DayGroup = {
  date: string;
  /** Derived at render time, never stored (see `dayLabel`). */
  label: string;
  items: Movement[];
  /** Net change of the day: transfers contribute zero. */
  total: number;
};

type Labels = { today: string; yesterday: string };

/** Groups an already-sorted (newest first) list into days. */
export function groupByDay(
  movements: readonly Movement[],
  today: string,
  language = 'es',
  labels: Labels = { today: 'hoy', yesterday: 'ayer' },
): DayGroup[] {
  const order: string[] = [];
  const map = new Map<string, DayGroup>();

  for (const movement of movements) {
    let group = map.get(movement.occurredOn);
    if (!group) {
      group = {
        date: movement.occurredOn,
        label: dayLabel(movement.occurredOn, today, language, labels),
        items: [],
        total: 0,
      };
      map.set(movement.occurredOn, group);
      order.push(movement.occurredOn);
    }
    group.items.push(movement);
    group.total += signedAmount(movement);
  }

  return order.map((date) => map.get(date)!);
}
