import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { SectionLabel } from '@/shared/presentation/components';

import { useAgentFeed } from '../../hooks/useAgentFeed';
import { useDismissInsight } from '../../hooks/useFeedMutations';
import { presentInsight } from '../../utils/insightPresenter';
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
  const { t } = useTranslation();
  const feed = useAgentFeed(today);
  const dismiss = useDismissInsight();

  if (!feed.data || feed.data.insights.length === 0) {
    return null;
  }

  return (
    <View style={{ gap: 10 }}>
      <SectionLabel>{t('assistant.thisWeek')}</SectionLabel>
      {feed.data.insights.map((insight) => {
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
