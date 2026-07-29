import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import type { Objective } from '@/shared/domain';
import { Card, Icon, ProgressBar, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { monthName, shiftMonth } from '@/shared/presentation/utils/dates';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

import type {
  BudgetCap,
  HeroFocus,
  HeroGoal,
  MonthSummary,
  PersonalDebts,
  SpendingPace,
} from '../../domain/types/HomeOverview';

import { GettingStarted, type StartStep } from './GettingStarted';

type Props = {
  focus: HeroFocus;
  objective: Objective | null;
  month: MonthSummary;
  pace: SpendingPace | null;
  /** The ceiling the user set; `null` when they set none. */
  budget: BudgetCap | null;
  debts: PersonalDebts;
  /** The active goal closest to done; leads the `saving` face when present. */
  goal: HeroGoal | null;
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
  onBudgetPress?: () => void;
  onGoalPress?: () => void;
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
  budget,
  debts,
  goal,
  netBalance,
  cardDebt,
  cardLimit,
  period,
  daysLeft,
  onSaldoPress,
  onMonthPress,
  start,
  onInvite,
  onBudgetPress,
  onGoalPress,
}: Props) {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const thisMonth = monthName(`${period}-01`, i18n.language);

  const monthLabel = t(daysLeft === 1 ? 'home.month.labelOne' : 'home.month.label', {
    month: thisMonth,
    daysLeft,
  });

  /**
   * The cap, small, for the faces that a declared objective won. `focus: budget` already
   * leads with these numbers, so repeating them there would be noise.
   */
  const capRow =
    budget === null || focus === 'budget' || focus === 'start' ? null : (
      <Pressable
        accessibilityRole="button"
        onPress={onBudgetPress}
        disabled={!onBudgetPress}
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
          {t('home.budget.row', { pct: Math.round(budget.used * 100) })}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text
            variant="caption"
            color={
              budget.perDay === null
                ? theme.colors.accentCoral
                : theme.colors.textSecondary
            }
            tabular
          >
            {budget.perDay === null
              ? t('home.budget.spent')
              : t('home.budget.perDay', { amount: formatMoney(budget.perDay) })}
          </Text>
          <Icon name="chevron-right" size={14} color={theme.colors.textTertiary} />
        </View>
      </Pressable>
    );

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

      {capRow}

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
            amount={cardDebt + debts.iOwe}
            suffix={t('home.debt.caption')}
            color={theme.colors.accentCoral}
          />
          {cardDebt > 0 && debts.iOwe > 0 ? (
            <Text
              variant="caption"
              color={theme.colors.textSecondary}
              style={{ marginBottom: 8 }}
            >
              {t('home.debt.breakdown', {
                cards: formatMoney(cardDebt),
                people: formatMoney(debts.iOwe),
              })}
            </Text>
          ) : debts.iOwe > 0 ? (
            <Text
              variant="caption"
              color={theme.colors.textSecondary}
              style={{ marginBottom: 8 }}
            >
              {t('home.debt.onlyPeople', { count: debts.openCount })}
            </Text>
          ) : cardLimit > 0 ? (
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
          ) : null}
          {cardLimit > 0 && debts.iOwe === 0 ? (
            // A ratio with a real ceiling, so the warning ramp applies here. Mixed
            // debt has no honest ceiling to draw a bar against.
            <ProgressBar pct={cardDebt / cardLimit} height={7} />
          ) : null}
          {debts.owedToMe > 0 ? (
            <Text
              variant="caption"
              color={theme.colors.accentMint}
              style={{ fontSize: 11.5, marginTop: 8 }}
            >
              {t('home.debt.owedToMe', { amount: formatMoney(debts.owedToMe) })}
            </Text>
          ) : null}
        </>
      ) : null}

      {focus === 'saving' && goal !== null ? (
        <Pressable
          accessibilityRole="button"
          onPress={onGoalPress}
          disabled={!onGoalPress}
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        >
          <Label>{goal.name}</Label>
          <Figure
            amount={goal.saved}
            suffix={t('home.goal.of', { amount: formatMoney(goal.target) })}
          />
          <Text
            variant="caption"
            color={theme.colors.textSecondary}
            style={{ marginBottom: 8 }}
          >
            {goal.pct >= 1
              ? t('home.goal.achieved')
              : goal.projectedOn === null
                ? t('home.goal.start')
                : t('home.goal.projection', {
                    month: `${monthName(`${goal.projectedOn}-01`, i18n.language)} ${goal.projectedOn.slice(0, 4)}`,
                  })}
          </Text>
          {/* Progress toward the target: more is better, so no warning ramp. */}
          <ProgressBar pct={goal.pct} height={7} color={theme.colors.accentMint} />
          {month.saved > 0 ? (
            <Text variant="caption" muted style={{ fontSize: 11.5, marginTop: 8 }}>
              {t('home.goal.monthSupport', { amount: formatMoney(month.saved) })}
            </Text>
          ) : null}
        </Pressable>
      ) : null}

      {focus === 'saving' && goal === null ? (
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

      {focus === 'budget' && budget !== null ? (
        <>
          <Label>{t('home.budget.label', { month: thisMonth })}</Label>
          <Figure
            amount={budget.spent}
            suffix={t('home.budget.of', { amount: formatMoney(budget.target) })}
            color={budget.remaining < 0 ? theme.colors.accentCoral : undefined}
          />
          <Text
            variant="caption"
            color={theme.colors.textSecondary}
            style={{ marginBottom: 8 }}
          >
            {budget.perDay === null
              ? t('home.budget.over', {
                  amount: formatMoney(Math.abs(budget.remaining)),
                })
              : t('home.budget.ceiling', {
                  amount: formatMoney(budget.perDay),
                  count: daysLeft,
                })}
          </Text>
          {/* A ratio with a real ceiling, so the warning ramp applies here. */}
          <ProgressBar pct={budget.used} height={7} />
          {budget.projected === null ? null : (
            <Text
              variant="caption"
              color={
                budget.over === null ? theme.colors.accentMint : theme.colors.accentAmber
              }
              style={{ fontSize: 11.5, marginTop: 8 }}
            >
              {t(budget.over === null ? 'home.budget.willFit' : 'home.budget.willBust', {
                amount: formatMoney(budget.projected),
                gap: formatMoney(budget.over ?? budget.target - budget.projected),
              })}
            </Text>
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
