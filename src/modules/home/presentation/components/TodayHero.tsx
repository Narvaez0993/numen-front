import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Card, Icon, ProgressBar, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { monthName } from '@/shared/presentation/utils/dates';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

import type { DailyAllowance, MonthSummary } from '../../domain/types/HomeOverview';

type Props = {
  daily: DailyAllowance;
  month: MonthSummary;
  netBalance: number;
  /** `2026-07` — the month every figure belongs to. */
  period: string;
  daysLeft: number;
  onSaldoPress?: () => void;
  onMonthPress?: () => void;
  /** Offered only while there is no basis for a daily figure. */
  onRegisterIncome?: () => void;
};

/**
 * The Home hero. It has two faces because the app only promises what it can
 * derive from real data:
 *
 * - with a basis (income today, a budget in phase 3) it leads with what is left
 *   for today — negative included, an overspent month is not rounded up to zero;
 * - without one it leads with the month's spending and asks for an income,
 *   instead of inventing an allowance out of nothing.
 *
 * Net balance and the month row stay in both.
 */
export function TodayHero({
  daily,
  month,
  netBalance,
  period,
  daysLeft,
  onSaldoPress,
  onMonthPress,
  onRegisterIncome,
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

  return (
    <Card padding={18} radius={20}>
      <Text
        variant="micro"
        muted
        uppercase
        style={{ marginBottom: 8, letterSpacing: 1.05 }}
      >
        {t(hasAllowance ? 'home.daily.label' : 'home.month.spentLabel')}
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
          color={
            hasAllowance && overspent
              ? theme.colors.accentCoral
              : theme.colors.textPrimary
          }
        >
          {formatMoney(hasAllowance ? daily.available : month.spent)}
        </Text>
        <Text variant="caption" muted>
          {hasAllowance
            ? t(overspent ? 'home.daily.overspent' : 'home.daily.availableToday')
            : t('home.month.spentSuffix')}
        </Text>
      </View>

      {hasAllowance ? (
        <>
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
        </>
      ) : (
        <>
          <Text variant="caption" color={theme.colors.textSecondary}>
            {t('home.daily.noBasis')}
          </Text>
          {onRegisterIncome ? (
            <Pressable
              accessibilityRole="button"
              onPress={onRegisterIncome}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                alignSelf: 'flex-start',
                marginTop: 12,
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 11,
                backgroundColor: theme.colors.accentMintBg,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Icon name="plus" size={14} color={theme.colors.accentMint} />
              <Text
                variant="label"
                color={theme.colors.accentMint}
                style={{ fontSize: 12.5 }}
              >
                {t('home.daily.registerIncome')}
              </Text>
            </Pressable>
          ) : null}
        </>
      )}

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
          {/* The month's spend already leads the hero when there is no allowance. */}
          {hasAllowance ? (
            <Text variant="caption" color={theme.colors.textSecondary} tabular>
              {formatMoney(month.spent)}
            </Text>
          ) : null}
          <Text variant="caption" muted tabular>
            {t('home.month.movements', { count: month.movements })}
          </Text>
          <Icon name="chevron-right" size={14} color={theme.colors.textTertiary} />
        </View>
      </Pressable>
    </Card>
  );
}
