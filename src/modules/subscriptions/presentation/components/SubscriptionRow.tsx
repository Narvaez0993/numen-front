import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Icon, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { withAlpha } from '@/shared/presentation/theme/tokens';
import { daysBetween, monthShort } from '@/shared/presentation/utils/dates';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

import type { Subscription } from '../../domain';

type Props = {
  subscription: Subscription;
  today: string;
  sourceName?: string;
  last?: boolean;
  onPress: () => void;
};

/**
 * One subscription, led by the day it charges.
 *
 * The date badge comes first because a list of subscriptions is read as a
 * calendar — what is about to leave, and when — not as an inventory. The name
 * only matters once you know it is next.
 *
 * A charge that already happened is drawn at full contrast and one still coming
 * steps back, which looks backwards until you notice the rule the whole app
 * follows: what happened is fact, what is coming is a forecast. The rhythm strip
 * draws its projection as an outline for the same reason.
 */
export function SubscriptionRow({
  subscription,
  today,
  sourceName,
  last = false,
  onPress,
}: Props) {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();

  const { name, amount, currency, nextChargeOn, active } = subscription;
  const days = nextChargeOn === null ? null : daysBetween(today, nextChargeOn);
  // Nothing left to charge this cycle: the date has passed, so it is behind us.
  const charged = days !== null && days < 0;
  const settled = charged || !active;

  const when =
    days === null
      ? t('subscriptions.row.paused')
      : days < 0
        ? t('subscriptions.row.charged')
        : days === 0
          ? t('subscriptions.row.today')
          : t('subscriptions.row.inDays', { count: days });

  const dayText = nextChargeOn?.slice(-2) ?? '—';
  const monthText = nextChargeOn === null ? '' : monthShort(nextChargeOn, i18n.language);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 13,
        minHeight: 44,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: theme.colors.borderSubtle,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <View style={{ width: 38, alignItems: 'center' }}>
        <Text
          tabular
          color={settled ? theme.colors.textPrimary : theme.colors.textSecondary}
          style={{ fontSize: 15, fontWeight: '500' }}
        >
          {dayText}
        </Text>
        <Text
          variant="micro"
          uppercase
          color={theme.colors.textTertiary}
          style={{ fontSize: 9.5, letterSpacing: 0.6 }}
        >
          {monthText}
        </Text>
      </View>

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
        <Icon name="refresh" size={14} stroke={1.8} color={theme.palette.acc2} />
      </View>

      <View style={{ flex: 1, minWidth: 0 }}>
        <Text numberOfLines={1} style={{ fontSize: 14 }}>
          {name}
        </Text>
        <Text
          numberOfLines={1}
          color={theme.colors.textTertiary}
          style={{ fontSize: 11, marginTop: 2 }}
        >
          {[when, sourceName].filter(Boolean).join(' · ')}
        </Text>
      </View>

      <Text
        tabular
        color={settled ? theme.colors.textPrimary : theme.colors.textSecondary}
        style={{ fontSize: 14.5, fontWeight: '500' }}
      >
        {formatMoney(amount, currency)}
      </Text>
    </Pressable>
  );
}
