import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Button, Icon, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

type Props = {
  onCreate: () => void;
};

export function EmptyState({ onCreate }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 32,
        paddingHorizontal: 4,
        minHeight: 360,
      }}
    >
      <View
        style={{
          backgroundColor: theme.colors.bgSurface,
          borderWidth: 1,
          borderStyle: 'dashed',
          borderColor: theme.colors.borderDefault,
          borderRadius: 22,
          paddingVertical: 28,
          paddingHorizontal: 24,
          alignItems: 'center',
          maxWidth: 320,
        }}
      >
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 18,
            backgroundColor: theme.colors.accentMintBg,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
          }}
        >
          <Icon name="target" size={32} color={theme.colors.accentMint} stroke={1.7} />
        </View>
        <Text variant="h1" style={{ fontSize: 19, marginBottom: 8, textAlign: 'center' }}>
          {t('budgets.emptyA.title')}
        </Text>
        <Text
          variant="body"
          color={theme.colors.textSecondary}
          style={{
            fontSize: 13.5,
            lineHeight: 19.5,
            textAlign: 'center',
            marginBottom: 22,
          }}
        >
          {t('budgets.emptyA.body')}
        </Text>
        <Button full label={t('budgets.emptyA.cta')} onPress={onCreate} />
      </View>
    </View>
  );
}
