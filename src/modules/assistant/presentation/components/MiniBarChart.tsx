import { View } from 'react-native';

import { Text } from '@/shared/presentation/components';
import { accentColorKey, useTheme } from '@/shared/presentation/theme';

import type { AccentColor } from '@/shared/domain';

import type { ChartPoint } from '../../domain/types/Assistant';

type Props = {
  data: ChartPoint[];
  highlight?: number;
  color?: AccentColor;
};

const CHART_H = 40;
const LABEL_H = 12;

export function MiniBarChart({ data, highlight, color = 'purple' }: Props) {
  const { theme } = useTheme();
  const max = Math.max(...data.map((d) => d.v));
  const highlightFg = theme.colors[accentColorKey(color, 'fg')];

  return (
    <View style={{ flexDirection: 'row', gap: 5, width: '100%' }}>
      {data.map((d, i) => {
        const barH = Math.max(4, (d.v / max) * CHART_H);
        const hi = i === highlight;
        return (
          <View
            key={`${d.label}-${i}`}
            style={{
              flex: 1,
              minWidth: 0,
              alignItems: 'center',
            }}
          >
            <View
              style={{
                width: '100%',
                height: CHART_H,
                justifyContent: 'flex-end',
              }}
            >
              <View
                style={{
                  width: '100%',
                  height: barH,
                  backgroundColor: hi ? highlightFg : theme.colors.bgElevated,
                  borderRadius: 3,
                }}
              />
            </View>
            <Text
              variant="micro"
              uppercase
              color={hi ? highlightFg : theme.colors.textTertiary}
              style={{
                fontSize: 9.5,
                fontWeight: hi ? '500' : '400',
                letterSpacing: 0.5,
                marginTop: 4,
                lineHeight: LABEL_H,
                height: LABEL_H,
              }}
            >
              {d.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
