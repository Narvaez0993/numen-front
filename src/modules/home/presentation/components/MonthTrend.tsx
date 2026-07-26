import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useMovementsSummary } from '@/modules/movements/presentation/hooks/useMovementsSummary';
import { Card, IconBox, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import {
  fromIsoDate,
  monthName,
  sameSpanLastMonth,
} from '@/shared/presentation/utils/dates';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

type Props = {
  /** Spent so far this month, from the Home overview. */
  spent: number;
  /** The device's local day (`YYYY-MM-DD`). */
  today: string;
};

/** Under this, calling it "more" or "less" is noise. */
const FLAT_THRESHOLD = 0.01;

/**
 * This month against the same stretch of the last one.
 *
 * The comparison is **day-capped on purpose** (July 1–26 vs June 1–26): telling
 * someone on the 3rd that they are spending 80% less than last month would be a
 * compliment the calendar earned, not them. With no history last month there is
 * nothing to compare, so the card does not exist.
 */
export function MonthTrend({ spent, today }: Props) {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const range = sameSpanLastMonth(today);
  const previous = useMovementsSummary(range);

  const before = previous.data?.expenseTotal ?? 0;
  if (before === 0) return null;

  const change = (spent - before) / before;
  const flat = Math.abs(change) < FLAT_THRESHOLD;
  const up = change > 0;

  const tone = flat
    ? theme.colors.textSecondary
    : up
      ? theme.colors.accentCoral
      : theme.colors.accentMint;

  return (
    <Card padding={14}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <IconBox
          name={flat ? 'equal' : up ? 'arrow-up-right' : 'arrow-down-left'}
          color={flat ? 'purple' : up ? 'coral' : 'mint'}
          size={36}
          iconSize={17}
        />
        <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
          <Text variant="bodyLarge" color={tone} style={{ fontSize: 13.5 }}>
            {flat
              ? t('home.trend.same', { month: monthName(range.from, i18n.language) })
              : t(up ? 'home.trend.more' : 'home.trend.less', {
                  pct: Math.abs(Math.round(change * 100)),
                  month: monthName(range.from, i18n.language),
                })}
          </Text>
          <Text variant="caption" muted style={{ fontSize: 11.5 }} numberOfLines={1}>
            {t('home.trend.caption', {
              amount: formatMoney(before),
              day: fromIsoDate(range.to).getDate(),
            })}
          </Text>
        </View>
      </View>
    </Card>
  );
}
