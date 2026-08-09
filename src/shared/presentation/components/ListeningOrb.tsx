import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  type SharedValue,
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { withAlpha } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';

import { Orb } from './Orb';

/** How far a ring travels before it dies. Beyond this it reads as a splash. */
const RING_REACH = 0.85;
/** Three is the fewest that reads as continuous; more turns into a target. */
const RINGS = [0, 1, 2];
const RING_MS = 2200;
/** The orb never stops moving while the mic is open, even in silence — a still
 *  orb is indistinguishable from an app that did not start. */
const BREATH_MS = 2600;

type Props = {
  size: number;
  /** 0..1 from the recognizer. Silence is 0, ordinary speech lands mid-range. */
  level: number;
  /** The mic is open. `false` during warm-up: nothing should invite speech yet. */
  listening: boolean;
  children?: React.ReactNode;
};

/**
 * The orb, while it is hearing you.
 *
 * Tapping the mic used to change nothing on screen, so there was no way to tell
 * a mic that was open from one that had failed — and no way to know when to
 * start talking. People spoke into the warm-up and lost their first words.
 *
 * Two signals, doing two different jobs:
 *
 * - **Rings** say the app is ON. They run on their own clock so silence still
 *   looks alive, and they only start once the recognizer has actually opened the
 *   mic — a ring during warm-up would be a lie inviting you to speak early.
 * - **The orb's size** says the app is hearing YOU. It follows input volume, and
 *   that is the part that reads as intelligence rather than decoration: a
 *   heartbeat proves a timer is running, but reacting to a voice proves a
 *   microphone is.
 *
 * Everything animates transform and opacity only, so it all lives on the UI
 * thread and never asks React to re-render at 60fps.
 */
export function ListeningOrb({ size, level, listening, children }: Props) {
  const { theme } = useTheme();
  const wave = useSharedValue(0);
  const breath = useSharedValue(0);
  const voice = useSharedValue(0);

  useEffect(() => {
    if (!listening) {
      cancelAnimation(wave);
      cancelAnimation(breath);
      wave.value = 0;
      breath.value = 0;
      return;
    }
    wave.value = withRepeat(
      withTiming(1, { duration: RING_MS, easing: Easing.out(Easing.quad) }),
      -1,
      false,
    );
    breath.value = withRepeat(
      withSequence(
        withTiming(1, { duration: BREATH_MS / 2, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: BREATH_MS / 2, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false,
    );
  }, [listening, wave, breath]);

  useEffect(() => {
    // Volume arrives every 100ms; easing between samples is what turns a series
    // of steps into something that looks like it is following a voice.
    voice.value = withTiming(listening ? level : 0, { duration: 110 });
  }, [level, listening, voice]);

  const orbStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale:
          1 +
          // The breath is small enough to read as "alive"; the voice is what
          // actually moves it.
          interpolate(breath.value, [0, 1], [0, 0.035]) +
          interpolate(voice.value, [0, 1], [0, 0.14]),
      },
    ],
  }));

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {RINGS.map((index) => (
        <Ring
          key={index}
          size={size}
          wave={wave}
          voice={voice}
          offset={index / RINGS.length}
          color={theme.palette.acc}
        />
      ))}
      <Animated.View style={orbStyle}>
        <Orb size={size}>{children}</Orb>
      </Animated.View>
    </View>
  );
}

function Ring({
  size,
  wave,
  voice,
  offset,
  color,
}: {
  size: number;
  wave: SharedValue<number>;
  voice: SharedValue<number>;
  offset: number;
  color: string;
}) {
  const style = useAnimatedStyle(() => {
    // Each ring reads the same clock a third of a cycle apart, so one shared
    // animation drives all three and they can never drift out of step.
    const progress = (wave.value + offset) % 1;
    return {
      // A louder voice throws the rings further out, so they carry the volume
      // too rather than looping regardless of what is being said.
      transform: [
        {
          scale: 1 + progress * (RING_REACH + interpolate(voice.value, [0, 1], [0, 0.5])),
        },
      ],
      opacity: interpolate(progress, [0, 0.12, 1], [0, 0.42, 0]),
    };
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 1.5,
          borderColor: withAlpha(color, 0.8),
        },
        style,
      ]}
    />
  );
}
