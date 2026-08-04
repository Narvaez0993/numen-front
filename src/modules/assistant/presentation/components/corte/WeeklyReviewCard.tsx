import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Icon, Pill, ProgressBar, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { addDays, shortDate, weekdayInitials } from '@/shared/presentation/utils/dates';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

import type {
  AgentOutput,
  PlayFollowUp,
  WeeklyDaySpend,
} from '../../../domain/types/AgentFeed';
import { PlayAction } from './PlayAction';
import { PlayRow } from './PlayRow';

type Props = {
  review: AgentOutput;
  today: string;
  /** Removes from the feed. Absent on the dedicated screen: there the X would
   * read as "close", and removal belongs to the shelf. */
  onDismiss?: () => void;
};

const BAR_AREA_HEIGHT = 44;

/**
 * The coach's weekly report. It used to be a sentence and one number — which
 * read as poor next to the Corte — so the payload now travels with the week
 * in data and this card renders it: the days, where the money went, the cap,
 * the goal, then the plan and last week's accountability, all visible at once
 * (it only ever lives inside a sheet — folding the plan was one tap too many).
 *
 * Every block renders only when its data exists: reviews stored before the
 * blocks were added simply show what they have.
 */
export function WeeklyReviewCard({ review, today, onDismiss }: Props) {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const weekly = review.weekly;

  if (!weekly) return null;

  const delta = weekly.deltaPct;
  const better = delta !== null && delta <= 0;
  const hasPlan = review.plays.length > 0 || weekly.accountability.length > 0;
  const range =
    weekly.dateFrom && weekly.dateTo
      ? `${shortDate(weekly.dateFrom, i18n.language)} – ${shortDate(weekly.dateTo, i18n.language)}`
      : null;

  return (
    <View
      style={{
        backgroundColor: theme.colors.bgSurface,
        borderColor: theme.colors.borderSubtle,
        borderWidth: 1,
        borderRadius: 16,
        padding: 14,
        gap: 12,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
          <Pill variant={review.readAt === null ? 'purple' : 'neutral'} uppercase>
            {t('assistant.weekly.pill')}
          </Pill>
          {range ? (
            <Text
              variant="caption"
              muted
              tabular
              numberOfLines={1}
              style={{ fontSize: 11.5 }}
            >
              {range}
              {weekly.movements
                ? ` · ${t('assistant.weekly.movements', { count: weekly.movements })}`
                : ''}
            </Text>
          ) : null}
        </View>
        {onDismiss ? (
          <Pressable
            accessibilityRole="button"
            onPress={onDismiss}
            hitSlop={10}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          >
            <Icon name="x" size={14} color={theme.colors.textTertiary} />
          </Pressable>
        ) : null}
      </View>

      <View style={{ gap: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
          <Text variant="label" tabular style={{ fontSize: 22, letterSpacing: -0.6 }}>
            {formatMoney(weekly.weekTotal)}
          </Text>
          {delta !== null ? (
            <Text
              variant="caption"
              color={better ? theme.colors.accentMint : theme.colors.accentCoral}
              style={{ fontSize: 12 }}
            >
              {better
                ? t('assistant.weekly.less', { pct: Math.round(Math.abs(delta) * 100) })
                : t('assistant.weekly.more', { pct: Math.round(delta * 100) })}
            </Text>
          ) : null}
        </View>
        <Text
          variant="caption"
          color={theme.colors.textSecondary}
          style={{ fontSize: 12.5, lineHeight: 18 }}
        >
          {weekly.diagnosisText}
        </Text>
      </View>

      {weekly.byDay.length > 0 && weekly.dateFrom ? (
        <WeekBars
          byDay={weekly.byDay}
          dateFrom={weekly.dateFrom}
          language={i18n.language}
        />
      ) : null}

      {weekly.topCategories.length > 0 ? (
        <View style={{ gap: 6 }}>
          <Text
            variant="micro"
            muted
            uppercase
            style={{ fontSize: 10, letterSpacing: 0.8 }}
          >
            {t('assistant.weekly.where')}
          </Text>
          {weekly.topCategories.map((category) => (
            <View
              key={category.categoryId ?? 'unclassified'}
              style={{
                flexDirection: 'row',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                gap: 8,
              }}
            >
              <Text
                variant="caption"
                numberOfLines={1}
                style={{ fontSize: 12.5, flex: 1 }}
              >
                {category.name ?? t('assistant.weekly.unclassified')}
              </Text>
              <Text
                variant="caption"
                tabular
                color={theme.colors.textSecondary}
                style={{ fontSize: 12.5 }}
              >
                {formatMoney(category.spent)}
              </Text>
            </View>
          ))}
          {weekly.biggestMerchant ? (
            <Text variant="caption" muted style={{ fontSize: 11.5 }}>
              {t('assistant.weekly.biggest', {
                label: weekly.biggestMerchant.label,
                amount: formatMoney(weekly.biggestMerchant.spent),
              })}
            </Text>
          ) : null}
        </View>
      ) : weekly.topCategoryName ? (
        // Reviews stored before the ranked block existed carry only the name.
        <Text
          variant="caption"
          color={theme.colors.textTertiary}
          style={{ fontSize: 12 }}
        >
          {t('assistant.weekly.topCategory', { name: weekly.topCategoryName })}
        </Text>
      ) : null}

      {weekly.cap ? (
        <View style={{ gap: 6 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              gap: 8,
            }}
          >
            <Text
              variant="micro"
              muted
              uppercase
              style={{ fontSize: 10, letterSpacing: 0.8 }}
            >
              {t('assistant.weekly.cap')}
            </Text>
            <Text
              variant="caption"
              tabular
              color={theme.colors.textSecondary}
              style={{ fontSize: 11.5 }}
            >
              {formatMoney(weekly.cap.spent)} / {formatMoney(weekly.cap.target)}
            </Text>
          </View>
          <ProgressBar pct={weekly.cap.used} height={5} />
        </View>
      ) : null}

      {weekly.goal ? (
        <View style={{ gap: 6 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              gap: 8,
            }}
          >
            <Text
              variant="micro"
              muted
              uppercase
              numberOfLines={1}
              style={{ fontSize: 10, letterSpacing: 0.8, flexShrink: 1 }}
            >
              {t('assistant.weekly.goal', { name: weekly.goal.name })}
            </Text>
            <Text
              variant="caption"
              tabular
              color={theme.colors.textSecondary}
              style={{ fontSize: 11.5 }}
            >
              {formatMoney(weekly.goal.saved)} / {formatMoney(weekly.goal.target)} ·{' '}
              {Math.round(weekly.goal.pct * 100)}%
            </Text>
          </View>
          {/* The pocket's own colour, not the warning ramp: filling a goal is
              the point, not a risk. */}
          <ProgressBar pct={weekly.goal.pct} height={5} color={theme.colors.accentMint} />
        </View>
      ) : null}

      {hasPlan ? (
        <View
          style={{
            gap: 10,
            borderTopWidth: 1,
            borderTopColor: theme.colors.borderSubtle,
            paddingTop: 12,
          }}
        >
          {review.plays.length > 0 ? (
            <Text
              variant="micro"
              muted
              uppercase
              style={{ fontSize: 10, letterSpacing: 0.8 }}
            >
              {t('assistant.weekly.plan')}
            </Text>
          ) : null}
          {review.plays.map((play) => (
            <PlayRow
              key={play.id}
              play={play}
              action={<PlayAction output={review} play={play} today={today} />}
            />
          ))}
          {weekly.accountability.length > 0 ? (
            <View style={{ gap: 6 }}>
              <Text
                variant="caption"
                color={theme.colors.textTertiary}
                style={{ fontSize: 11.5 }}
              >
                {t('assistant.weekly.lastWeek')}
              </Text>
              {weekly.accountability.map((entry) => (
                <FollowUpRow key={entry.playId} entry={entry} />
              ))}
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

/**
 * The week, day by day. The heaviest day wears the accent; the rest stay soft.
 * Bars are relative to that day — the chart answers "when did it go", the
 * amounts already live in the rows below.
 */
function WeekBars({
  byDay,
  dateFrom,
  language,
}: {
  byDay: WeeklyDaySpend[];
  dateFrom: string;
  language: string;
}) {
  const { theme } = useTheme();
  const spentByDay = new Map(byDay.map((d) => [d.day, d.spent]));
  const days = Array.from({ length: 7 }, (_, index) => addDays(dateFrom, index));
  const max = Math.max(...days.map((day) => spentByDay.get(day) ?? 0));
  if (max <= 0) return null;
  // ISO weeks start on Monday — exactly the stretch the review covers.
  const initials = weekdayInitials(language, 1);

  return (
    <View style={{ flexDirection: 'row', gap: 6, alignItems: 'flex-end' }}>
      {days.map((day, index) => {
        const spent = spentByDay.get(day) ?? 0;
        const height =
          spent > 0 ? Math.max(4, Math.round((spent / max) * BAR_AREA_HEIGHT)) : 2;
        return (
          <View key={day} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
            <View
              style={{
                width: '100%',
                height: BAR_AREA_HEIGHT,
                justifyContent: 'flex-end',
              }}
            >
              <View
                style={{
                  height,
                  borderRadius: 3,
                  backgroundColor:
                    spent === max
                      ? theme.colors.accentPurple
                      : spent > 0
                        ? theme.colors.accentPurpleBg
                        : theme.colors.bgElevated,
                }}
              />
            </View>
            <Text variant="micro" muted style={{ fontSize: 9 }}>
              {initials[index]}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function FollowUpRow({ entry }: { entry: PlayFollowUp }) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const done = entry.status === 'applied';

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
      <Icon
        name={done ? 'check' : 'dots'}
        size={12}
        color={done ? theme.colors.accentMint : theme.colors.textTertiary}
      />
      <Text
        variant="caption"
        color={done ? theme.colors.textSecondary : theme.colors.textTertiary}
        style={{ flex: 1, fontSize: 12, lineHeight: 17 }}
      >
        {entry.text}{' '}
        <Text
          variant="caption"
          color={theme.colors.textTertiary}
          style={{ fontSize: 11.5 }}
        >
          {done
            ? t('assistant.weekly.followUpDone')
            : t('assistant.weekly.followUpPending')}
        </Text>
      </Text>
    </View>
  );
}
