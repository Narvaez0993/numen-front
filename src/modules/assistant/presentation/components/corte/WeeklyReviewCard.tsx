import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Icon, Pill, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

import type { AgentOutput, PlayFollowUp } from '../../../domain/types/AgentFeed';
import { PlayAction } from './PlayAction';
import { PlayRow } from './PlayRow';

type Props = {
  review: AgentOutput;
  today: string;
  onDismiss: () => void;
};

/**
 * The coach's weekly card: the diagnosis always visible, the plan one tap away.
 * Collapsed it is a sentence and a number; expanded it is the plays you can
 * apply and what last week's plays actually became.
 */
export function WeeklyReviewCard({ review, today, onDismiss }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const weekly = review.weekly;

  if (!weekly) return null;

  const delta = weekly.deltaPct;
  const better = delta !== null && delta <= 0;
  const hasPlan = review.plays.length > 0 || weekly.accountability.length > 0;

  return (
    <View
      style={{
        backgroundColor: theme.colors.bgSurface,
        borderColor: theme.colors.borderSubtle,
        borderWidth: 1,
        borderRadius: 16,
        padding: 14,
        gap: 10,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Pill variant={review.readAt === null ? 'purple' : 'neutral'} uppercase>
          {t('assistant.weekly.pill')}
        </Pill>
        <Pressable
          accessibilityRole="button"
          onPress={onDismiss}
          hitSlop={10}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
        >
          <Icon name="x" size={14} color={theme.colors.textTertiary} />
        </Pressable>
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
        {weekly.topCategoryName ? (
          <Text
            variant="caption"
            color={theme.colors.textTertiary}
            style={{ fontSize: 12 }}
          >
            {t('assistant.weekly.topCategory', { name: weekly.topCategoryName })}
          </Text>
        ) : null}
      </View>

      {hasPlan ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => setExpanded((open) => !open)}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            alignSelf: 'flex-start',
            gap: 6,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text
            variant="label"
            color={theme.colors.accentPurple}
            style={{ fontSize: 12 }}
          >
            {expanded ? t('assistant.weekly.hidePlan') : t('assistant.weekly.seePlan')}
          </Text>
          <Icon
            name={expanded ? 'chevron-down' : 'chevron-right'}
            size={12}
            color={theme.colors.accentPurple}
          />
        </Pressable>
      ) : null}

      {expanded ? (
        <View style={{ gap: 10, paddingTop: 2 }}>
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
