import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { useAccounts } from '@/modules/accounts/presentation/hooks/useAccounts';
import {
  BottomSheet,
  Button,
  FieldLabel,
  IconBox,
  Text,
} from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
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
 * Same picker the goals screen uses, minus the amount field — the play fixed it.
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
    <BottomSheet visible={visible} onClose={onClose} maxHeight="80%">
      <View style={{ paddingHorizontal: 22, paddingTop: 8, paddingBottom: 26, gap: 16 }}>
        <View>
          <Text variant="h1" style={{ fontSize: 16 }}>
            {t('assistant.corte.play.sheetTitle', { name: goalName })}
          </Text>
          <Text
            variant="caption"
            color={theme.colors.textSecondary}
            style={{ marginTop: 4 }}
          >
            {t('assistant.corte.play.sheetBody', { amount: formatMoney(amount) })}
          </Text>
        </View>

        <View>
          <FieldLabel label={t('assistant.corte.play.fromAccount')} />
          <View style={{ gap: 8 }}>
            {options.map((account) => {
              const active = account.id === chosen;
              return (
                <Pressable
                  key={account.id}
                  onPress={() => setAccountId(account.id)}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: active
                      ? theme.colors.accentMint
                      : theme.colors.borderSubtle,
                    backgroundColor: theme.colors.bgSurface,
                    opacity: pressed ? 0.85 : 1,
                  })}
                >
                  <IconBox
                    name={account.icon}
                    color={account.color}
                    size={30}
                    iconSize={14}
                    radius={9}
                  />
                  <Text
                    variant="label"
                    numberOfLines={1}
                    style={{ flex: 1, fontSize: 13 }}
                  >
                    {account.name}
                  </Text>
                  <Text variant="caption" muted tabular style={{ fontSize: 11.5 }}>
                    {formatMoney(account.balance)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Button
          label={t('assistant.corte.play.confirm')}
          full
          disabled={chosen === null}
          onPress={() => chosen && onConfirm(chosen)}
        />
      </View>
    </BottomSheet>
  );
}
