import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, ScrollView, View } from 'react-native';

import { BottomSheet, Icon, Pill, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { monthName } from '@/shared/presentation/utils/dates';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

import { useAgentFeed } from '../../hooks/useAgentFeed';
import { useDismissCorte } from '../../hooks/useCorteMutations';
import { useDismissInsight } from '../../hooks/useFeedMutations';
import { presentInsight, type PresentedInsight } from '../../utils/insightPresenter';
import { InsightCard } from '../InsightCard';

type Props = { today: string };

const CHIP_WIDTH = 172;
const CHIP_HEIGHT = 76;

/**
 * The agent's deliveries, docked OUTSIDE the conversation's scroll. The chat
 * is an infinite stream and the Corte, the weekly review and the insights are
 * artifacts — inside the stream they were three screens up after twenty
 * messages. Here they stay one tap away no matter how long the conversation
 * grows, and with nothing to show the shelf costs zero pixels.
 *
 * Self-contained like the old feed section: its own query, and on loading or
 * error it renders nothing — the shelf must never block the chat.
 *
 * Tap opens (player for a Corte, sheet for the rest); long-press removes from
 * the shelf — same dismissal as always, the archive keeps everything.
 */
export function AgentShelf({ today }: Props) {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const feed = useAgentFeed(today);
  const dismissOutput = useDismissCorte();
  const dismissInsight = useDismissInsight();
  const [openInsight, setOpenInsight] = useState<PresentedInsight | null>(null);

  const outputs = feed.data?.outputs ?? [];
  const cortes = outputs.filter((o) => o.kind === 'monthly_summary');
  const reviews = outputs.filter((o) => o.kind === 'weekly_review');
  const insights = feed.data?.insights ?? [];
  if (outputs.length === 0 && insights.length === 0) return null;

  const confirmRemove = (onRemove: () => void) => {
    Alert.alert(t('assistant.shelf.removeTitle'), undefined, [
      { text: t('assistant.shelf.removeCancel'), style: 'cancel' },
      { text: t('assistant.shelf.remove'), style: 'destructive', onPress: onRemove },
    ]);
  };

  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
      >
        {cortes.map((corte) => {
          const unread = corte.readAt === null;
          return (
            <ShelfChip
              key={corte.id}
              accent={unread ? theme.colors.accentMint : undefined}
              onPress={() => router.push(`/corte/${corte.id}`)}
              onLongPress={() => confirmRemove(() => dismissOutput.mutate(corte.id))}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Pill variant={unread ? 'mint' : 'neutral'} uppercase>
                  {unread ? t('assistant.corte.pillNew') : t('assistant.corte.pillSeen')}
                </Pill>
                <Icon name="sparkles" size={13} color={theme.colors.accentMint} />
              </View>
              <Text variant="label" numberOfLines={1} style={{ fontSize: 13.5 }}>
                {t('assistant.shelf.corte', {
                  month: monthName(`${corte.period}-01`, i18n.language),
                })}
              </Text>
            </ShelfChip>
          );
        })}

        {reviews.map((review) => {
          const unread = review.readAt === null;
          return (
            <ShelfChip
              key={review.id}
              accent={unread ? theme.colors.accentPurple : undefined}
              onPress={() => router.push(`/weekly/${review.id}`)}
              onLongPress={() => confirmRemove(() => dismissOutput.mutate(review.id))}
            >
              <View style={{ flexDirection: 'row' }}>
                <Pill variant={unread ? 'purple' : 'neutral'} uppercase>
                  {t('assistant.shelf.weeklyPill')}
                </Pill>
              </View>
              {review.weekly ? (
                <Text variant="label" tabular numberOfLines={1} style={{ fontSize: 15 }}>
                  {formatMoney(review.weekly.weekTotal)}
                </Text>
              ) : (
                <Text variant="label" numberOfLines={1} style={{ fontSize: 13.5 }}>
                  {t('assistant.shelf.weekly')}
                </Text>
              )}
            </ShelfChip>
          );
        })}

        {insights.map((insight) => {
          const card = presentInsight(insight, t, today);
          return (
            <ShelfChip
              key={card.key}
              onPress={() => setOpenInsight(card)}
              onLongPress={() => confirmRemove(() => dismissInsight.mutate(card.key))}
            >
              <View style={{ flexDirection: 'row' }}>
                <Pill variant={card.color} uppercase>
                  {card.pill}
                </Pill>
              </View>
              <Text
                variant="caption"
                color={theme.colors.textSecondary}
                numberOfLines={2}
                style={{ fontSize: 11.5, lineHeight: 15 }}
              >
                {card.title}
              </Text>
            </ShelfChip>
          );
        })}
      </ScrollView>

      <BottomSheet
        visible={openInsight !== null}
        onClose={() => setOpenInsight(null)}
        maxHeight="60%"
      >
        {openInsight ? (
          <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 26 }}>
            <InsightCard
              insight={{
                id: openInsight.key,
                type: openInsight.pill,
                color: openInsight.color,
                title: openInsight.title,
                body: openInsight.body,
                cta: openInsight.cta,
              }}
              onCtaPress={() => {
                setOpenInsight(null);
                router.push(openInsight.route);
              }}
              onDismiss={() => {
                dismissInsight.mutate(openInsight.key);
                setOpenInsight(null);
              }}
            />
          </View>
        ) : null}
      </BottomSheet>
    </View>
  );
}

function ShelfChip({
  accent,
  onPress,
  onLongPress,
  children,
}: {
  /** Border colour while the item demands attention; resting chips stay subtle. */
  accent?: string;
  onPress: () => void;
  onLongPress: () => void;
  children: React.ReactNode;
}) {
  const { theme } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => ({
        width: CHIP_WIDTH,
        height: CHIP_HEIGHT,
        padding: 12,
        borderRadius: 14,
        backgroundColor: theme.colors.bgSurface,
        borderWidth: 1,
        borderColor: accent ?? theme.colors.borderSubtle,
        justifyContent: 'space-between',
        opacity: pressed ? 0.9 : 1,
      })}
    >
      {children}
    </Pressable>
  );
}
