import { ReactNode } from 'react';
import { Pressable, StyleProp, View, ViewStyle } from 'react-native';

import { useTheme } from '../theme';

type Level = 1 | 2 | 3;

type Props = {
  children: ReactNode;
  level?: Level;
  padding?: number;
  radius?: number;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function Card({
  children,
  level = 1,
  padding = 16,
  radius,
  onPress,
  style,
}: Props) {
  const { theme } = useTheme();

  const bg =
    level === 1
      ? theme.colors.bgSurface
      : level === 2
        ? theme.colors.bgFloat
        : theme.colors.bgElevated;

  const borderColor =
    level === 1 ? theme.colors.borderSubtle : theme.colors.borderDefault;
  const cardRadius = radius ?? (level === 1 ? theme.radius.card : theme.radius.lg);

  const baseStyle: ViewStyle = {
    backgroundColor: bg,
    borderColor,
    borderWidth: 1,
    borderRadius: cardRadius,
    padding,
  };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [baseStyle, { opacity: pressed ? 0.85 : 1 }, style]}
      >
        {children}
      </Pressable>
    );
  }
  return <View style={[baseStyle, style]}>{children}</View>;
}
