import { useTranslation } from 'react-i18next';

import { dayDiff, type Deuda } from '../../domain';

import { formatShortDate } from './formatShortDate';

/**
 * When it is due, said the way a person would.
 *
 * It accepts a missing debt because the sheets that show one are mounted before
 * it is chosen, and a hook cannot be called conditionally. Callers used to hand
 * it `{ dueOn: null } as Deuda` to get around that — a cast that lies about the
 * shape it stands in for.
 */
export function useDueLabel(deuda: Deuda | null | undefined, today: string): string {
  const { t, i18n } = useTranslation();
  if (!deuda?.dueOn) return t('deudas.due.none');
  const diff = dayDiff(deuda.dueOn, today);
  if (diff === 0) return t('deudas.due.todayLabel');
  if (diff < 0) return t('deudas.due.overdue', { count: Math.abs(diff) });
  if (diff <= 7) return t('deudas.due.inDays', { count: diff });
  return t('deudas.due.onDate', {
    date: formatShortDate(deuda.dueOn, i18n.language),
  });
}
