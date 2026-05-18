import { Pressable, View } from 'react-native';

import { Icon, Pill, Text } from '@/shared/presentation/components';
import { accentColorKey, useTheme } from '@/shared/presentation/theme';

import type { Insight } from '../../domain/types/Assistant';

import { MiniBarChart } from './MiniBarChart';

type Props = {
  insight: Insight;
  onCtaPress: (insight: Insight) => void;
};

export function InsightCard({ insight, onCtaPress }: Props) {
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
      <Pill variant={insight.color} uppercase>
        {insight.type}
      </Pill>

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
          <MiniBarChart
            data={insight.chart}
            highlight={insight.chartHighlight}
            color={insight.color}
          />
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
