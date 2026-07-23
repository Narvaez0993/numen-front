import { View } from 'react-native';

import { Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

type Props = {
  label: string;
  transcript: string;
};

export function DijisteCard({ label, transcript }: Props) {
  const { theme } = useTheme();
  return (
    <View
      style={{
        backgroundColor: theme.colors.bgSurface,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 12,
      }}
    >
      <Text variant="micro" muted style={{ marginBottom: 6, textTransform: 'uppercase' }}>
        {label}
      </Text>
      <Text variant="body" muted style={{ fontStyle: 'italic', lineHeight: 18 }}>
        “{transcript}”
      </Text>
    </View>
  );
}
