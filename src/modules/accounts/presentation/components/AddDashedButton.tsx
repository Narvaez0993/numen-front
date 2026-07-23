import { Pressable } from 'react-native';

import { Icon, type IconName, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

type Props = {
  icon: IconName;
  label: string;
  onPress?: () => void;
};

export function AddDashedButton({ icon, label, onPress }: Props) {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => ({
        flex: 1,
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
        paddingHorizontal: 10,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Icon name={icon} size={14} color={theme.colors.textSecondary} />
      <Text variant="label" color={theme.colors.textSecondary} style={{ fontSize: 12 }}>
        {label}
      </Text>
    </Pressable>
  );
}
