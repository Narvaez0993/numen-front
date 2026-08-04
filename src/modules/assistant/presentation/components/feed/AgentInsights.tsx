import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useAgentFeed } from '../../hooks/useAgentFeed';
import { useDismissInsight } from '../../hooks/useFeedMutations';
import { presentInsight } from '../../utils/insightPresenter';
import { InsightCard } from '../InsightCard';

type Props = { today: string };

/**
 * What the agent noticed and you can act on today: a cap running hot, too many
 * uncategorized movements. Rule-based, computed on read, dismissible.
 *
 * They live in Home because their CTAs navigate INTO the app (budgets,
 * movements) — they are "what needs you", which is Home's whole question. In
 * the chat they were an interruption above the conversation.
 *
 * `upcoming_charge` is filtered out here: Home already shows the week's charges
 * with confirm/skip in place, which is strictly more than an insight can do.
 *
 * Self-contained: its own query, and on loading or error it renders nothing —
 * a missing insight is not worth an error state on the entry screen.
 */
export function AgentInsights({ today }: Props) {
  const { t } = useTranslation();
  const feed = useAgentFeed(today);
  const dismiss = useDismissInsight();

  const insights = (feed.data?.insights ?? []).filter(
    (insight) => insight.kind !== 'upcoming_charge',
  );
  if (insights.length === 0) return null;

  return (
    <View style={{ gap: 10 }}>
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
