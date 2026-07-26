import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Card, Icon, ProgressBar, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { monthName } from '@/shared/presentation/utils/dates';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

import type { DailyAllowance, MonthSummary } from '../../domain/types/HomeOverview';

import { GettingStarted, type StartStep } from './GettingStarted';

type Props = {
  daily: DailyAllowance;
  month: MonthSummary;
  netBalance: number;
  /** `2026-07` — the month every figure belongs to. */
  period: string;
  daysLeft: number;
  onSaldoPress?: () => void;
  onMonthPress?: () => void;
  /** Shown in place of the daily figure while there is no basis for one. */
  start: { steps: StartStep[]; firstTime: boolean };
};

/**
 * The Home hero. It has two faces because the app only promises what it can
 * derive from real data:
 *
 * - with a basis (income today, a budget in phase 3) it leads with what is left
 *   for today — negative included, an overspent month is not rounded up to zero;
 * - without one it leads with **what to do about it**: a checklist of the three
 *   things that turn the figure on. A brand-new user used to land on a hero of
 *   zeros, which is the worst thing a money app can say on its first screen.
 *
 * Net balance and the month's spend stay in both.
 */
export function TodayHero({
  daily,
  month,
  netBalance,
  period,
  daysLeft,
  onSaldoPress,
  onMonthPress,
  start,
}: Props) {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const hasAllowance = daily.basis !== 'none';
  const overspent = daily.available < 0;

  // What today started with, so the bar measures today against today.
  const todayShare = daily.available + daily.spentToday;
  const pct = todayShare > 0 ? daily.spentToday / todayShare : 1;

  const monthLabel = t(daysLeft === 1 ? 'home.month.labelOne' : 'home.month.label', {
    month: monthName(`${period}-01`, i18n.language),
    daysLeft,
  });

  // Position and month: the same two rows under either face of the hero.
  const secondaryRows = (
    <>
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
            {formatMoney(netBalance)}
          </Text>
          <Icon name="chevron-right" size={14} color={theme.colors.textTertiary} />
        </View>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        onPress={onMonthPress}
        disabled={!onMonthPress}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: 11,
          paddingBottom: 2,
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Text variant="caption" muted>
          {monthLabel}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text variant="caption" color={theme.colors.textSecondary} tabular>
            {formatMoney(month.spent)}
          </Text>
          <Text variant="caption" muted tabular>
            {t('home.month.movements', { count: month.movements })}
          </Text>
          <Icon name="chevron-right" size={14} color={theme.colors.textTertiary} />
        </View>
      </Pressable>
    </>
  );

  if (!hasAllowance) {
    return (
      <Card padding={18} radius={20}>
        <GettingStarted
          steps={start.steps}
          firstTime={start.firstTime}
          footer={t('home.start.footer')}
        />
        {secondaryRows}
      </Card>
    );
  }

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
        <Text
          variant="display"
          tabular
          color={overspent ? theme.colors.accentCoral : theme.colors.textPrimary}
        >
          {formatMoney(daily.available)}
        </Text>
        <Text variant="caption" muted>
          {t(overspent ? 'home.daily.overspent' : 'home.daily.availableToday')}
        </Text>
      </View>

      <Text
        variant="caption"
        color={theme.colors.textSecondary}
        style={{ marginBottom: 14 }}
      >
        <Text variant="caption" color={theme.colors.textSecondary} tabular>
          {formatMoney(daily.spentToday)}
        </Text>{' '}
        {t('home.daily.spentToday')}{' '}
        <Text variant="caption" muted>
          ·
        </Text>{' '}
        {t(`home.daily.basis.${daily.basis}`)}
      </Text>
      <ProgressBar pct={pct} height={7} />

      {secondaryRows}
    </Card>
  );
}
