import { Pressable } from 'react-native';

import { useTheme } from '../theme';

import { Icon } from './Icon';

export type FabVariant = 'coral' | 'pink';

type Props = {
  onPress?: () => void;
  bottomOffset?: number;
  variant?: FabVariant;
};

export function FAB({ onPress, bottomOffset = 86, variant = 'coral' }: Props) {
  const { theme, mode } = useTheme();
  const iconColor = theme.colors.bgBase;
  const bg = variant === 'pink' ? theme.colors.accentPink : theme.colors.accentCoral;

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
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ scale: pressed ? 0.94 : 1 }],
        // shadow only in light mode (per design spec)
        ...(mode === 'light'
          ? {
              shadowColor: bg,
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
