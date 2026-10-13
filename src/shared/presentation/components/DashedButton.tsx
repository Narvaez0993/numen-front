import { Pressable } from 'react-native';

import { useTheme } from '../theme';

import { Icon } from './Icon';
import { Text } from './Text';

type Props = {
  label: string;
  onPress: () => void;
  icon?: string;
};

/**
 * "Add one more" — the design's one shape for it.
 *
 * Dashed rather than filled because it is not a thing yet. It sits at the end of
 * every list that can grow (watched categories, accounts, cards) so the way to
 * add is always the last row rather than a `+` hiding in a corner, and it is
 * full-width so it reads as part of the list instead of a button beside it.
 */
export function DashedButton({ label, onPress, icon = 'plus' }: Props) {
  const { theme } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 9,
        minHeight: 48,
        borderRadius: 18,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: theme.colors.borderDefault,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Icon name={icon} size={16} stroke={1.9} color={theme.colors.textSecondary} />
      <Text color={theme.colors.textSecondary} style={{ fontSize: 13 }}>
        {label}
      </Text>
    </Pressable>
  );
}
