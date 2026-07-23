import { ReactNode } from 'react';
import { Pressable, StyleProp, ViewStyle } from 'react-native';

import { useTheme } from '../theme';

import { Icon, IconName } from './Icon';
import { Text } from './Text';

type Props = {
  children: ReactNode;
  active?: boolean;
  onPress?: () => void;
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
};

export function Chip({ children, active = false, onPress, icon, style }: Props) {
  const { theme } = useTheme();
  const bg = active ? theme.colors.accentMintBg : theme.colors.bgFloat;
  const fg = active ? theme.colors.accentMint : theme.colors.textSecondary;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          backgroundColor: bg,
          borderColor: active ? 'transparent' : theme.colors.borderSubtle,
          borderWidth: 1,
          borderRadius: theme.radius.md,
          paddingHorizontal: 12,
          paddingVertical: 7,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          opacity: pressed ? 0.85 : 1,
          alignSelf: 'flex-start',
        },
        style,
      ]}
    >
      {icon ? <Icon name={icon} size={13} color={fg} /> : null}
      <Text variant="label" color={fg} style={{ fontSize: 12 }}>
        {children}
      </Text>
    </Pressable>
  );
}
