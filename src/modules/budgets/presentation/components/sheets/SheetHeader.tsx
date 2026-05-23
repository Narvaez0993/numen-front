import { View } from 'react-native';

import { Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

type Props = {
  title: string;
  subtitle?: string;
};

export function SheetHeader({ title, subtitle }: Props) {
  const { theme } = useTheme();
  return (
    <View style={{ paddingTop: 8, paddingBottom: 16, paddingRight: 40 }}>
      <Text variant="h1" style={{ fontSize: 19, marginBottom: 6 }}>
        {title}
      </Text>
      {subtitle ? (
        <Text
          variant="body"
          color={theme.colors.textSecondary}
          style={{ fontSize: 13, lineHeight: 18.9 }}
        >
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}
