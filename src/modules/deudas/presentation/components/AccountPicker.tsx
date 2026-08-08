import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { useAccounts } from '@/modules/accounts/presentation/hooks/useAccounts';
import { IconBox, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

type Props = {
  selected: string | null;
  onSelect: (accountId: string | null) => void;
  /** Offers "no cash moved" as a real answer. Only the loan may say it — a
   *  repayment always moves money, so its picker leaves the option out. */
  allowNone?: boolean;
  noneLabel?: string;
};

/**
 * Which account the cash crossed. The debt is a ledger of its own and the transfer
 * that feeds it is real, so this is not decoration: pick nothing and the balance
 * silently stays wrong.
 *
 * Cards are deliberately absent. Lending on a credit card is a cash advance — a
 * different product with its own fee — and the honest path is the same one goals
 * take: it passes through an account first.
 */
export function AccountPicker({ selected, onSelect, allowNone, noneLabel }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const accounts = useAccounts();
  const options = accounts.data?.accounts ?? [];

  return (
    <View style={{ gap: 8 }}>
      {options.map((account) => {
        const active = account.id === selected;
        return (
          <Pressable
            key={account.id}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onSelect(account.id)}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              paddingVertical: 10,
              paddingHorizontal: 12,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: active ? theme.colors.accentMint : theme.colors.borderSubtle,
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
            <Text variant="label" numberOfLines={1} style={{ flex: 1, fontSize: 13 }}>
              {account.name}
            </Text>
            <Text variant="caption" muted tabular style={{ fontSize: 11.5 }}>
              {formatMoney(account.balance)}
            </Text>
          </Pressable>
        );
      })}

      {allowNone ? (
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: selected === null }}
          onPress={() => onSelect(null)}
          style={({ pressed }) => ({
            paddingVertical: 11,
            paddingHorizontal: 12,
            borderRadius: 12,
            borderWidth: 1,
            borderStyle: 'dashed',
            borderColor:
              selected === null ? theme.colors.accentMint : theme.colors.borderSubtle,
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <Text
            variant="label"
            color={
              selected === null ? theme.colors.accentMint : theme.colors.textSecondary
            }
            style={{ fontSize: 12.5 }}
          >
            {noneLabel ?? t('deudas.account.none')}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
