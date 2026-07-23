import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Button, Card, Icon, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

type Props = {
  onSeePlus: () => void;
};

export function LimitGateCard({ onSeePlus }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <Card padding={16}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          marginBottom: 8,
        }}
      >
        <Icon name="alert-circle" size={15} color={theme.colors.accentAmber} />
        <Text variant="bodyLarge" style={{ fontSize: 14 }}>
          {t('assistant.limit.title')}
        </Text>
      </View>
      <Text
        variant="caption"
        color={theme.colors.textSecondary}
        style={{ lineHeight: 18, marginBottom: 12 }}
      >
        {t('assistant.limit.body')}
      </Text>
      <Button label={t('assistant.limit.cta')} full onPress={onSeePlus} />
    </Card>
  );
}
