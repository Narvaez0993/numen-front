import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';

import type { UpcomingCharge } from '@/modules/home/domain/types/HomeOverview';
import { Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { withAlpha } from '@/shared/presentation/theme/tokens';
import { shortDate } from '@/shared/presentation/utils/dates';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

const CARD_WIDTH = 142;

type Props = {
  items: UpcomingCharge[];
  /** What every subscription adds up to in a month. */
  monthlyTotal: number | null;
  /** Resolves a subscription's name from the catalog — the payload carries ids. */
  nameOf: (subscriptionId: string) => string;
  today: string;
  language: string;
  busy: boolean;
  onConfirm: (chargeId: string) => void;
  onSkip: (chargeId: string) => void;
  onSeeAll: () => void;
};

/**
 * The money that leaves without being asked.
 *
 * A row of cards rather than a list, because these are not decisions the user
 * makes one after another — they are a shelf to glance at. The one that is due
 * turns over on tap and shows Confirmar / Cancelar on its back, so the choice
 * lives on the thing it is about instead of in a sheet somewhere else.
 */
export function AutoCharges({
  items,
  monthlyTotal,
  nameOf,
  today,
  language,
  busy,
  onConfirm,
  onSkip,
  onSeeAll,
}: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [flipped, setFlipped] = useState<string | null>(null);

  if (items.length === 0) return null;

  return (
    <View style={{ paddingTop: 8 }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
          <Text
            variant="micro"
            uppercase
            color={theme.colors.textTertiary}
            style={{ letterSpacing: 2.2 }}
          >
            {t('home.autoCharges.title')}
          </Text>
          {monthlyTotal !== null ? (
            <Text tabular color={theme.colors.textTertiary} style={{ fontSize: 11 }}>
              {t('home.autoCharges.monthly', { amount: formatMoney(monthlyTotal) })}
            </Text>
          ) : null}
        </View>
        <Pressable accessibilityRole="button" onPress={onSeeAll} hitSlop={8}>
          <Text color={theme.palette.acc2} style={{ fontSize: 11.5 }}>
            {t('home.autoCharges.seeAll')}
          </Text>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 10, paddingBottom: 2 }}
      >
        {items.map((charge) => {
          const name = nameOf(charge.subscriptionId);
          const due = charge.status === 'pending';
          const open = flipped === charge.subscriptionId && charge.chargeId !== null;
          const days = daysUntil(charge.chargeOn, today);

          return (
            <Pressable
              key={charge.subscriptionId + charge.chargeOn}
              accessibilityRole="button"
              onPress={() =>
                due && charge.chargeId
                  ? setFlipped(open ? null : charge.subscriptionId)
                  : onSeeAll()
              }
              style={{
                width: CARD_WIDTH,
                borderRadius: 17,
                padding: 11,
                paddingHorizontal: 12,
                backgroundColor: due
                  ? withAlpha(theme.palette.acc, 0.14)
                  : theme.colors.bgSurface,
                borderWidth: due ? 1.5 : 1,
                borderColor: due
                  ? withAlpha(theme.palette.acc, 0.42)
                  : theme.colors.borderSubtle,
              }}
            >
              {open && charge.chargeId ? (
                <View style={{ gap: 7, justifyContent: 'center', minHeight: 92 }}>
                  <Pressable
                    accessibilityRole="button"
                    disabled={busy}
                    onPress={() => {
                      setFlipped(null);
                      onConfirm(charge.chargeId as string);
                    }}
                    style={{
                      minHeight: 36,
                      borderRadius: 12,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: theme.colors.textPrimary,
                    }}
                  >
                    <Text
                      color={theme.surfaces.textOnAccent}
                      style={{ fontSize: 11.5, fontWeight: '600' }}
                    >
                      {t('home.autoCharges.confirm')}
                    </Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    disabled={busy}
                    onPress={() => {
                      setFlipped(null);
                      onSkip(charge.chargeId as string);
                    }}
                    style={{
                      minHeight: 34,
                      borderRadius: 11,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: theme.colors.bgElevated,
                    }}
                  >
                    <Text
                      color={theme.colors.textSecondary}
                      style={{ fontSize: 11.5, fontWeight: '500' }}
                    >
                      {t('home.autoCharges.skip')}
                    </Text>
                  </Pressable>
                </View>
              ) : (
                <View style={{ minHeight: 92 }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 9,
                    }}
                  >
                    <View
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 8,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: due
                          ? withAlpha(theme.palette.acc, 0.2)
                          : theme.colors.bgFloat,
                      }}
                    >
                      <Text
                        color={due ? theme.palette.acc2 : theme.colors.textSecondary}
                        style={{ fontSize: 12, fontWeight: '600' }}
                      >
                        {name.trim().charAt(0).toUpperCase() || '?'}
                      </Text>
                    </View>
                    <View
                      style={{
                        paddingVertical: 4,
                        paddingHorizontal: 8,
                        borderRadius: 9,
                        backgroundColor: due
                          ? withAlpha(theme.palette.acc, 0.18)
                          : theme.colors.bgFloat,
                      }}
                    >
                      <Text
                        color={due ? theme.palette.acc2 : theme.colors.textTertiary}
                        style={{ fontSize: 10, letterSpacing: 0.6 }}
                      >
                        {due
                          ? t('home.autoCharges.due')
                          : t('home.autoCharges.inDays', { count: days })}
                      </Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 12.5, fontWeight: '500', marginBottom: 4 }}>
                    {name}
                  </Text>
                  <Text
                    tabular
                    style={{ fontSize: 14, fontWeight: '500', letterSpacing: -0.4 }}
                  >
                    {formatMoney(charge.amount)}
                  </Text>
                  <Text
                    color={due ? theme.palette.acc2 : theme.colors.textTertiary}
                    style={{ fontSize: 10.5, marginTop: 6 }}
                  >
                    {due
                      ? t('home.autoCharges.tapToConfirm')
                      : shortDate(charge.chargeOn, language)}
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const MS_PER_DAY = 86_400_000;

function daysUntil(dateStr: string, todayStr: string): number {
  const diff = new Date(dateStr).getTime() - new Date(todayStr).getTime();
  return Math.max(0, Math.round(diff / MS_PER_DAY));
}
