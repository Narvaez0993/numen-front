import { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';

import { Icon, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

type Props = {
  label: string;
};

export function RegisteredPill({ label }: Props) {
  const { theme } = useTheme();
  const scale = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 1.05,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scale]);

  return (
    <View style={{ alignItems: 'center' }}>
      <Animated.View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 5,
          paddingHorizontal: 12,
          paddingVertical: 5,
          borderRadius: 100,
          backgroundColor: theme.colors.accentMintBg,
          borderWidth: 1,
          borderColor: 'rgba(0, 229, 168, 0.25)',
          transform: [{ scale }],
        }}
      >
        <Icon name="check" size={12} stroke={2.4} color={theme.colors.accentMint} />
        <Text
          variant="micro"
          color={theme.colors.accentMint}
          style={{ letterSpacing: 0.88, textTransform: 'uppercase' }}
        >
          {label}
        </Text>
      </Animated.View>
    </View>
  );
}
