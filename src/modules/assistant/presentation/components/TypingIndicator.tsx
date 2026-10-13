import { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';

import { useTheme } from '@/shared/presentation/theme';

function Dot({ delay, color }: { delay: number; color: string }) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 350,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [delay, opacity]);

  return (
    <Animated.View
      style={{
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: color,
        opacity,
      }}
    />
  );
}

/**
 * Three dots while the agent thinks, with no bubble around them.
 *
 * They stand where the answer will be rather than at the end of a transcript,
 * so the eye is already looking at the place the words will appear. The dots
 * take the accent because waiting is the one moment the screen has nothing else
 * to say.
 */
export function TypingIndicator() {
  const { theme } = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: 5, paddingVertical: 4 }}>
      <Dot delay={0} color={theme.palette.acc} />
      <Dot delay={180} color={theme.palette.acc} />
      <Dot delay={360} color={theme.palette.acc} />
    </View>
  );
}
