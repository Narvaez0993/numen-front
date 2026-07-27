import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import type { Objective } from '@/shared/domain';
import { Card, Icon, ProgressBar, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { monthName, shiftMonth } from '@/shared/presentation/utils/dates';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

import type {
  HeroFocus,
  MonthSummary,
  SpendingPace,
} from '../../domain/types/HomeOverview';

import { GettingStarted, type StartStep } from './GettingStarted';

type Props = {
  focus: HeroFocus;
  objective: Objective | null;
  month: MonthSummary;
  pace: SpendingPace | null;
  netBalance: number;
  cardDebt: number;
  cardLimit: number;
  /** `2026-07` — the month every figure belongs to. */
  period: string;
  daysLeft: number;
  onSaldoPress?: () => void;
  onMonthPress?: () => void;
  /** Shown when `focus` is `start`. */
  start: { steps: StartStep[]; firstTime: boolean };
  /** What the `invite` face asks for, per objective. */
  onInvite?: () => void;
};

/** Below this, calling a change "more" or "less" is noise. */
const FLAT_THRESHOLD = 0.01;

/**
 * The Home hero. It answers **"how am I going?"** — never "how much may I spend
 * today".
 *
 * The figure it used to show was `(income - spent) / days left`, and it had the
 * incentive backwards: holding back today made tomorrow's number **bigger**. This one
 * leads with the figure that serves what the user said they came for, and falls back
 * to the month's pace, which can only get better by spending less.
 *
 * `focus` comes from the server, which is the only place that knows both the objective
 * and what data exists. The component renders the face it is told to and never guesses.
 */
export function TodayHero({
  focus,
  objective,
  month,
  pace,
  netBalance,
  cardDebt,
  cardLimit,
  period,
  daysLeft,
  onSaldoPress,
  onMonthPress,
  start,
  onInvite,
}: Props) {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const thisMonth = monthName(`${period}-01`, i18n.language);

  const monthLabel = t(daysLeft === 1 ? 'home.month.labelOne' : 'home.month.label', {
    month: thisMonth,
    daysLeft,
  });

  // Position and month: the same two rows under every face.
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

  const trend = <Trend change={month.change} period={period} />;

  return (
    <Card padding={18} radius={20}>
      {focus === 'start' ? (
        <GettingStarted
          steps={start.steps}
          firstTime={start.firstTime}
          footer={t('home.start.footer')}
        />
      ) : null}

      {focus === 'pace' ? (
        <>
          <Label>{t('home.pace.label')}</Label>
          <Figure amount={month.spent} suffix={t('home.pace.spent')} />
          {pace === null ? null : (
            <Text variant="caption" color={theme.colors.textSecondary}>
              {t('home.pace.rate', { amount: formatMoney(pace.dailyAverage) })}
              {' · '}
              {t('home.pace.projection', {
                month: thisMonth,
                amount: formatMoney(pace.projected),
              })}
            </Text>
          )}
          {trend}
        </>
      ) : null}

      {focus === 'debt' ? (
        <>
          <Label>{t('home.debt.label')}</Label>
          <Figure
            amount={cardDebt}
            suffix={t('home.debt.caption')}
            color={theme.colors.accentCoral}
          />
          {cardLimit > 0 ? (
            <>
              <Text
                variant="caption"
                color={theme.colors.textSecondary}
                style={{ marginBottom: 8 }}
              >
                {t('home.debt.utilization', {
                  pct: Math.round((cardDebt / cardLimit) * 100),
                  amount: formatMoney(cardLimit),
                })}
              </Text>
              {/* A ratio with a real ceiling, so the warning ramp applies here. */}
              <ProgressBar pct={cardDebt / cardLimit} height={7} />
            </>
          ) : null}
        </>
      ) : null}

      {focus === 'saving' ? (
        <>
          <Label>{t('home.saving.label')}</Label>
          <Figure
            amount={month.saved}
            suffix={
              month.saved < 0 ? t('home.saving.negative') : t('home.saving.thisMonth')
            }
            color={month.saved < 0 ? theme.colors.accentCoral : undefined}
          />
          {month.saved > 0 ? (
            <>
              <Text
                variant="caption"
                color={theme.colors.textSecondary}
                style={{ marginBottom: 8 }}
              >
                {t('home.saving.rate', {
                  pct: Math.round(month.savingsRate * 100),
                })}
              </Text>
              {/* Share of income kept: more is better, so no warning ramp. */}
              <ProgressBar
                pct={month.savingsRate}
                height={7}
                color={theme.colors.accentMint}
              />
            </>
          ) : (
            trend
          )}
        </>
      ) : null}

      {focus === 'invite' ? (
        <Invite objective={objective} pace={pace} onPress={onInvite} />
      ) : null}

      {secondaryRows}
    </Card>
  );
}

function Label({ children }: { children: string }) {
  return (
    <Text
      variant="micro"
      muted
      uppercase
      style={{ marginBottom: 8, letterSpacing: 1.05 }}
    >
      {children}
    </Text>
  );
}

function Figure({
  amount,
  suffix,
  color,
}: {
  amount: number;
  suffix: string;
  color?: string;
}) {
  const { theme } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 8,
        marginBottom: 6,
        flexWrap: 'wrap',
      }}
    >
      <Text variant="display" tabular color={color ?? theme.colors.textPrimary}>
        {formatMoney(amount)}
      </Text>
      <Text variant="caption" muted>
        {suffix}
      </Text>
    </View>
  );
}

