import { Pressable, View } from 'react-native';

import type { CurrencyCode } from '@/shared/domain';
import { Icon, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { withAlpha } from '@/shared/presentation/theme/tokens';
import { amountDigits, formatMoney } from '@/shared/presentation/utils/formatMoney';

type Props = {
  name: string;
  icon: string;
  spent: number;
  target: number;
  /** `spent / target`, uncapped — 1.4 is 140% and the bar simply fills. */
  used: number;
  currency: CurrencyCode;
  last?: boolean;
  onPress: () => void;
};

/**
 * One watched category: what it has cost against what it was allowed.
 *
 * A row with a rule under it, not a card. Four of these read as a list you scan
 * down; four cards read as four things demanding separate attention, which is
 * the opposite of what a cap is for — the whole point is to notice the one that
 * is misbehaving without reading the other three.
 *
 * Colour is spent on exactly one thing: being over. The bar and the number turn
 * coral together, so the row that matters is findable without reading any of it.
 */
export function WatchedRow({
  name,
  icon,
  spent,
  target,
  used,
  currency,
  last = false,
  onPress,
}: Props) {
  const { theme } = useTheme();
  const over = spent > target;
  const fill = Math.min(Math.max(used, 0), 1);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        paddingVertical: 11,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: theme.colors.borderSubtle,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          marginBottom: 9,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            flex: 1,
            minWidth: 0,
          }}
        >
          <View
            style={{
              width: 30,
              height: 30,
              borderRadius: 10,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: withAlpha(theme.palette.acc, 0.14),
            }}
          >
            <Icon name={icon} size={14} stroke={1.8} color={theme.palette.acc2} />
          </View>
          <Text numberOfLines={1} style={{ flex: 1, fontSize: 14 }}>
            {name}
          </Text>
        </View>

        <Text
          tabular
          color={over ? theme.colors.accentCoral : theme.colors.textPrimary}
          style={{ fontSize: 13.5, fontWeight: '500' }}
        >
          {formatMoney(spent, currency)}
          <Text
            tabular
            color={theme.colors.textTertiary}
            style={{ fontSize: 13.5, fontWeight: '400' }}
          >
            {' / '}
            {amountDigits(target, currency)}
          </Text>
        </Text>
      </View>

      <View
        style={{
          height: 3,
          borderRadius: 2,
          overflow: 'hidden',
          backgroundColor: withAlpha(theme.colors.textPrimary, 0.1),
        }}
      >
        <View
          style={{
            width: `${fill * 100}%`,
            height: '100%',
            backgroundColor: over
              ? theme.colors.accentCoral
              : // Full-strength accent only once it is close: a cap at 40% has
                // nothing to say and should not shout it.
                fill > 0.75
                ? theme.palette.acc
                : withAlpha(theme.palette.acc, 0.75),
          }}
        />
      </View>
    </Pressable>
  );
}
