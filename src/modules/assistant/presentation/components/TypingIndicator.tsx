import { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';

import { useTheme } from '@/shared/presentation/theme';

import { AssistantBubble } from './AssistantBubble';

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
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: color,
        opacity,
      }}
    />
  );
}

export function TypingIndicator() {
  const { theme } = useTheme();
  return (
    <AssistantBubble>
      <View style={{ flexDirection: 'row', gap: 4, paddingVertical: 4 }}>
        <Dot delay={0} color={theme.colors.textTertiary} />
        <Dot delay={180} color={theme.colors.textTertiary} />
        <Dot delay={360} color={theme.colors.textTertiary} />
      </View>
    </AssistantBubble>
  );
}