/** The same stretch of last month. Absent on a first month — nothing to compare to. */
function Trend({ change, period }: { change: number | null; period: string }) {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  if (change === null) return null;

  const flat = Math.abs(change) < FLAT_THRESHOLD;
  const up = change > 0;
  const previousMonth = monthName(shiftMonth(`${period}-01`, -1), i18n.language);
  const tone = flat
    ? theme.colors.textSecondary
    : up
      ? theme.colors.accentCoral
      : theme.colors.accentMint;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 }}>
      {flat ? null : (
        <Icon name={up ? 'arrow-up-right' : 'arrow-down-left'} size={13} color={tone} />
      )}
      <Text variant="caption" color={tone} style={{ fontSize: 11.5 }}>
        {flat
          ? t('home.pace.same', { month: previousMonth })
          : t(up ? 'home.pace.more' : 'home.pace.less', {
              pct: Math.abs(Math.round(change * 100)),
              month: previousMonth,
            })}
      </Text>
    </View>
  );
}

/**
 * "You told us what you came for and we cannot answer it yet."
 *
 * Not a fallback: turning the objective the user already stated into the next action is
 * the most useful thing this card can do. Both invitations point at something that
 * exists today — a card to register, an income to add — never at a "coming soon".
 */
function Invite({
  objective,
  pace,
  onPress,
}: {
  objective: Objective | null;
  pace: SpendingPace | null;
  onPress?: () => void;
}) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const key = objective ?? 'gastos';

  return (
    <View>
      <Label>{t(`home.invite.${key}.title`)}</Label>
      <Text
        variant="body"
        color={theme.colors.textSecondary}
        style={{ fontSize: 13.5, lineHeight: 20, marginBottom: 12 }}
      >
        {t(`home.invite.${key}.body`)}
      </Text>
      {onPress ? (
        <Pressable
          accessibilityRole="button"
          onPress={onPress}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            alignSelf: 'flex-start',
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
            {t(`home.invite.${key}.action`)}
          </Text>
        </Pressable>
      ) : null}
      {pace === null ? null : (
        <Text variant="caption" muted style={{ fontSize: 11.5, marginTop: 12 }}>
          {t('home.invite.meanwhile', {
            amount: formatMoney(pace.dailyAverage),
          })}
        </Text>
      )}
    </View>
  );
}
