import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';

import { useAccounts } from '@/modules/accounts/presentation/hooks/useAccounts';
import { BottomSheet, Icon, InkButton, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { withAlpha } from '@/shared/presentation/theme/tokens';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

type Props = {
  visible: boolean;
  /** What the contribution will move — shown so the choice has context. */
  amount: number;
  goalName: string;
  onConfirm: (accountId: string) => void;
  onClose: () => void;
};

/**
 * A goal contribution is a real transfer: the user picks WHERE it leaves from.
 *
 * Drawn as the design's `ELEGIR` — the title with «Cerrar» opposite, the rows
 * with their well and the accent's check on the chosen one — because that is
 * what picking looks like everywhere else in the app. It only adds what a
 * picker does not have: the line saying how much will move, and the ink
 * button, since choosing the account is not yet the decision. Confirming is.
 */
export function PlayAccountSheet({
  visible,
  amount,
  goalName,
  onConfirm,
  onClose,
}: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const accounts = useAccounts();
  const [accountId, setAccountId] = useState<string | null>(null);

  const options = accounts.data?.accounts ?? [];
  const chosen = accountId ?? options[0]?.id ?? null;

  return (
    <BottomSheet visible={visible} onClose={onClose} maxHeight="74%" showClose={false}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 12,
          paddingHorizontal: 24,
          paddingTop: 16,
        }}
      >
        <Text numberOfLines={1} style={{ flex: 1, fontSize: 15, fontWeight: '500' }}>
          {t('assistant.corte.play.sheetTitle', { name: goalName })}
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={onClose}
          style={{ minHeight: 44, justifyContent: 'center' }}
        >
          <Text color={theme.colors.textTertiary} style={{ fontSize: 12.5 }}>
            {t('common.close')}
          </Text>
        </Pressable>
      </View>
      <Text
        color={theme.colors.textTertiary}
        style={{ fontSize: 12.5, lineHeight: 18, paddingHorizontal: 24 }}
      >
        {t('assistant.corte.play.sheetBody', { amount: formatMoney(amount) })}
      </Text>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 26, paddingTop: 20 }}
      >
        <Text
          variant="micro"
          uppercase
          color={theme.colors.textTertiary}
          style={{ letterSpacing: 2.2, marginBottom: 4 }}
        >
          {t('assistant.corte.play.fromAccount')}
        </Text>
        {options.map((account, index) => {
          const active = account.id === chosen;
          return (
            <Pressable
              key={account.id}
              accessibilityRole="radio"
              accessibilityState={{ checked: active }}
              onPress={() => setAccountId(account.id)}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                minHeight: 44,
                paddingVertical: 12,
                borderBottomWidth: index === options.length - 1 ? 0 : 1,
                borderBottomColor: theme.colors.borderSubtle,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 11,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: active
                    ? withAlpha(theme.palette.acc, 0.16)
                    : theme.colors.bgFloat,
                }}
              >
                <Icon
                  name={account.icon}
                  size={15}
                  stroke={1.8}
                  color={active ? theme.palette.acc2 : theme.colors.textSecondary}
                />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text numberOfLines={1} style={{ fontSize: 14.5 }}>
                  {account.name}
                </Text>
                <Text
                  tabular
                  color={theme.colors.textTertiary}
                  style={{ fontSize: 11.5, marginTop: 2 }}
                >
                  {formatMoney(account.balance, account.currency)}
                </Text>
              </View>
              {active ? (
                <Icon name="check" size={17} stroke={2.2} color={theme.palette.acc} />
              ) : null}
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 30 }}>
        <InkButton
          label={t('assistant.corte.play.confirm')}
          disabled={chosen === null}
          onPress={() => chosen && onConfirm(chosen)}
        />
      </View>
    </BottomSheet>
  );
}
