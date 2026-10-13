import { Animated, View } from 'react-native';

import { useTheme } from '@/shared/presentation/theme';
import { withAlpha } from '@/shared/presentation/theme/tokens';

type Props = {
  count: number;
  index: number;
  /** 0..1 of the CURRENT segment — the player owns and animates it. */
  progress: Animated.Value;
};

/** The segments on top: done ones full, future ones empty, the live one fed
 * by the player's clock. Width animation, so `useNativeDriver` stays off. */
export function StoryProgressBar({ count, index, progress }: Props) {
  const { theme } = useTheme();
  const track = withAlpha(theme.colors.textPrimary, 0.22);

  return (
    <View style={{ flexDirection: 'row', gap: 4 }}>
      {Array.from({ length: count }, (_, i) => (
        <View
          key={i}
          style={{
            flex: 1,
            height: 2.5,
            borderRadius: 2,
            backgroundColor: track,
            overflow: 'hidden',
          }}
        >
          {i < index ? (
            <View style={{ flex: 1, backgroundColor: theme.colors.textPrimary }} />
          ) : i === index ? (
            <Animated.View
              style={{
                height: '100%',
                backgroundColor: theme.colors.textPrimary,
                width: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              }}
            />
          ) : null}
        </View>
      ))}
    </View>
  );
}
