import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { BottomSheet, Button, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

type Props = {
  visible: boolean;
  /** What is still owed — the most this can cost. The real figure is the ledger's:
   *  only the cash that actually crossed becomes an expense. */
  remaining: number;
  name: string;
  busy?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

/**
 * The one screen in the app where a debt turns into an expense, so it says so plainly
 * before it happens. Everything until now was a transfer and cost the user nothing.
 *
 * It also says the way back out. Writing off is a judgement made under uncertainty —
 * "I do not think Andrés is paying" — and a judgement that felt permanent is one the
 * user would rather not make than make wrong.
 */
export function ConfirmWriteOffSheet({
  visible,
  remaining,
  name,
  busy,
  onConfirm,
  onClose,
}: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <BottomSheet visible={visible} onClose={onClose} maxHeight="55%">
      <View style={{ paddingHorizontal: 22, paddingTop: 10, paddingBottom: 26, gap: 8 }}>
        <Text variant="h1" style={{ fontSize: 16 }}>
          {t('deudas.writeOff.title', { name })}
        </Text>
        <Text
          variant="caption"
          color={theme.colors.textSecondary}
          style={{ lineHeight: 18 }}
        >
          {t('deudas.writeOff.body', { amount: formatMoney(remaining) })}
        </Text>
        <Text
          variant="caption"
          color={theme.colors.textTertiary}
          style={{ lineHeight: 18, marginBottom: 10 }}
        >
          {t('deudas.writeOff.undo')}
        </Text>
        <Button
          full
          label={t('deudas.writeOff.cta')}
          disabled={busy}
          onPress={onConfirm}
        />
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
