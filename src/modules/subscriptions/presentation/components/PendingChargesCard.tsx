import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Card, IconBox, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { daysBetween } from '@/shared/presentation/utils/dates';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

import type { Subscription, SubscriptionCharge } from '../../domain';

type Props = {
  charges: SubscriptionCharge[];
  /** The catalog that resolves each charge's name and icon. */
  subscriptions: Subscription[];
  today: string;
  busy?: boolean;
  onConfirm: (chargeId: string) => void;
  onSkip: (chargeId: string) => void;
};

/**
 * The charges waiting for an answer.
 *
 * This is the honest half of the automatic engine: it asks before it registers, and
 * says out loud that not answering means yes. Without that sentence the automatic
 * charge would feel like the app taking liberties with someone's money.
 */
export function PendingChargesCard({
  charges,
  subscriptions,
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
    <Card padding={14} style={{ marginBottom: 16 }}>
      <View style={{ gap: 4, marginBottom: 12 }}>
        <Text variant="label" style={{ fontSize: 12.5 }}>
          {t('subscriptions.pending.title', { count: charges.length })}
        </Text>
        <Text variant="caption" muted style={{ fontSize: 11, lineHeight: 16 }}>
          {t('subscriptions.pending.hint')}
        </Text>
      </View>

      <View style={{ gap: 12 }}>
        {charges.map((charge) => {
          const subscription = byId.get(charge.subscriptionId);
          const overdue = daysBetween(charge.dueOn, today) > 0;
          return (
            <View key={charge.id} style={{ gap: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <IconBox
                  name={subscription?.icon ?? 'refresh'}
                  color={subscription?.color ?? 'amber'}
                  size={32}
                  iconSize={15}
                  radius={10}
                />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text variant="bodyLarge" numberOfLines={1} style={{ fontSize: 13.5 }}>
                    {subscription?.name ?? t('subscriptions.pending.unknown')}
                  </Text>
                  <Text variant="caption" muted style={{ fontSize: 11, marginTop: 2 }}>
                    {overdue
                      ? t('subscriptions.pending.overdue', { date: charge.dueOn })
                      : t('subscriptions.pending.dueToday')}
                  </Text>
                </View>
                <Text variant="bodyLarge" tabular style={{ fontSize: 13.5 }}>
                  {formatMoney(charge.amount, charge.currency)}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Action
                  label={t('subscriptions.pending.confirm')}
                  tone={theme.colors.accentMint}
                  background={theme.colors.accentMintBg}
                  disabled={busy}
                  onPress={() => onConfirm(charge.id)}
                />
                <Action
                  label={t('subscriptions.pending.skip')}
                  tone={theme.colors.textSecondary}
                  background="transparent"
                  disabled={busy}
                  onPress={() => onSkip(charge.id)}
                />
              </View>
            </View>
          );
        })}
      </View>
    </Card>
  );
}

function Action({
  label,
  tone,
  background,
  disabled,
  onPress,
}: {
  label: string;
  tone: string;
  background: string;
  disabled: boolean;
  onPress: () => void;
}) {
  const { theme } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        alignItems: 'center',
        paddingVertical: 9,
        borderRadius: 10,
        backgroundColor: background,
        borderWidth: background === 'transparent' ? 1 : 0,
        borderColor: theme.colors.borderSubtle,
        opacity: disabled ? 0.5 : pressed ? 0.7 : 1,
      })}
    >
      <Text variant="label" color={tone} style={{ fontSize: 12 }}>
        {label}
      </Text>
    </Pressable>
  );
}
