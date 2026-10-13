import { useEffect } from 'react';
import type { ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

/** The bundle's own keyframe:
 *
 *    @keyframes riseIn { from { opacity:0; transform:translateY(10px) }
 *                        to   { opacity:1; transform:translateY(0) } }
 *
 * It uses it at .18s for the capture menu, .22s for a card added late and .24s
 * for the block of results. Those are the three durations offered here. */
const RISE_PX = 10;

type Props = {
  children: React.ReactNode;
  /** Milliseconds — 180, 220 and 240 are the bundle's three. */
  duration?: number;
  delay?: number;
  style?: ViewStyle;
};

/**
 * Content that arrives instead of appearing.
 *
 * Ten pixels and a fifth of a second, which sounds like decoration and is not:
 * the difference between a result that blinks into existence and one that lands
 * is the difference between wondering whether the app did something and having
 * watched it happen. The design specifies it on exactly the moments where
 * something the user is waiting for shows up.
 */
export function RiseIn({ children, duration = 240, delay = 0, style }: Props) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withTiming(1, { duration, easing: Easing.out(Easing.quad) }),
    );
  }, [progress, duration, delay]);

  const animated = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * RISE_PX }],
  }));

  return <Animated.View style={[style, animated]}>{children}</Animated.View>;
}
