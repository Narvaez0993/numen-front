import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { useTheme } from '@/shared/presentation/theme';
import { withAlpha } from '@/shared/presentation/theme/tokens';

/** One pass of the highlight. Slow enough to read as "working", not as a spinner. */
const SWEEP_MS = 1150;
/** How wide the highlight is relative to the card. */
const SWEEP_WIDTH = 0.55;

/**
 * The shape of the card that is coming, while the agent works out what goes in it.
 *
 * A line of text saying "un segundo" tells you something is happening; this
 * shows you WHAT is happening, because it is the silhouette of the answer. When
 * the capture already has cards it is appended to the list, so the outline
 * appears in the exact place the new one will land and nothing jumps when it
 * does.
 *
 * The sweep is a transform on the UI thread, never a layout: animating width or
 * position would ask React to re-render every frame, and an SVG gradient inside
 * it would never re-measure.
 */
export function SkeletonCard() {
  const { theme } = useTheme();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: SWEEP_MS, easing: Easing.inOut(Easing.quad) }),
      -1,
      false,
    );
  }, [progress]);

  const sweep = useAnimatedStyle(() => ({
    // From fully off the left edge to fully off the right one.
    transform: [{ translateX: `${-100 + progress.value * (100 / SWEEP_WIDTH)}%` }],
  }));

  const bone = withAlpha(theme.colors.textPrimary, 0.09);

  return (
    <View
      style={{
        padding: 15,
        paddingHorizontal: 16,
        borderRadius: 22,
        backgroundColor: theme.colors.bgFloat,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          marginBottom: 12,
          height: 32,
        }}
      >
        <View style={{ flex: 1, height: 15, borderRadius: 7, backgroundColor: bone }} />
        <View style={{ width: 74, height: 15, borderRadius: 7, backgroundColor: bone }} />
      </View>
      <View style={{ flexDirection: 'row', gap: 7 }}>
        {[92, 78, 58].map((width) => (
          <View
            key={width}
            style={{ width, height: 34, borderRadius: 12, backgroundColor: bone }}
          />
        ))}
      </View>

      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            width: `${SWEEP_WIDTH * 100}%`,
          },
          sweep,
        ]}
      >
        <Svg width="100%" height="100%">
          <Defs>
            <LinearGradient id="skeletonSweep" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor={theme.palette.acc} stopOpacity={0} />
              <Stop offset="0.5" stopColor={theme.palette.acc} stopOpacity={0.16} />
              <Stop offset="1" stopColor={theme.palette.acc} stopOpacity={0} />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#skeletonSweep)" />
        </Svg>
      </Animated.View>
    </View>
  );
}
