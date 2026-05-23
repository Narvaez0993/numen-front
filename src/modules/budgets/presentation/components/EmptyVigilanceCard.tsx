import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Icon, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

export function EmptyVigilanceCard() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        backgroundColor: theme.colors.bgSurface,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: theme.colors.borderSubtle,
        borderRadius: 16,
        padding: 18,
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          backgroundColor: theme.colors.bgFloat,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name="target" size={20} color={theme.colors.textTertiary} stroke={1.7} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text variant="bodyLarge" style={{ fontSize: 13.5, marginBottom: 4 }}>
          {t('budgets.emptyB.title')}
        </Text>
        <Text
          variant="caption"
          color={theme.colors.textSecondary}
          style={{ fontSize: 11.5, lineHeight: 16.5 }}
        >
          {t('budgets.emptyB.body')}
        </Text>
      </View>
    </View>
  );
}
