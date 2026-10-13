import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { withAlpha } from '@/shared/presentation/theme/tokens';
import { daysBetween } from '@/shared/presentation/utils/dates';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

import type { Subscription, SubscriptionCharge } from '../../domain';

type Props = {
  charges: SubscriptionCharge[];
  /** The catalog that resolves each charge's name and source. */
  subscriptions: Subscription[];
  /** Resolves the account a charge leaves from. */
  sourceName: (subscription: Subscription) => string | undefined;
  today: string;
  busy?: boolean;
  onConfirm: (chargeId: string) => void;
  onSkip: (chargeId: string) => void;
};

/**
 * The charges waiting for an answer.
 *
 * This is the honest half of the automatic engine: it asks before it registers
 * anything. The question is phrased from the user's side — "¿Spotify ya te
 * cobró?" — because they are the only one who knows. The app has a schedule, not
 * a bank feed.
 *
 * One card per charge rather than a list inside one card. Each is a separate
 * yes-or-no about real money, and stacking them in a single box makes the second
 * one look like a detail of the first.
 */
export function PendingChargesCard({
  charges,
  subscriptions,
  sourceName,
  today,
  busy = false,
  onConfirm,
  onSkip,
}: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  if (charges.length === 0) return null;

  const byId = new Map(subscriptions.map((s) => [s.id, s]));

  return (
    <View style={{ gap: 10 }}>
      {charges.map((charge) => {
        const subscription = byId.get(charge.subscriptionId);
        if (!subscription) return null;

        const days = daysBetween(today, charge.dueOn);
        const due =
          days === 0
            ? t('subscriptions.pending.dueToday')
            : days < 0
              ? t('subscriptions.pending.dueAgo', { count: Math.abs(days) })
              : t('subscriptions.pending.dueIn', { count: days });

        return (
          <View
            key={charge.id}
            style={{
              padding: 15,
              paddingHorizontal: 16,
              borderRadius: 20,
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: withAlpha(theme.palette.acc, 0.2),
            }}
          >
            {/* The one gradient surface in the app, and it earns it: this is the
                only card that is asking rather than reporting. */}
            {/* In a View pinned to the edges: an `Svg` placed directly sizes
                itself to the card's content box and stops short of the padding
                (see `PlanBanner`). */}
            <View pointerEvents="none" style={StyleSheet.absoluteFill}>
              <Svg width="100%" height="100%">
                <Defs>
                  <LinearGradient id="pendingWash" x1="0" y1="0" x2="1" y2="0.4">
                    <Stop offset="0" stopColor={theme.palette.acc} stopOpacity={0.13} />
                    <Stop
                      offset="1"
                      stopColor={theme.colors.textPrimary}
                      stopOpacity={0.05}
                    />
                  </LinearGradient>
                </Defs>
                <Rect x="0" y="0" width="100%" height="100%" fill="url(#pendingWash)" />
              </Svg>
            </View>

            <Text style={{ fontSize: 13.5, fontWeight: '500', marginBottom: 3 }}>
              {t('subscriptions.pending.question', { name: subscription.name })}
            </Text>
            <Text
              tabular
              numberOfLines={1}
              color={theme.colors.textTertiary}
              style={{ fontSize: 11.5, marginBottom: 13 }}
            >
              {[
                formatMoney(charge.amount, charge.currency),
                due,
                sourceName(subscription),
              ]
                .filter(Boolean)
                .join(' · ')}
            </Text>

            <View style={{ flexDirection: 'row', gap: 9 }}>
              <Pressable
                accessibilityRole="button"
                onPress={() => onConfirm(charge.id)}
                disabled={busy}
                style={({ pressed }) => ({
                  flex: 1,
                  minHeight: 44,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 14,
                  backgroundColor: theme.colors.textPrimary,
                  opacity: busy ? 0.5 : pressed ? 0.9 : 1,
                })}
              >
                <Text
                  color={theme.colors.bgBase}
                  style={{ fontSize: 12.5, fontWeight: '600' }}
                >
                  {t('subscriptions.pending.yes')}
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={() => onSkip(charge.id)}
                disabled={busy}
                style={({ pressed }) => ({
                  flex: 1,
                  minHeight: 44,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 14,
                  backgroundColor: theme.colors.bgElevated,
                  opacity: busy ? 0.5 : pressed ? 0.85 : 1,
                })}
              >
                <Text
                  color={theme.colors.textSecondary}
                  style={{ fontSize: 12.5, fontWeight: '500' }}
                >
                  {t('subscriptions.pending.notYet')}
                </Text>
              </Pressable>
            </View>
          </View>
        );
      })}
    </View>
  );
}
