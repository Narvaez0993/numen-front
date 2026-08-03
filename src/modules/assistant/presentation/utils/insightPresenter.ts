/**
 * FeedInsight (server data + key) → what the card shows. The server never
 * writes copy: every word here comes from i18n, every figure from the data.
 * Pure, so the taxonomy of doc 02 §9.1 is testable: ALERTA coral,
 * SUSCRIPCIÓN amber, ACCIÓN mint — and CTAs that navigate, never chat.
 */

import type { TFunction } from 'i18next';

import type { AccentColor } from '@/shared/domain';
import { daysBetween } from '@/shared/presentation/utils/dates';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

import type { FeedInsight } from '../../domain/types/AgentFeed';

export type PresentedInsight = {
  key: string;
  pill: string;
  color: AccentColor;
  title: string;
  body: string;
  cta: string;
  route: '/budgets' | '/subscriptions' | '/movements';
};

export function presentInsight(
  insight: FeedInsight,
  t: TFunction,
  today: string,
): PresentedInsight {
  switch (insight.kind) {
    case 'cap_alert': {
      const name = insight.categoryName ?? t('assistant.insights.cap.global');
      const broken = insight.over !== null || insight.used >= 1;
      return {
        key: insight.key,
        pill: t('assistant.insights.pill.alert'),
        color: 'coral',
        title: broken
          ? t('assistant.insights.cap.brokenTitle', { name })
          : t('assistant.insights.cap.nearTitle', {
              name,
              pct: Math.round(insight.used * 100),
            }),
        body: t('assistant.insights.cap.body', {
          spent: formatMoney(insight.spent),
          target: formatMoney(insight.target),
        }),
        cta: t('assistant.insights.cap.cta'),
        route: '/budgets',
      };
    }
    case 'upcoming_charge': {
      const days = daysBetween(today, insight.dueOn);
      const when =
        days <= 0
          ? t('assistant.insights.charge.today')
          : days === 1
            ? t('assistant.insights.charge.tomorrow')
            : t('assistant.insights.charge.inDays', { days });
      return {
        key: insight.key,
        pill: t('assistant.insights.pill.subscription'),
        color: 'amber',
        title: t('assistant.insights.charge.title', { name: insight.name, when }),
        body: t('assistant.insights.charge.body', {
          amount: formatMoney(insight.amount),
        }),
        cta: t('assistant.insights.charge.cta'),
        route: '/subscriptions',
      };
    }
    case 'uncategorized':
      return {
        key: insight.key,
        pill: t('assistant.insights.pill.action'),
        color: 'mint',
        title: t('assistant.insights.uncategorized.title', { count: insight.count }),
        body: t('assistant.insights.uncategorized.body', {
          amount: formatMoney(insight.spent),
        }),
        cta: t('assistant.insights.uncategorized.cta'),
        route: '/movements',
      };
  }
}
