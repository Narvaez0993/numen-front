import { type ReactNode } from 'react';
import { View, type ViewStyle } from 'react-native';

import { useTheme } from '@/shared/presentation/theme';

type Props = {
  children: ReactNode;
  padding?: ViewStyle['padding'];
  paddingHorizontal?: ViewStyle['paddingHorizontal'];
  paddingTop?: ViewStyle['paddingTop'];
  paddingBottom?: ViewStyle['paddingBottom'];
};

export function OnbPage({
  children,
  padding,
  paddingHorizontal = 20,
  paddingTop = 16,
  paddingBottom = 24,
}: Props) {
  const { theme } = useTheme();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.bgBase,
        padding,
        paddingHorizontal: padding === undefined ? paddingHorizontal : undefined,
        paddingTop: padding === undefined ? paddingTop : undefined,
        paddingBottom: padding === undefined ? paddingBottom : undefined,
      }}
    >
      {children}
    </View>
  );
}
