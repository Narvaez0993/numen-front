import { Pressable } from 'react-native';

import { useTheme } from '../theme';

import { Icon } from './Icon';

type Props = {
  onPress?: () => void;
  bottomOffset?: number;
};

export function FAB({ onPress, bottomOffset = 86 }: Props) {
  const { theme, mode } = useTheme();
  const iconColor = mode === 'dark' ? theme.colors.bgBase : theme.colors.bgBase;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        position: 'absolute',
        right: 18,
        bottom: bottomOffset,
        width: 58,
        height: 58,
        borderRadius: 29,
        backgroundColor: theme.colors.accentCoral,
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ scale: pressed ? 0.94 : 1 }],
        // shadow only in light mode (per design spec)
        ...(mode === 'light'
          ? {
              shadowColor: theme.colors.accentCoral,
              shadowOpacity: 0.3,
              shadowOffset: { width: 0, height: 4 },
              shadowRadius: 16,
              elevation: 8,
            }
          : {}),
      })}
    >
      <Icon name="plus" size={26} stroke={2.2} color={iconColor} />
    </Pressable>
  );
}
