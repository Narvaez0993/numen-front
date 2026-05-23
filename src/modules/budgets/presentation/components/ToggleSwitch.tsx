import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, View } from 'react-native';

import { useTheme } from '@/shared/presentation/theme';

type Props = {
  value: boolean;
  onChange: (value: boolean) => void;
};

export function ToggleSwitch({ value, onChange }: Props) {
  const { theme } = useTheme();
  const offset = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(offset, {
      toValue: value ? 1 : 0,
      duration: 200,
      easing: Easing.bezier(0.32, 0.72, 0, 1),
      useNativeDriver: true,
    }).start();
  }, [value, offset]);

  const translateX = offset.interpolate({ inputRange: [0, 1], outputRange: [0, 16] });

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      onPress={() => onChange(!value)}
      style={{
        width: 40,
        height: 24,
        borderRadius: 100,
        backgroundColor: value ? theme.colors.accentMint : theme.colors.bgElevated,
        padding: 2,
        justifyContent: 'center',
      }}
    >
      <Animated.View
        style={{
          width: 20,
          height: 20,
          borderRadius: 10,
          backgroundColor: '#FFFFFF',
          transform: [{ translateX }],
          shadowColor: '#000',
          shadowOpacity: 0.2,
          shadowOffset: { width: 0, height: 1 },
          shadowRadius: 3,
          elevation: 2,
        }}
      />
      <View />
    </Pressable>
  );
}
