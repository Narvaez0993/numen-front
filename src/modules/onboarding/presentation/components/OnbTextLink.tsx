import { type ReactNode } from 'react';
import { Pressable, Text, type ViewStyle } from 'react-native';

import { useTheme } from '@/shared/presentation/theme';

type Props = {
  children: ReactNode;
  onPress: () => void;
  style?: ViewStyle;
};

export function OnbTextLink({ children, onPress, style }: Props) {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        {
          paddingVertical: 12,
          paddingHorizontal: 4,
          alignItems: 'center',
          opacity: pressed ? 0.6 : 1,
        },
        style,
      ]}
    >
      <Text
        style={{
          color: theme.colors.textSecondary,
          fontFamily: 'Geist_400Regular',
          fontSize: 13,
        }}
      >
        {children}
      </Text>
    </Pressable>
  );
}
