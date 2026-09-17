import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { CurrencyCode } from '@/shared/domain';
import { Aurora, Icon, Text, Toast } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { withAlpha } from '@/shared/presentation/theme/tokens';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

import { annualSavingPercent, perMonth, type BillingPeriod } from '../../domain';

import { usePlusOffer } from '../hooks/usePlusOffer';
import { useTier } from '../hooks/useTier';

/** The four lines the paywall makes its case with, in the bundle's order. */
const FEATURES = ['messages', 'limits', 'corte', 'voice'] as const;

/** `US$7.99`. The `US` is not decoration: `$` alone reads as pesos to half the
 *  people this is priced for, and the store charges dollars either way. */
function price(minor: number, currency: CurrencyCode): string {
  const money = formatMoney(minor, currency);
  return currency === 'USD' ? `US${money}` : money;
}

/**
 * The paywall — one page about one plan.
 *
 * It used to be a comparison: two cards side by side, Free with its eight
 * bullets and Plus with its six, and a segmented control over the top. That
 * shape asks the reader to do a diff. The design asks a question instead —
 * what does the paid one get me — and answers it with four lines, because the
 * user arriving here already has Free and does not need it described.
 *
 * The two prices are the only choice on the screen, and the year carries its own
 * arithmetic: what it works out to per month, and what it saves. Both are
 * computed from the price, never written beside it.
 */
export function PlanScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { data: offer, isLoading } = usePlusOffer();
  const tier = useTier();

  const [period, setPeriod] = useState<BillingPeriod>('anual');
  const [toastVisible, setToastVisible] = useState(false);

  if (isLoading || !offer) {
    return (
      <Aurora>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={theme.palette.acc} />
        </View>
      </Aurora>
    );
  }

  // There is no checkout yet. What there IS is a server that decides the plan,
  // and this screen used to flip a local flag instead — so it said "Plus activo"
  // while every gate kept refusing on Free. Saying "todavía no" is the honest
  // version of the same button until RevenueCat lands.
  const activate = () => {
    if (tier === 'plus') return;
    setToastVisible(true);
  };

  const features = FEATURES.map((key) => t(`plan.features.${key}`));

  return (
    <Aurora>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: insets.top + 14,
          paddingBottom: insets.bottom + 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ alignItems: 'flex-end', paddingHorizontal: 22 }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('common.close')}
            onPress={() => router.back()}
            style={({ pressed }) => ({
              width: 44,
              height: 44,
              borderRadius: 22,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme.colors.bgFloat,
              borderWidth: 1,
              borderColor: theme.colors.borderSubtle,
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Icon name="x" size={15} stroke={2} color={theme.colors.textSecondary} />
          </Pressable>
        </View>

        <View style={{ paddingHorizontal: 30, paddingTop: 24 }}>
          <Text
            variant="micro"
            uppercase
            color={theme.colors.textTertiary}
            style={{ letterSpacing: 2.4, marginBottom: 18 }}
          >
            {t('plan.eyebrow')}
          </Text>
          <Text style={{ fontSize: 29, lineHeight: 36, letterSpacing: -0.9 }}>
            {t('plan.headline')}{' '}
            <Text style={{ fontSize: 29, fontFamily: 'Geist_500Medium' }}>
              {t('plan.headlineStrong')}
            </Text>
          </Text>
        </View>

        <View style={{ paddingHorizontal: 26, paddingTop: 26 }}>
          {features.map((feature, i) => (
            <View
              key={feature}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                paddingVertical: 11,
                borderBottomWidth: i === features.length - 1 ? 0 : 1,
                borderBottomColor: theme.colors.borderSubtle,
              }}
            >
              <Icon name="check" size={16} stroke={2.2} color={theme.palette.acc} />
              <Text style={{ flex: 1, fontSize: 13.5 }}>{feature}</Text>
            </View>
          ))}
          <Text
            color={theme.colors.textTertiary}
            style={{ fontSize: 11.5, marginTop: 14 }}
          >
            {t('plan.freeForever')}
          </Text>
        </View>

        {/* The prices sit at the bottom of the screen when there is room for them
            to, and scroll up with everything else when there is not. */}
        <View style={{ flex: 1, minHeight: 24 }} />

        <View style={{ paddingHorizontal: 22, gap: 10 }}>
          <PeriodCard
            selected={period === 'mensual'}
            title={t('plan.monthly.title')}
            note={t('plan.monthly.note')}
            amount={price(offer.monthly, offer.currency)}
            onPress={() => setPeriod('mensual')}
          />
          <PeriodCard
            selected={period === 'anual'}
            title={t('plan.annual.title')}
            badge={t('plan.annual.badge', { percent: annualSavingPercent(offer) })}
            note={t('plan.annual.note', {
              amount: price(perMonth(offer), offer.currency),
            })}
            amount={price(offer.annual, offer.currency)}
            onPress={() => setPeriod('anual')}
          />
        </View>

        <View style={{ paddingHorizontal: 22, paddingTop: 16 }}>
          <Pressable
            accessibilityRole="button"
            disabled={tier === 'plus'}
            onPress={activate}
            style={({ pressed }) => ({
              minHeight: 52,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 18,
              backgroundColor: theme.colors.textPrimary,
              opacity: tier === 'plus' ? 0.5 : pressed ? 0.85 : 1,
            })}
          >
            <Text
              color={theme.colors.bgBase}
              style={{ fontSize: 14, fontFamily: 'Geist_500Medium' }}
            >
              {tier === 'plus' ? t('plan.cta.current') : t('plan.cta.start')}
            </Text>
          </Pressable>
          <Text
            color={theme.colors.textTertiary}
            style={{ fontSize: 11, textAlign: 'center', marginTop: 12 }}
          >
            {t('plan.trial', { count: offer.trialDays })}
          </Text>
        </View>
      </ScrollView>

      <Toast
        visible={toastVisible}
        message={t('plan.toast.soon')}
        onDismiss={() => setToastVisible(false)}
      />
    </Aurora>
  );
}

function PeriodCard({
  selected,
  title,
  badge,
  note,
  amount,
  onPress,
}: {
  selected: boolean;
  title: string;
  badge?: string;
  note: string;
  amount: string;
  onPress: () => void;
}) {
  const { theme } = useTheme();

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 13,
        paddingVertical: 15,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: selected
          ? withAlpha(theme.palette.acc, 0.12)
          : theme.colors.bgSurface,
        borderWidth: 1,
        borderColor: selected
          ? withAlpha(theme.palette.acc, 0.35)
          : theme.colors.borderSubtle,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={{ fontSize: 14, fontFamily: 'Geist_500Medium' }}>{title}</Text>
          {badge ? (
            <View
              style={{
                paddingVertical: 2,
                paddingHorizontal: 8,
                borderRadius: 7,
                backgroundColor: theme.colors.accentMintBg,
              }}
            >
              <Text
                variant="micro"
                uppercase
                color={theme.colors.accentMint}
                style={{ fontSize: 9.5, letterSpacing: 0.5 }}
              >
                {badge}
              </Text>
            </View>
          ) : null}
        </View>
        <Text color={theme.colors.textTertiary} style={{ fontSize: 11.5, marginTop: 3 }}>
          {note}
        </Text>
      </View>
      {/* Not `tabular`: that prop is also what privacy mode masks, and a store
          price is not the user's money to hide. */}
      <Text style={{ fontSize: 16, fontFamily: 'Geist_500Medium' }}>{amount}</Text>
    </Pressable>
  );
}
