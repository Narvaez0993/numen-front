import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';

import { useSubscriptions } from '@/modules/subscriptions/presentation/hooks/useSubscriptions';
import { IconBox, SectionLabel, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { daysBetween } from '@/shared/presentation/utils/dates';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

import type { UpcomingCharge } from '../../domain/types/HomeOverview';

type Props = {
  items: UpcomingCharge[];
  today: string;
  busy?: boolean;
  onConfirm: (chargeId: string) => void;
  onSkip: (chargeId: string) => void;
  onSeeAll?: () => void;
};

/**
 * What is about to be charged, in the next week.
 *
 * A `pending` charge is one whose day arrived: it gets the two answers inline, since
 * asking on the home screen is the whole point of the confirmation window. The rest
 * are just a heads-up. Names and icons come from the subscriptions catalog the app
 * already caches — the payload carries ids only.
 */
export function UpcomingCharges({
  items,
  today,
  busy = false,
  onConfirm,
  onSkip,
  onSeeAll,
}: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const subscriptions = useSubscriptions(today);

  if (items.length === 0) return null;

  const byId = new Map((subscriptions.data?.subscriptions ?? []).map((s) => [s.id, s]));

  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          paddingHorizontal: 4,
          marginBottom: 10,
          gap: 12,
        }}
      >
        <SectionLabel>{t('home.upcoming.title')}</SectionLabel>
        <Pressable hitSlop={6} onPress={onSeeAll} disabled={!onSeeAll}>
          <Text
            variant="label"
            color={theme.colors.accentMint}
            style={{ fontSize: 11.5 }}
          >
            {t('home.upcoming.seeAll')}
          </Text>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 10, paddingRight: 4 }}
      >
        {items.map((charge) => {
          const subscription = byId.get(charge.subscriptionId);
          const days = daysBetween(today, charge.chargeOn);
          const pending = charge.status === 'pending';
          const chargeId = charge.chargeId;
          const dotColor = pending ? theme.colors.accentAmber : theme.colors.textTertiary;

          return (
            <View
              key={`${charge.subscriptionId}:${charge.chargeOn}`}
              style={{
                width: pending ? 190 : 152,
                backgroundColor: theme.colors.bgSurface,
                borderColor: pending
                  ? theme.colors.accentAmber
                  : theme.colors.borderSubtle,
                borderWidth: 1,
                borderRadius: 14,
                padding: 12,
                gap: 10,
              }}
            >
              <IconBox
                name={subscription?.icon ?? 'refresh'}
                color={subscription?.color ?? 'amber'}
                size={32}
                iconSize={15}
                radius={10}
              />
              <View>
                <Text variant="body" style={{ fontWeight: '500' }} numberOfLines={1}>
                  {subscription?.name ?? t('home.upcoming.unknown')}
                </Text>
                <Text
                  variant="caption"
                  color={theme.colors.textSecondary}
                  tabular
                  style={{ marginTop: 2 }}
                >
                  {formatMoney(charge.amount)}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <View
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: 2.5,
                    backgroundColor: dotColor,
                  }}
                />
                <Text
                  variant="micro"
                  color={dotColor}
                  style={{ fontSize: 10.5, fontWeight: '500', letterSpacing: 0 }}
                >
                  {pending
                    ? t('home.upcoming.pending')
                    : days <= 0
                      ? t('home.upcoming.today')
                      : t('home.upcoming.inDays', { count: days })}
                </Text>
              </View>

              {pending && chargeId !== null ? (
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  <Answer
                    label={t('home.upcoming.confirm')}
                    tone={theme.colors.accentMint}
                    background={theme.colors.accentMintBg}
                    disabled={busy}
                    onPress={() => onConfirm(chargeId)}
                  />
                  <Answer
                    label={t('home.upcoming.skip')}
                    tone={theme.colors.textSecondary}
                    background="transparent"
                    disabled={busy}
                    onPress={() => onSkip(chargeId)}
                  />
                </View>
              ) : null}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

function Answer({
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
        paddingVertical: 7,
        borderRadius: 9,
        backgroundColor: background,
        borderWidth: background === 'transparent' ? 1 : 0,
        borderColor: theme.colors.borderSubtle,
        opacity: disabled ? 0.5 : pressed ? 0.7 : 1,
      })}
    >
      <Text variant="label" color={tone} style={{ fontSize: 11 }}>
        {label}
      </Text>
    </Pressable>
  );
}
