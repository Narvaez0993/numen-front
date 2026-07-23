import { ReactNode } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';

import { AccentColor, useTheme, accentColorKey } from '../theme';

import { Text } from './Text';

export type PillVariant = AccentColor | 'neutral';

type Props = {
  children: ReactNode;
  variant?: PillVariant;
  uppercase?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Pill({ children, variant = 'neutral', uppercase = false, style }: Props) {
  const { theme } = useTheme();

  const { bg, fg } =
    variant === 'neutral'
      ? { bg: 'rgba(168,178,200,0.12)', fg: theme.colors.textSecondary }
      : {
          bg: theme.colors[accentColorKey(variant, 'bg')],
          fg: theme.colors[accentColorKey(variant, 'fg')],
        };

  return (
    <View
      style={[
        {
          backgroundColor: bg,
          borderRadius: theme.radius.pill,
          paddingHorizontal: 8,
          paddingVertical: 3,
          alignSelf: 'flex-start',
        },
        style,
      ]}
    >
      <Text
        variant="micro"
        color={fg}
        uppercase={uppercase}
        style={{
          fontSize: uppercase ? 10 : 10.5,
          letterSpacing: uppercase ? 1 : 0.2,
          fontFamily: 'Geist_500Medium',
        }}
      >
        {children}
      </Text>
    </View>
  );
}
