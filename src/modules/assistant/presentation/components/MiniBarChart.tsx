import { View } from 'react-native';

import { Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { withAlpha } from '@/shared/presentation/theme/tokens';

import type { ChartPoint } from '../../domain/types/Assistant';

type Props = {
  data: ChartPoint[];
  highlight?: number;
};

const CHART_H = 42;
const LABEL_H = 12;

/**
 * Four bars, and only one of them is coloured.
 *
 * The bar that matters is the one the answer is about — usually now. The others
 * are there to give it a shape to stand against, so they stay a neutral tint;
 * colouring all four would make the reader compare everything to everything.
 * Without an explicit `highlight` the last bar is the one, because that is the
 * one you are living in.
 */
export function MiniBarChart({ data, highlight }: Props) {
  const { theme } = useTheme();
  const max = Math.max(...data.map((d) => d.v));

  return (
    <View style={{ flexDirection: 'row', gap: 5, width: '100%' }}>
      {data.map((d, i) => {
        const barH = Math.max(4, (d.v / max) * CHART_H);
        const hi = i === (highlight ?? data.length - 1);
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
                  backgroundColor: hi
                    ? theme.palette.acc
                    : withAlpha(theme.colors.textPrimary, 0.14),
                  borderRadius: 4,
                }}
              />
            </View>
            <Text
              variant="micro"
              uppercase
              color={hi ? theme.palette.acc2 : theme.colors.textTertiary}
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
