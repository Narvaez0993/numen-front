import { Pressable, View } from 'react-native';

import type { CurrencyCode } from '@/shared/domain';
import { Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { withAlpha } from '@/shared/presentation/theme/tokens';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

import { type Deuda, debtProgress, initialOf } from '../../domain';
import { debtTone } from '../utils/debtTone';

type Props = {
  deuda: Deuda;
  name: string;
  /** What this debt is: its note, or the split it came from. */
  detail: string;
  currency: CurrencyCode;
  last?: boolean;
  onPress: () => void;
};

/**
 * One person, one line.
 *
 * This used to be a card with a border, a status pill and a percentage under the
 * bar — four ways of saying the same thing, stacked. The row keeps the two that
 * answer the question you opened the screen with: how much is left, and how far
 * along it is. The bar carries the progress on its own; a number beside it is the
 * same fact twice.
 *
 * The avatar's disc stays neutral and only the letter takes the tone. Filling
 * eight discs with colour turns the list into confetti and pulls the eye to the
 * initials, which are the least useful thing on the line.
 */
export function DebtRow({ deuda, name, detail, currency, last = false, onPress }: Props) {
  const { theme } = useTheme();
  const tone = debtTone(theme, deuda.direction);
  const progress = debtProgress(deuda);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 44,
        paddingVertical: 13,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: theme.colors.borderSubtle,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          marginBottom: 9,
        }}
      >
        <View
          style={{
            width: 34,
            height: 34,
            borderRadius: 17,
            backgroundColor: theme.colors.bgFloat,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text color={tone} style={{ fontSize: 13, fontWeight: '600' }}>
            {initialOf(name)}
          </Text>
        </View>

        <View style={{ flex: 1, minWidth: 0 }}>
          <Text numberOfLines={1} style={{ fontSize: 14.5 }}>
            {name}
          </Text>
          <Text
            numberOfLines={1}
            color={theme.colors.textTertiary}
            style={{ fontSize: 11, marginTop: 2 }}
          >
            {detail}
          </Text>
        </View>

        <Text tabular color={tone} style={{ fontSize: 15, fontWeight: '500' }}>
          {formatMoney(deuda.remaining, currency)}
        </Text>
      </View>

      <View
        style={{
          height: 3,
          borderRadius: 2,
          backgroundColor: withAlpha(theme.colors.textPrimary, 0.09),
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            width: `${Math.min(100, Math.max(0, progress * 100))}%`,
            height: '100%',
            backgroundColor: tone,
          }}
        />
      </View>
    </Pressable>
  );
}
