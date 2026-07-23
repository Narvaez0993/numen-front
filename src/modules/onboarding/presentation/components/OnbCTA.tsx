import { type ReactNode } from 'react';
import { Pressable, Text, type ViewStyle } from 'react-native';

import { useTheme } from '@/shared/presentation/theme';

type Props = {
  children: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
};

export function OnbCTA({ children, onPress, disabled = false, style }: Props) {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [
        {
          width: '100%',
          backgroundColor: theme.colors.accentMint,
          borderRadius: 14,
          paddingVertical: 15,
          paddingHorizontal: 18,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled ? 0.35 : pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.985 : 1 }],
        },
        style,
      ]}
    >
      <Text
        style={{
          color: '#0A0E1A',
          fontFamily: 'Geist_500Medium',
          fontSize: 15,
        }}
      >
        {children}
      </Text>
    </Pressable>
  );
}
