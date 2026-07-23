import { View } from 'react-native';

import { Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

type Props = {
  label: string;
  value: string;
};

export function MiniInfoCard({ label, value }: Props) {
  const { theme } = useTheme();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.bgFloat,
        borderWidth: 1,
        borderColor: theme.colors.borderDefault,
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 8,
      }}
    >
      <Text variant="micro" muted style={{ fontSize: 9.5, marginBottom: 2 }}>
        {label}
      </Text>
      <Text variant="label" numberOfLines={1} style={{ fontSize: 12 }}>
        {value}
      </Text>
    </View>
  );
}
