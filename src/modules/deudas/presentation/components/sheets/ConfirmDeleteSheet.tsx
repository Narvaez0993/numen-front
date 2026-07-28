import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { BottomSheet, Button, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

type Props = {
  visible: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

/** Deleting a debt only forgets the record — it never held money — but it takes its
 * payment history with it, which is why it still asks. */
export function ConfirmDeleteSheet({ visible, onConfirm, onClose }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <BottomSheet visible={visible} onClose={onClose} maxHeight="45%">
      <View style={{ paddingHorizontal: 22, paddingTop: 10, paddingBottom: 26, gap: 8 }}>
        <Text variant="h1" style={{ fontSize: 16 }}>
          {t('deudas.confirmDelete.title')}
        </Text>
        <Text
          variant="caption"
          color={theme.colors.textSecondary}
          style={{ lineHeight: 18, marginBottom: 10 }}
        >
          {t('deudas.confirmDelete.body')}
        </Text>
        <Button full label={t('deudas.confirmDelete.cta')} onPress={onConfirm} />
        <Pressable
          onPress={onClose}
          style={({ pressed }) => ({
            width: '100%',
            paddingVertical: 12,
            alignItems: 'center',
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text
            variant="label"
            color={theme.colors.textSecondary}
            style={{ fontSize: 12.5 }}
          >
            {t('common.cancel')}
          </Text>
        </Pressable>
      </View>
    </BottomSheet>
  );
}
