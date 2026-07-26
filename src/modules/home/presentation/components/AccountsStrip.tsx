import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';

import { useAccounts } from '@/modules/accounts/presentation/hooks/useAccounts';
import {
  Card,
  Icon,
  IconBox,
  SectionLabel,
  Text,
} from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

type Props = { onPress?: () => void };

type Tile = {
  id: string;
  name: string;
  icon: string;
  color: Parameters<typeof IconBox>[0]['color'];
  amount: number;
  /** A card shows what you owe, so its figure reads as a debt, not a balance. */
  isDebt: boolean;
};

/**
 * Where your money sits, right on Home. The hero already carries the **total**
 * (net balance); this is the breakdown, which is what tells you whether you can
 * actually pay for something today.
 *
 * Reads the same query the Accounts screen caches, so it costs no extra request.
 */
export function AccountsStrip({ onPress }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { data } = useAccounts();

  const tiles: Tile[] = [
    ...(data?.accounts ?? []).map((a) => ({
      id: a.id,
      name: a.name,
      icon: a.icon,
      color: a.color,
      amount: a.balance,
      isDebt: false,
    })),
    ...(data?.creditCards ?? []).map((c) => ({
      id: c.id,
      name: c.name,
      icon: c.icon,
      color: c.color,
      amount: c.debt,
      isDebt: true,
    })),
  ];

  // Nothing to break down yet — that is what the getting-started checklist is for.
  if (tiles.length === 0) return null;

  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          paddingHorizontal: 4,
          marginBottom: 10,
        }}
      >
        <SectionLabel>{t('home.accounts.title')}</SectionLabel>
        <Pressable hitSlop={6} onPress={onPress} disabled={!onPress}>
          <Text
            variant="label"
            color={theme.colors.accentMint}
            style={{ fontSize: 11.5 }}
          >
            {t('home.accounts.seeAll')}
          </Text>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 10, paddingRight: 4 }}
      >
        {tiles.map((tile) => (
          <Card key={tile.id} padding={12} radius={14} onPress={onPress}>
            <View style={{ width: 118, gap: 8 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <IconBox
                  name={tile.icon}
                  color={tile.color}
                  size={28}
                  iconSize={14}
                  radius={9}
                />
                {tile.isDebt ? (
                  <Icon name="credit-card" size={13} color={theme.colors.textTertiary} />
                ) : null}
              </View>
              <Text variant="caption" muted numberOfLines={1} style={{ fontSize: 11 }}>
                {tile.name}
              </Text>
              <Text
                variant="label"
                tabular
                numberOfLines={1}
                color={tile.isDebt ? theme.colors.accentCoral : theme.colors.textPrimary}
                style={{ fontSize: 13 }}
              >
                {tile.isDebt && tile.amount > 0 ? '−' : ''}
                {formatMoney(tile.amount)}
              </Text>
            </View>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}
