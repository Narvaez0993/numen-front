import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, View } from 'react-native';

import { Icon } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

type Props = {
  state: 'entry' | 'recording' | 'processing';
  onPress: () => void;
};

const WAVE_BARS = [0, 1, 2, 3, 4, 5, 6, 7, 8];

export function RecordingMic({ state, onPress }: Props) {
  const { theme } = useTheme();
  const pulse = useRef(new Animated.Value(0)).current;
  const spin = useRef(new Animated.Value(0)).current;

  // Pulsing ring while recording
  useEffect(() => {
    if (state !== 'recording') {
      pulse.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.timing(pulse, {
        toValue: 1,
        duration: 1400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [state, pulse]);

  // Spinner while processing
  useEffect(() => {
    if (state !== 'processing') {
      spin.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [state, spin]);

  const pulseScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.5] });
  const pulseOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0] });
  const spinRotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      {state === 'recording' ? (
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            width: 96,
            height: 96,
            borderRadius: 48,
            backgroundColor: theme.colors.accentCoral,
            transform: [{ scale: pulseScale }],
            opacity: pulseOpacity,
          }}
        />
      ) : null}
      <Pressable
        onPress={onPress}
        disabled={state === 'processing'}
        style={({ pressed }) => ({
          width: 96,
          height: 96,
          borderRadius: 48,
          backgroundColor: theme.colors.accentCoral,
          alignItems: 'center',
          justifyContent: 'center',
          transform: [{ scale: pressed ? 0.96 : 1 }],
        })}
      >
        {state === 'processing' ? (
          <Animated.View
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              borderWidth: 3,
              borderColor: 'rgba(10,14,26,0.3)',
              borderTopColor: theme.colors.bgBase,
              transform: [{ rotate: spinRotate }],
            }}
          />
        ) : (
          <Icon name="microphone" size={36} color={theme.colors.bgBase} stroke={1.8} />
        )}
      </Pressable>
    </View>
  );
}

export function WaveVisualizer() {
  const { theme } = useTheme();
  const values = useRef(WAVE_BARS.map(() => new Animated.Value(0.35))).current;

  useEffect(() => {
    const loops = values.map((v, i) => {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.delay(i * 80),
          Animated.timing(v, {
            toValue: 1,
            duration: 450,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(v, {
            toValue: 0.35,
            duration: 450,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      );
      animation.start();
      return animation;
    });
    return () => loops.forEach((l) => l.stop());
  }, [values]);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', height: 22, gap: 4 }}>
      {values.map((v, i) => (
        <Animated.View
          key={i}
          style={{
            width: 3,
            height: '100%',
            borderRadius: 2,
            backgroundColor: theme.colors.accentCoral,
            transform: [{ scaleY: v }],
          }}
        />
      ))}
    </View>
  );
}
