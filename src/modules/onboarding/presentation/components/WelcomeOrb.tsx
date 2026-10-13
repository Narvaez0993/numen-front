import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { Orb } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { withAlpha } from '@/shared/presentation/theme/tokens';

const ORB = 112;
const RING = 150;
/** The bundle's `ringOut`: one ring every 1.2s, each growing to twice its size
 *  and gone by the end of its 3.6s. */
const RING_MS = 3600;
const RING_GAP_MS = 1200;
/** The bundle's `orbBreath`: in and out, 3.4s for the whole breath. */
const BREATH_MS = 1700;

/**
 * The welcome's orb: the app's glass sphere, breathing, with rings leaving it
 * the way sound leaves a speaker. It is the same object as the button that
 * records a movement, met here first — the thing you will be talking to.
 */
export function WelcomeOrb() {
  const reduceMotion = useReducedMotion();
  const breath = useSharedValue(1);
  const ring0 = useSharedValue(0);
  const ring1 = useSharedValue(0);
  const ring2 = useSharedValue(0);
  const rings = [ring0, ring1, ring2];

  useEffect(() => {
    if (reduceMotion) return;
    breath.value = withRepeat(
      withTiming(1.045, { duration: BREATH_MS, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
    [ring0, ring1, ring2].forEach((ring, index) => {
      ring.value = withDelay(
        index * RING_GAP_MS,
        withRepeat(
          withTiming(1, { duration: RING_MS, easing: Easing.out(Easing.ease) }),
          -1,
        ),
      );
    });
  }, [reduceMotion, breath, ring0, ring1, ring2]);

  const orbStyle = useAnimatedStyle(() => ({ transform: [{ scale: breath.value }] }));

  return (
    <View
      style={{ height: RING, alignItems: 'center', justifyContent: 'center' }}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {reduceMotion
        ? null
        : rings.map((ring, index) => <Ring key={index} progress={ring} />)}
      <Animated.View style={orbStyle}>
        <Orb size={ORB} />
      </Animated.View>
    </View>
  );
}

function Ring({ progress }: { progress: SharedValue<number> }) {
  const { theme } = useTheme();
  const style = useAnimatedStyle(() => ({
    opacity: 0.45 * (1 - progress.value),
    transform: [{ scale: 1 + progress.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: RING,
          height: RING,
          borderRadius: RING / 2,
          borderWidth: 1,
          borderColor: withAlpha(theme.palette.orb2, 0.3),
        },
        style,
      ]}
    />
  );
}
