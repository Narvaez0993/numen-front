import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { IconBox, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { daysBetween } from '@/shared/presentation/utils/dates';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

import type { Subscription } from '../../domain';

type Props = {
  subscription: Subscription;
  /** The device's local day, so "in N days" is derived and never stored. */
  today: string;
  /** Resolved from the accounts catalog by the screen. */
  sourceName?: string;
  onPress?: () => void;
};

/** Under this, the charge is close enough to be worth flagging. */
const SOON_DAYS = 3;

export function SubscriptionCard({ subscription, today, sourceName, onPress }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { name, icon, color, amount, currency, frequency, nextChargeOn, active } =
    subscription;

  const days = nextChargeOn === null ? null : daysBetween(today, nextChargeOn);
  const soon = days !== null && days <= SOON_DAYS;

  const pillBg = soon ? theme.colors.accentAmberBg : theme.colors.accentMintBg;
  const pillFg = soon ? theme.colors.accentAmber : theme.colors.accentMint;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: theme.colors.bgSurface,
        borderColor: theme.colors.borderSubtle,
        borderWidth: 1,
        borderRadius: 16,
        padding: 14,
        // A paused subscription stays in the list, visibly switched off.
        opacity: pressed ? 0.85 : active ? 1 : 0.55,
      })}
    >
      <IconBox name={icon} color={color} size={40} iconSize={19} radius={12} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            gap: 8,
            marginBottom: 2,
          }}
        >
          <Text variant="bodyLarge" numberOfLines={1} style={{ flex: 1, fontSize: 14 }}>
            {name}
          </Text>
          <Text variant="bodyLarge" tabular style={{ fontSize: 13.5 }}>
            {formatMoney(amount, currency)}
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
          }}
        >
          <Text
            variant="caption"
            muted
            numberOfLines={1}
            style={{ flex: 1, fontSize: 11 }}
          >
            {[t(`subscriptions.frequency.${frequency}`), sourceName]
              .filter(Boolean)
              .join(' · ')}
          </Text>
          <View
            style={{
              backgroundColor: active ? pillBg : 'transparent',
              borderRadius: 6,
              paddingHorizontal: 7,
              paddingVertical: 3,
            }}
          >
            <Text
              variant="label"
              color={active ? pillFg : theme.colors.textTertiary}
              style={{ fontSize: 10.5 }}
            >
              {days === null
                ? t('subscriptions.card.paused')
                : days <= 0
                  ? t('subscriptions.card.today')
                  : t('subscriptions.card.next', { count: days })}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
