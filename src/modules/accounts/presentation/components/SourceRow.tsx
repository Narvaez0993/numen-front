import { Pressable, View } from 'react-native';

import type { CurrencyCode } from '@/shared/domain';
import { Icon, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { withAlpha } from '@/shared/presentation/theme/tokens';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

type Props = {
  name: string;
  sub?: string;
  icon: string;
  amount: number;
  currency: CurrencyCode;
  /** Overrides the monochrome well — used only by the two people rows, where
   *  owing and being owed are genuinely different facts. */
  tint?: string;
  last?: boolean;
  onPress: () => void;
  onEdit?: () => void;
  editLabel?: string;
};

/**
 * One place money sits: an account, a wallet, cash, or what a person owes.
 *
 * A row with a rule, and a monochrome well like every other list in the app. The
 * wells used to carry each account's own colour, which turned the screen into a
 * paint chart and made the eye read the icon before the balance — the balance
 * being the only reason anyone opens this screen.
 *
 * Tapping asks "what have I done with this?" rather than "let me rename it": the
 * balance is already on the row, its movements are the part you cannot see from
 * here. Editing keeps a pencil of its own so renaming is still one tap, just not
 * the tap you make by accident.
 */
export function SourceRow({
  name,
  sub,
  icon,
  amount,
  currency,
  tint,
  last = false,
  onPress,
  onEdit,
  editLabel,
}: Props) {
  const { theme } = useTheme();
  const wellColor = tint ?? theme.palette.acc;
  const iconColor = tint ?? theme.palette.acc2;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 12,
        minHeight: 44,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: theme.colors.borderSubtle,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: withAlpha(wellColor, 0.14),
        }}
      >
        <Icon name={icon} size={16} stroke={1.8} color={iconColor} />
      </View>

      <View style={{ flex: 1, minWidth: 0 }}>
        <Text numberOfLines={1} style={{ fontSize: 14 }}>
          {name}
        </Text>
        {sub ? (
          <Text
            numberOfLines={1}
            color={theme.colors.textTertiary}
            style={{ fontSize: 11, marginTop: 2 }}
          >
            {sub}
          </Text>
        ) : null}
      </View>

      <Text
        tabular
        color={tint ?? theme.colors.textPrimary}
        style={{ fontSize: 15, fontWeight: '500' }}
      >
        {formatMoney(amount, currency)}
      </Text>

      {onEdit ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={editLabel}
          onPress={onEdit}
          hitSlop={10}
          style={({ pressed }) => ({
            marginRight: -6,
            paddingHorizontal: 6,
            paddingVertical: 10,
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <Icon name="pencil" size={13} stroke={1.9} color={theme.colors.textTertiary} />
        </Pressable>
      ) : null}
    </Pressable>
  );
}
