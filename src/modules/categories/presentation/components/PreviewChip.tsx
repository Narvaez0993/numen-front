import { View } from 'react-native';

import { Icon, Text } from '@/shared/presentation/components';
import { accentColorKey, useTheme } from '@/shared/presentation/theme';

import type { AccentColor } from '@/shared/domain';

type Props = {
  icon: string;
  color: AccentColor;
  label: string;
};

export function PreviewChip({ icon, color, label }: Props) {
  const { theme } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 6,
        backgroundColor: theme.colors.bgFloat,
        borderColor: theme.colors.borderDefault,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderRadius: 10,
      }}
    >
      <Icon name={icon} size={12} color={theme.colors[accentColorKey(color, 'fg')]} />
      <Text variant="label" color={theme.colors.textSecondary} style={{ fontSize: 11.5 }}>
        {label}
      </Text>
    </View>
  );
}
