import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SubScreenHeader, Text, Toast } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

import type { BillingPeriod, Plan } from '../../domain';

import { PeriodToggle } from '../components/PeriodToggle';
import { PlanCard } from '../components/PlanCard';
import { usePlanComparison } from '../hooks/usePlanComparison';
import { useTier } from '../hooks/useTier';

export function PlanScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { data, isLoading } = usePlanComparison();
  const [period, setPeriod] = useState<BillingPeriod>('mensual');
  const [toastVisible, setToastVisible] = useState(false);

  const tier = useTier();

  if (isLoading || !data) {
    return (
      <SafeAreaView
        edges={['top']}
        style={{
          flex: 1,
          backgroundColor: theme.colors.bgBase,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator color={theme.colors.accentMint} />
      </SafeAreaView>
    );
  }

  // There is no checkout yet. What there IS is a server that decides the plan,
  // and this screen used to flip a local flag instead — so it said "Plus activo"
  // while every gate kept refusing on Free. Saying "todavía no" is the honest
  // version of the same button until RevenueCat lands.
  const handleActivate = () => {
    if (tier === 'plus') return;
    setToastVisible(true);
  };

  const plans: Plan[] = data.plans.map((plan) => {
    const isPlusPlan = plan.id === 'plus';
    const isCurrent = isPlusPlan ? tier === 'plus' : tier === 'free';
    return {
      ...plan,
      isCurrent,
      ctaLabel: isPlusPlan && tier === 'free' ? plan.ctaLabel : null,
    };
  });

  return (
    <SafeAreaView
      edges={['top']}
      style={{ flex: 1, backgroundColor: theme.colors.bgBase }}
    >
      <SubScreenHeader title={t('plan.title')} onBack={() => router.back()} />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 32,
        }}
        showsVerticalScrollIndicator={false}
      >
        <PeriodToggle value={period} onChange={setPeriod} />

        <View style={{ gap: 14 }}>
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} period={period} onCta={handleActivate} />
          ))}
        </View>

        <Text
          variant="caption"
          muted
          style={{
            fontSize: 11,
            lineHeight: 16,
            textAlign: 'center',
            marginTop: 16,
          }}
        >
          {t('plan.footer')}
        </Text>
      </ScrollView>

      <Toast
        visible={toastVisible}
        message={t('plan.toast.soon')}
        onDismiss={() => setToastVisible(false)}
      />
    </SafeAreaView>
  );
}
