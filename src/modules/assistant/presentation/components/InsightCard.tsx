import { Pressable, View } from 'react-native';

import { Icon, Pill, Text } from '@/shared/presentation/components';
import { accentColorKey, useTheme } from '@/shared/presentation/theme';

import type { AccentColor } from '@/shared/domain';

import type { ChartPoint } from '../../domain/types/Assistant';
import { MiniBarChart } from './MiniBarChart';

/** Rule-based insight shape — waiting on disk for the proactive feed slice,
 * which will hydrate it from `GET /assistant/feed` instead of a mock. */
export type Insight = {
  id: string;
  type: string;
  color: AccentColor;
  title: string;
  body: string;
  cta: string;
  chart?: ChartPoint[];
  chartHighlight?: number;
};

type Props = {
  insight: Insight;
  onCtaPress: (insight: Insight) => void;
  /** "Stop showing me this one" — optimistic, cheap to lose (it resurfaces). */
  onDismiss?: () => void;
};

export function InsightCard({ insight, onCtaPress, onDismiss }: Props) {
  const { theme } = useTheme();
  const fg = theme.colors[accentColorKey(insight.color, 'fg')];
  const bg = theme.colors[accentColorKey(insight.color, 'bg')];

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
        <Pill variant={insight.color} uppercase>
          {insight.type}
        </Pill>
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

      <View>
        <Text
          variant="label"
          style={{ fontSize: 14, letterSpacing: -0.14, marginBottom: 4 }}
        >
          {insight.title}
        </Text>
        <Text
          variant="caption"
          color={theme.colors.textSecondary}
          style={{ fontSize: 12.5, lineHeight: 18 }}
        >
          {insight.body}
        </Text>
      </View>

      {insight.chart ? (
        <View style={{ paddingTop: 4 }}>
          {/* No per-insight colour any more: the chart wears the palette's
              accent like every other one in the app. */}
          <MiniBarChart data={insight.chart} highlight={insight.chartHighlight} />
        </View>
      ) : null}

      <Pressable
        onPress={() => onCtaPress(insight)}
        style={({ pressed }) => ({
          alignSelf: 'flex-start',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          backgroundColor: bg,
          borderRadius: 10,
          paddingHorizontal: 14,
          paddingVertical: 9,
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <Text variant="label" color={fg} style={{ fontSize: 12 }}>
          {insight.cta}
        </Text>
        <Icon name="chevron-right" size={12} color={fg} />
      </Pressable>
    </View>
  );
}
