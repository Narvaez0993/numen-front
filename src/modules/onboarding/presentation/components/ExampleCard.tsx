import { View } from 'react-native';

import { Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

type Props = {
  label: string;
  example: string;
  faded?: boolean;
};

export function ExampleCard({ label, example, faded = false }: Props) {
  const { theme } = useTheme();
  return (
    <View
      style={{
        backgroundColor: theme.colors.bgSurface,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 12,
        opacity: faded ? 0.35 : 1,
      }}
    >
      <Text variant="micro" muted style={{ marginBottom: 6, textTransform: 'uppercase' }}>
        {label}
      </Text>
      <Text variant="body" style={{ fontSize: 14, fontStyle: 'italic', lineHeight: 20 }}>
        “{example}”
      </Text>
    </View>
  );
}
