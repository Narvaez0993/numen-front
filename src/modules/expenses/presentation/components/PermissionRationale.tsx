import { useTranslation } from 'react-i18next';
import { Linking, View } from 'react-native';

import { Button, Icon, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

type Props = {
  onWriteInstead: () => void;
};

/**
 * The mic without permission, said inline (no system Alert): why we ask, the
 * one-tap way to fix it, and the honest alternative that needs nothing.
 */
export function PermissionRationale({ onWriteInstead }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={{ alignItems: 'center', paddingVertical: 18, gap: 10 }}>
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: theme.colors.bgFloat,
          borderColor: theme.colors.borderSubtle,
          borderWidth: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name="microphone" size={24} color={theme.colors.accentCoral} />
      </View>
      <Text variant="body" style={{ fontWeight: '500' }}>
        {t('expenses.sheet.permission.title')}
      </Text>
      <Text variant="caption" muted style={{ textAlign: 'center', maxWidth: 260 }}>
        {t('expenses.sheet.permission.body')}
      </Text>
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
        <View style={{ flex: 1 }}>
          <Button
            label={t('expenses.sheet.permission.cta')}
            full
            onPress={() => void Linking.openSettings()}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Button label={t('expenses.sheet.write')} full onPress={onWriteInstead} />
        </View>
      </View>
    </View>
  );
}
