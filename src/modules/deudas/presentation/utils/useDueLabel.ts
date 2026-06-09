import { useTranslation } from 'react-i18next';

import { dayDiff, type Deuda } from '../../domain/types/Deuda';

import { formatShortDate } from './formatShortDate';

export function useDueLabel(deuda: Deuda, today: string): string {
  const { t, i18n } = useTranslation();
  if (!deuda.dueDate) return t('deudas.due.none');
  const diff = dayDiff(deuda.dueDate, today);
  if (diff === 0) return t('deudas.due.todayLabel');
  if (diff < 0) return t('deudas.due.overdue', { count: Math.abs(diff) });
  if (diff <= 7) return t('deudas.due.inDays', { count: diff });
  return t('deudas.due.onDate', {
    date: formatShortDate(deuda.dueDate, i18n.language),
  });
}
