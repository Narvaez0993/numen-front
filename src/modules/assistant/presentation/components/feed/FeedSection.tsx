import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Icon, SectionLabel, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

import { useAgentFeed } from '../../hooks/useAgentFeed';
import { useDismissCorte } from '../../hooks/useCorteMutations';
import { useDismissInsight } from '../../hooks/useFeedMutations';
import { presentInsight } from '../../utils/insightPresenter';
import { CorteEntryCard } from '../corte/CorteEntryCard';
import { WeeklyReviewCard } from '../corte/WeeklyReviewCard';
import { InsightCard } from '../InsightCard';

type Props = {
  today: string;
};

/**
 * What the agent noticed, above the conversation. Deliberately self-contained:
 * its own query, and on loading or error it renders nothing — the feed must
 * never block the chat, and a missing insight is not worth an error state.
 */
export function FeedSection({ today }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const feed = useAgentFeed(today);
  const dismiss = useDismissInsight();
  const dismissCorte = useDismissCorte();

  const outputs = feed.data?.outputs ?? [];
  const cortes = outputs.filter((o) => o.kind === 'monthly_summary');
  const reviews = outputs.filter((o) => o.kind === 'weekly_review');
  const insights = feed.data?.insights ?? [];
  if (outputs.length === 0 && insights.length === 0) {
    return null;
  }

  return (
    <View style={{ gap: 10 }}>
      <SectionLabel>{t('assistant.thisWeek')}</SectionLabel>

      {cortes.map((corte) => (
        <View key={corte.id} style={{ gap: 6 }}>
          <CorteEntryCard
            corte={corte}
            onOpen={() => router.push(`/corte/${corte.id}`)}
            onDismiss={() => dismissCorte.mutate(corte.id)}
          />
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/cortes')}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              alignSelf: 'flex-end',
              gap: 4,
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <Text
              variant="caption"
              color={theme.colors.textTertiary}
              style={{ fontSize: 12 }}
            >
              {t('assistant.corte.shelfTitle')}
            </Text>
            <Icon name="chevron-right" size={11} color={theme.colors.textTertiary} />
          </Pressable>
        </View>
      ))}

      {reviews.map((review) => (
        <WeeklyReviewCard
          key={review.id}
          review={review}
          today={today}
          onDismiss={() => dismissCorte.mutate(review.id)}
        />
      ))}

      {insights.map((insight) => {
        const card = presentInsight(insight, t, today);
        return (
          <InsightCard
            key={card.key}
            insight={{
              id: card.key,
              type: card.pill,
              color: card.color,
              title: card.title,
              body: card.body,
              cta: card.cta,
            }}
            onCtaPress={() => router.push(card.route)}
            onDismiss={() => dismiss.mutate(card.key)}
          />
        );
      })}
    </View>
  );
}
