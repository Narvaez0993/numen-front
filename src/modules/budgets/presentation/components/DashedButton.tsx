import { Pressable, View } from 'react-native';

import { Icon, type IconName, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

type Props = {
  label: string;
  onPress?: () => void;
  icon?: IconName;
};

export function DashedButton({ label, onPress, icon = 'plus' }: Props) {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        width: '100%',
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: theme.colors.borderDefault,
        borderRadius: 14,
        paddingVertical: 13,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        <Icon name={icon} size={14} color={theme.colors.textSecondary} />
        <Text variant="label" color={theme.colors.textSecondary} style={{ fontSize: 13 }}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}
