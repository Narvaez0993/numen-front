import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SubScreenHeader, Text, Toast } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

import type { BillingPeriod, Plan } from '../../domain';

import { PeriodToggle } from '../components/PeriodToggle';
import { PlanCard } from '../components/PlanCard';
import { usePlanComparison } from '../hooks/usePlanComparison';
import { usePlanStore } from '../stores/usePlanStore';

export function PlanScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { data, isLoading } = usePlanComparison();
  const [period, setPeriod] = useState<BillingPeriod>('mensual');
  const [activating, setActivating] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);

  const tier = usePlanStore((s) => s.tier);
  const activatePlus = usePlanStore((s) => s.activatePlus);
  const downgradeToFree = usePlanStore((s) => s.downgradeToFree);

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

  // Simulated purchase until RevenueCat lands.
  const handleActivate = () => {
    if (activating || tier === 'plus') return;
    setActivating(true);
    setTimeout(() => {
      activatePlus();
      setActivating(false);
      setToastVisible(true);
    }, 900);
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
            <PlanCard
              key={plan.id}
              plan={plan}
              period={period}
              onCta={handleActivate}
              ctaLoading={activating}
            />
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

        {tier === 'plus' ? (
          <Pressable
            accessibilityRole="button"
            onPress={downgradeToFree}
            style={({ pressed }) => ({
              alignItems: 'center',
              paddingVertical: 12,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text
              variant="label"
              color={theme.colors.textTertiary}
              style={{ fontSize: 11.5 }}
            >
              {t('plan.backToFree')}
            </Text>
          </Pressable>
        ) : null}
      </ScrollView>

      <Toast
        visible={toastVisible}
        message={t('plan.toast.activated')}
        onDismiss={() => setToastVisible(false)}
      />
    </SafeAreaView>
  );
}
