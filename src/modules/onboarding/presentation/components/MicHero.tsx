import { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, Easing, Pressable, View } from 'react-native';

import { Icon } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

export type MicState = 'idle' | 'recording' | 'processing';

type Props = {
  state: MicState;
  onPress: () => void;
};

const RING_DEFS = [
  { size: 220, baseOpacity: 0.15, delayMs: 0 },
  { size: 180, baseOpacity: 0.22, delayMs: 180 },
  { size: 140, baseOpacity: 0.35, delayMs: 360 },
];

export function MicHero({ state, onPress }: Props) {
  const { theme } = useTheme();
  const recording = state === 'recording';
  const processing = state === 'processing';

  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.spring(scale, {
      toValue: recording ? 0.96 : 1,
      useNativeDriver: true,
      friction: 5,
    }).start();
  }, [recording, scale]);

  return (
    <View
      style={{
        width: 220,
        height: 220,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {RING_DEFS.map((def) => (
        <MicRing
          key={def.size}
          size={def.size}
          baseOpacity={def.baseOpacity}
          delayMs={def.delayMs}
          pulsing={recording}
          color={theme.colors.accentCoral}
        />
      ))}
      <Animated.View style={{ transform: [{ scale }] }}>
        <Pressable
          onPress={processing ? undefined : onPress}
          disabled={processing}
          accessibilityRole="button"
          accessibilityLabel="Mic"
          style={{
            width: 110,
            height: 110,
            borderRadius: 55,
            backgroundColor: theme.colors.accentCoral,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {processing ? (
            <ActivityIndicator size="large" color="#0A0E1A" />
          ) : (
            <Icon name="microphone" size={44} stroke={1.6} color="#0A0E1A" />
          )}
        </Pressable>
      </Animated.View>
    </View>
  );
}

type RingProps = {
  size: number;
  baseOpacity: number;
  delayMs: number;
  pulsing: boolean;
  color: string;
};

function MicRing({ size, baseOpacity, delayMs, pulsing, color }: RingProps) {
  const animatedScale = useRef(new Animated.Value(1)).current;
  const animatedOpacity = useRef(new Animated.Value(baseOpacity)).current;

  useEffect(() => {
    if (!pulsing) {
      animatedScale.setValue(1);
      animatedOpacity.setValue(baseOpacity);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delayMs),
        Animated.parallel([
          Animated.timing(animatedScale, {
            toValue: 1.05,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(animatedOpacity, {
            toValue: 0,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(animatedScale, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(animatedOpacity, {
            toValue: baseOpacity,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulsing, delayMs, baseOpacity, animatedScale, animatedOpacity]);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 1,
        borderColor: color,
        opacity: animatedOpacity,
        transform: [{ scale: animatedScale }],
      }}
    />
  );
}
