import { View } from 'react-native';

import { Icon, IconName, Pill, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

type Props = {
  title: string;
  icon: IconName;
  hint?: string;
};

export function PlaceholderScreen({ title, icon, hint }: Props) {
  const { theme } = useTheme();
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
        paddingHorizontal: 32,
        paddingBottom: 130,
        backgroundColor: theme.colors.bgBase,
      }}
    >
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 16,
          backgroundColor: theme.colors.bgSurface,
          borderColor: theme.colors.borderSubtle,
          borderWidth: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name={icon} size={26} stroke={1.6} color={theme.colors.textTertiary} />
      </View>
      <View style={{ alignItems: 'center', gap: 6 }}>
        <Text variant="h1">{title}</Text>
        {hint ? (
          <Text variant="body" muted style={{ textAlign: 'center', maxWidth: 240 }}>
            {hint}
          </Text>
        ) : null}
      </View>
      <Pill variant="neutral" uppercase>
        Siguiente iteración
      </Pill>
    </View>
  );
}
