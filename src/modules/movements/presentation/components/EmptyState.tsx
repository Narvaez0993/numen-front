import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Icon, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

export function EmptyState() {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <View
      style={{
        alignItems: 'center',
        gap: 12,
        paddingVertical: 60,
        paddingHorizontal: 24,
      }}
    >
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          backgroundColor: theme.colors.bgSurface,
          borderColor: theme.colors.borderSubtle,
          borderWidth: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name="search" size={22} color={theme.colors.textTertiary} stroke={1.6} />
      </View>
      <View style={{ alignItems: 'center', gap: 4 }}>
        <Text variant="h2">{t('movements.empty.title')}</Text>
        <Text variant="caption" muted style={{ textAlign: 'center' }}>
          {t('movements.empty.hint')}
        </Text>
      </View>
    </View>
  );
}
