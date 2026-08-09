import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Icon, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { withAlpha } from '@/shared/presentation/theme/tokens';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

type Props = {
  netBalance: number;
  accountsCount: number;
  creditCardsCount: number;
  /** What people owe the user. Shown in the income colour because it is money
   *  coming back, not money held. */
  owedToMe: number;
  onPress: () => void;
};

/** Everything the user holds, in one line: the total, what it is spread across,
 *  and what is still out there with other people. */
export function AccountsRow({
  netBalance,
  accountsCount,
  creditCardsCount,
  owedToMe,
  onPress,
}: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: theme.radius.panel,
        backgroundColor: theme.colors.bgSurface,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
        minHeight: 44,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 11,
          backgroundColor: withAlpha(theme.palette.acc, 0.14),
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name="credit-card" size={16} stroke={1.8} color={theme.palette.acc2} />
      </View>

      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          variant="micro"
          uppercase
          color={theme.colors.textTertiary}
          style={{ letterSpacing: 1.4, marginBottom: 3 }}
        >
          {t('home.accounts.label')}
        </Text>
        <Text tabular style={{ fontSize: 17, fontWeight: '500', letterSpacing: -0.5 }}>
          {formatMoney(netBalance)}
        </Text>
      </View>

      <View style={{ alignItems: 'flex-end' }}>
        <Text color={theme.colors.textTertiary} style={{ fontSize: 11 }}>
          {t('home.accounts.spread', {
            accounts: accountsCount,
            cards: creditCardsCount,
          })}
        </Text>
        {owedToMe > 0 ? (
          <Text
            tabular
            color={theme.colors.accentMint}
            style={{ fontSize: 11.5, marginTop: 3 }}
          >
            {t('home.accounts.owedToMe', { amount: formatMoney(owedToMe) })}
          </Text>
        ) : null}
      </View>

      <Icon name="chevron-right" size={15} stroke={2} color={theme.colors.textTertiary} />
    </Pressable>
  );
}
