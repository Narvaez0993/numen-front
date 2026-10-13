import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Icon, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { withAlpha } from '@/shared/presentation/theme/tokens';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

import type { CreditCard } from '../../domain';

type Props = {
  card: CreditCard;
  onPress: () => void;
  onEdit: () => void;
  editLabel: string;
};

/**
 * A credit card, which is the one thing on this screen that is not money you
 * have.
 *
 * It gets a card rather than a row for exactly that reason — the accounts above
 * are a list of balances and this is a debt, so making it look like another line
 * in the same list is the mistake. The amount is signed and coral, and the bar
 * measures the limit rather than a cap: how much of the card is already spoken
 * for is the number that decides whether you can use it.
 *
 * The two dates are the second half of the answer. A card at 31% with a cut-off
 * tomorrow is a different situation from the same 31% just after one, and
 * nothing else on the screen can tell you which you are in.
 */
export function CardTile({ card, onPress, onEdit, editLabel }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const usage = card.limit > 0 ? Math.min(card.debt / card.limit, 1) : 0;
  // What the card still lets you spend — the figure people check before paying
  // with it. Past the limit there is nothing left, not a negative.
  const available = Math.max(card.limit - card.debt, 0);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        padding: 14,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: theme.colors.bgSurface,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 10,
          marginBottom: 9,
        }}
      >
        {/* The available amount sits where an account row keeps its type,
            «Ahorros»: same size, same tint, one line under the name. */}
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text numberOfLines={1} style={{ fontSize: 14 }}>
            {card.name}
          </Text>
          <Text
            tabular
            numberOfLines={1}
            color={theme.colors.textTertiary}
            style={{ fontSize: 11, marginTop: 2 }}
          >
            {t('accounts.tc.available', {
              amount: formatMoney(available, card.currency),
            })}
          </Text>
        </View>
        {/* A card you owe nothing on is not a warning. The minus and the coral
            both mean "this is a debt", and at zero neither is true. */}
        <Text
          tabular
          color={card.debt > 0 ? theme.colors.accentCoral : theme.colors.textSecondary}
          style={{ fontSize: 14.5, fontWeight: '500' }}
        >
          {card.debt > 0 ? '−' : ''}
          {formatMoney(card.debt, card.currency)}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={editLabel}
          onPress={onEdit}
          hitSlop={10}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
        >
          <Icon name="pencil" size={13} stroke={1.9} color={theme.colors.textTertiary} />
        </Pressable>
      </View>

      <View
        style={{
          height: 3,
          borderRadius: 2,
          overflow: 'hidden',
          marginBottom: 9,
          backgroundColor: withAlpha(theme.colors.textPrimary, 0.1),
        }}
      >
        <View
          style={{
            width: `${usage * 100}%`,
            height: '100%',
            backgroundColor: theme.colors.accentCoral,
          }}
        />
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
        <Text tabular color={theme.colors.textTertiary} style={{ fontSize: 10.5 }}>
          {t('accounts.tc.usage', { pct: Math.round(usage * 100) })}
        </Text>
        <Text
          numberOfLines={1}
          color={theme.colors.textTertiary}
          style={{ fontSize: 10.5 }}
        >
          {card.dueDay !== null
            ? t('accounts.tc.cycle', { cutoff: card.cutoffDay, due: card.dueDay })
            : t('accounts.tc.cutoff', { day: card.cutoffDay })}
        </Text>
      </View>
    </Pressable>
  );
}
