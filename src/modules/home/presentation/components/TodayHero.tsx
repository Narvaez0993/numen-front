import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Card, Icon, ProgressBar, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { formatCOP } from '@/shared/presentation/utils/formatCOP';

import type {
  DailyAllowance,
  MonthProgress,
  Saldo,
} from '../../domain/types/HomeOverview';

type Props = {
  daily: DailyAllowance;
  saldo: Saldo;
  month: MonthProgress;
  onSaldoPress?: () => void;
  onMonthPress?: () => void;
};

/**
 * The single Home hero: daily allowance first, net balance and month
 * progress as secondary rows. Replaces the old switchable hero variants.
 */
export function TodayHero({ daily, saldo, month, onSaldoPress, onMonthPress }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const remaining = daily.suggested - daily.spent;
  const pct = daily.spent / daily.suggested;
  const monthPct = month.target > 0 ? month.spent / month.target : 0;
  const monthLabel = t(
    month.daysLeft === 1 ? 'home.month.labelOne' : 'home.month.label',
    { month: month.name, daysLeft: month.daysLeft },
  );

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

      <View
        style={{
          height: 1,
          backgroundColor: theme.colors.borderSubtle,
          marginTop: 16,
          marginBottom: 2,
        }}
      />

      <Pressable
        accessibilityRole="button"
        onPress={onSaldoPress}
        disabled={!onSaldoPress}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: 11,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.borderSubtle,
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Text variant="caption" muted>
          {t('home.saldo.label')}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text variant="bodyLarge" tabular>
            {formatCOP(saldo.net)}
          </Text>
          <Icon name="chevron-right" size={14} color={theme.colors.textTertiary} />
        </View>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        onPress={onMonthPress}
        disabled={!onMonthPress}
        style={({ pressed }) => ({
          paddingTop: 11,
          paddingBottom: 2,
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 8,
          }}
        >
          <Text variant="caption" muted>
            {monthLabel}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text variant="caption" color={theme.colors.textSecondary} tabular>
              {formatCOP(month.spent)} {t('home.daily.of')} {formatCOP(month.target)}
            </Text>
            <Icon name="chevron-right" size={14} color={theme.colors.textTertiary} />
          </View>
        </View>
        <ProgressBar pct={monthPct} height={4} />
      </Pressable>
    </Card>
  );
}
