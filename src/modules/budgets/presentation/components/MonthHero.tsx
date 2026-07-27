import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Card, ProgressBar, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

import type { Cap } from '../../domain';

import { BudgetStat } from './BudgetStat';

type Props = {
  month: Cap;
  monthName: string;
  daysLeft: number;
  onPress?: () => void;
};

/**
 * The month against its ceiling.
 *
 * Both stats at the bottom tell the truth about being over: `remaining` flips to "te
 * pasaste" in coral instead of showing a friendlier $0, and the daily ceiling disappears
 * rather than showing a negative — there is nothing left to spread over the days.
 */
export function MonthHero({ month, monthName, daysLeft, onPress }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const over = month.remaining < 0;

  return (
    <Card padding={20} radius={22} onPress={onPress}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 10,
          marginBottom: 10,
        }}
      >
        <Text variant="micro" muted uppercase style={{ letterSpacing: 1.05 }}>
          {t('budgets.month.label', { month: monthName })}
        </Text>
        <Text variant="micro" muted style={{ fontSize: 10.5, letterSpacing: 0.5 }}>
          <Text variant="micro" muted tabular style={{ fontSize: 10.5 }}>
            {daysLeft}
          </Text>{' '}
          {t(daysLeft === 1 ? 'budgets.month.daysLeftOne' : 'budgets.month.daysLeft')}
        </Text>
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'baseline',
          gap: 6,
          marginBottom: 4,
          flexWrap: 'wrap',
        }}
      >
        <Text variant="display" tabular>
          {formatMoney(month.spent)}
        </Text>
        <Text variant="caption" muted tabular style={{ fontSize: 14 }}>
          {t('budgets.month.of')} {formatMoney(month.target)}
        </Text>
      </View>
      <Text
        variant="caption"
        color={theme.colors.textSecondary}
        style={{ marginBottom: 16 }}
      >
        {t('budgets.month.youCarry')}{' '}
        <Text variant="caption" tabular style={{ fontWeight: '500' }}>
          {Math.round(month.used * 100)}%
        </Text>{' '}
        {t('budgets.month.ofTheMonth')}
      </Text>

      <ProgressBar pct={month.used} height={9} />

      <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
        <BudgetStat
          label={t(over ? 'budgets.month.overBy' : 'budgets.month.available')}
          value={formatMoney(Math.abs(month.remaining))}
          variant={over ? 'coral' : 'primary'}
        />
        {month.perDay !== null && (
          <BudgetStat
            label={t('budgets.month.dailySuggested')}
            value={t('budgets.month.perDay', { amount: formatMoney(month.perDay) })}
            variant="mint"
          />
        )}
      </View>
    </Card>
  );
}
