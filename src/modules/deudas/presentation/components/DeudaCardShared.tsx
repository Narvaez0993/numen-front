import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import type { CurrencyCode } from '@/shared/domain';
import { Icon, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { withAlpha } from '@/shared/presentation/theme/tokens';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

import { type Deuda, type SharedEvent, initialOf } from '../../domain';
import { useDebtsContext } from '../context/DebtsContext';
import { debtAccent, debtAccentSoft } from '../utils/debtAccent';

type Props = {
  event: SharedEvent;
  debts: Deuda[];
  currency: CurrencyCode;
  expanded: boolean;
  last?: boolean;
  onToggle: () => void;
  onPersonPress: (debt: Deuda) => void;
};

/**
 * A split, wearing the same line as everybody else.
 *
 * The design draws Deudas as one flat list and has no group in it, but a dinner
 * shared four ways is not four unrelated loans — collapsing it would make the
 * screen say something false about what happened. So the group keeps its row and
 * its disclosure, and gives up the card: same disc, same two lines, same bar. It
 * reads as one entry in the list rather than as a different kind of object, and
 * the chevron is the only thing that marks it as openable.
 */
export function DeudaCardShared({
  event,
  debts,
  currency,
  expanded,
  last = false,
  onToggle,
  onPersonPress,
}: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { counterpartyById } = useDebtsContext();

  const paid = debts.reduce((sum, debt) => sum + debt.paidTotal, 0);
  const left = debts.reduce((sum, debt) => sum + debt.remaining, 0);
  // Progress over what is actually owed: the user's own share needs no collecting.
  const owed = paid + left;
  const progress = owed > 0 ? paid / owed : 0;
  const accent = debtAccent(theme);

  return (
    <View
      style={{
        borderBottomWidth: last && !expanded ? 0 : 1,
        borderBottomColor: theme.colors.borderSubtle,
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        onPress={onToggle}
        style={({ pressed }) => ({
          minHeight: 44,
          paddingVertical: 13,
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
              backgroundColor: withAlpha(accent, 0.14),
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="users" size={16} stroke={1.9} color={debtAccentSoft(theme)} />
          </View>

          <View style={{ flex: 1, minWidth: 0 }}>
            <Text numberOfLines={1} style={{ fontSize: 14.5 }}>
              {event.name}
            </Text>
            <Text
              numberOfLines={1}
              color={theme.colors.textTertiary}
              style={{ fontSize: 11, marginTop: 2 }}
            >
              {t('deudas.card.sharedWith', { count: debts.length })}
            </Text>
          </View>

          <Text tabular style={{ fontSize: 15, fontWeight: '500' }}>
            {formatMoney(left, currency)}
          </Text>
          <View style={{ transform: [{ rotate: expanded ? '180deg' : '0deg' }] }}>
            <Icon name="chevron-down" size={14} color={theme.colors.textTertiary} />
          </View>
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
              backgroundColor: accent,
            }}
          />
        </View>
      </Pressable>

      {expanded ? (
        // Enough that each name lands exactly under the event's own: the disc is
        // 26 and its gap 10, against 34 and 12 on the row above. Indenting by the
        // parent's whole 46 instead pushed the names to 82px, far enough that
        // they read as a different list rather than as this one opened up. The
        // smaller disc is what carries the nesting.
        <View style={{ paddingBottom: 12, paddingLeft: 10 }}>
          {debts.map((debt) => {
            const person = counterpartyById[debt.counterpartyId];
            if (!person) return null;
            return (
              <Pressable
                key={debt.id}
                accessibilityRole="button"
                onPress={() => onPersonPress(debt)}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  minHeight: 44,
                  paddingVertical: 8,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <View
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 13,
                    backgroundColor: withAlpha(accent, 0.14),
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    color={debtAccentSoft(theme)}
                    style={{ fontSize: 11, fontWeight: '600' }}
                  >
                    {initialOf(person.name)}
                  </Text>
                </View>
                <Text numberOfLines={1} style={{ flex: 1, fontSize: 13 }}>
                  {person.name}
                </Text>
                <Text
                  tabular
                  color={
                    debt.remaining === 0
                      ? theme.colors.textTertiary
                      : theme.colors.textPrimary
                  }
                  style={{ fontSize: 12.5 }}
                >
                  {debt.remaining === 0
                    ? t('deudas.status.paid')
                    : formatMoney(debt.remaining, currency)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}
