import { Pressable } from 'react-native';

import { Icon, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

type Props = {
  label: string;
  onPress?: () => void;
};

export function AddSubscriptionButton({ label, onPress }: Props) {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => ({
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: 'transparent',
        borderColor: theme.colors.borderDefault,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderRadius: 14,
        paddingVertical: 13,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Icon name="plus" size={14} color={theme.colors.textSecondary} />
      <Text variant="label" color={theme.colors.textSecondary} style={{ fontSize: 13 }}>
        {label}
      </Text>
    </Pressable>
  );
}
