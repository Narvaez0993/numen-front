import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Card, ProgressBar, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { formatCOP } from '@/shared/presentation/utils/formatCOP';

import type { DailyAllowance } from '../../domain/types/HomeOverview';

type Props = { daily: DailyAllowance };

export function DailyHero({ daily }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const remaining = daily.suggested - daily.spent;
  const pct = daily.spent / daily.suggested;

  return (
    <Card padding={18} radius={20}>
      <Text
        variant="micro"
        muted
        uppercase
        style={{ marginBottom: 8, letterSpacing: 1.05 }}
      >
        {t('home.daily.label')}
      </Text>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'baseline',
          gap: 8,
          marginBottom: 6,
          flexWrap: 'wrap',
        }}
      >
        <Text variant="display" tabular>
          {formatCOP(remaining)}
        </Text>
        <Text variant="caption" muted>
          {t('home.daily.availableToday')}
        </Text>
      </View>
      <Text
        variant="caption"
        color={theme.colors.textSecondary}
        style={{ marginBottom: 14 }}
      >
        <Text variant="caption" color={theme.colors.textSecondary} tabular>
          {formatCOP(daily.spent)}
        </Text>{' '}
        {t('home.daily.spent')}{' '}
        <Text variant="caption" muted>
          ·
        </Text>{' '}
        {t('home.daily.of')}{' '}
        <Text variant="caption" color={theme.colors.textSecondary} tabular>
          {formatCOP(daily.suggested)}
        </Text>{' '}
        {t('home.daily.suggested')}
      </Text>
      <ProgressBar pct={pct} height={7} />
    </Card>
  );
}
