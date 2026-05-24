import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Card, ProgressBar, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { formatCOP } from '@/shared/presentation/utils/formatCOP';

import type { DailyAllowance, MonthProgress } from '../../domain/types/HomeOverview';

type Props = {
  month: MonthProgress;
  daily: DailyAllowance;
  monthName?: string;
};

export function MesHero({ month, daily, monthName = 'Mayo' }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const pct = month.spent / month.target;

  return (
    <Card padding={18} radius={20}>
      <Text
        variant="micro"
        muted
        uppercase
        style={{ marginBottom: 10, letterSpacing: 1.05, paddingRight: 44 }}
      >
        {t(month.daysLeft === 1 ? 'home.month.labelOne' : 'home.month.label', {
          month: monthName,
          daysLeft: month.daysLeft,
        })}
      </Text>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'baseline',
          gap: 8,
          marginBottom: 4,
          flexWrap: 'wrap',
        }}
      >
        <Text variant="display" tabular>
          {formatCOP(month.spent)}
        </Text>
        <Text variant="caption" muted tabular style={{ fontSize: 14 }}>
          / {formatCOP(month.target)}
        </Text>
      </View>
      <Text
        variant="caption"
        color={theme.colors.textSecondary}
        style={{ marginBottom: 14, fontSize: 12 }}
      >
        {t('home.month.dailySuggested')}{' '}
        <Text
          variant="caption"
          color={theme.colors.accentMint}
          tabular
          style={{ fontSize: 12, fontWeight: '500' }}
        >
          {formatCOP(daily.suggested)}
        </Text>
      </Text>
      <ProgressBar pct={pct} height={7} />
    </Card>
  );
}
