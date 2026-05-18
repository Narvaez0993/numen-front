import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Card, ProgressBar, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { formatCOP } from '@/shared/presentation/utils/formatCOP';

import type { MonthBudget } from '../../domain/types/Budget';

import { BudgetStat } from './BudgetStat';

type Props = { month: MonthBudget };

export function MonthHero({ month }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const pct = month.spent / month.target;
  const available = month.target - month.spent;

  return (
    <Card padding={20} radius={22}>
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
          {t('budgets.month.label')}
        </Text>
        <Text variant="micro" muted style={{ fontSize: 10.5, letterSpacing: 0.5 }}>
          <Text variant="micro" muted tabular style={{ fontSize: 10.5 }}>
            {month.daysLeft}
          </Text>{' '}
          {t(
            month.daysLeft === 1 ? 'budgets.month.daysLeftOne' : 'budgets.month.daysLeft',
          )}
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
          {formatCOP(month.spent)}
        </Text>
        <Text variant="caption" muted tabular style={{ fontSize: 14 }}>
          {t('budgets.month.of')} {formatCOP(month.target)}
        </Text>
      </View>
      <Text
        variant="caption"
        color={theme.colors.textSecondary}
        style={{ marginBottom: 16 }}
      >
        {t('budgets.month.youCarry')}{' '}
        <Text variant="caption" tabular style={{ fontWeight: '500' }}>
          {Math.round(pct * 100)}%
        </Text>{' '}
        {t('budgets.month.ofTheMonth')}
      </Text>

      <ProgressBar pct={pct} height={9} />

      <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
        <BudgetStat label={t('budgets.month.available')} value={formatCOP(available)} />
        <BudgetStat
          label={t('budgets.month.dailySuggested')}
          value={formatCOP(month.dailySuggested)}
          variant="mint"
        />
      </View>
    </Card>
  );
}
