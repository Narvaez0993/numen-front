import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SubScreenHeader, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

import type { BillingPeriod } from '../../domain';

import { PeriodToggle } from '../components/PeriodToggle';
import { PlanCard } from '../components/PlanCard';
import { usePlanComparison } from '../hooks/usePlanComparison';

export function PlanScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { data, isLoading } = usePlanComparison();
  const [period, setPeriod] = useState<BillingPeriod>('mensual');

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
          {data.plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} period={period} />
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
    </SafeAreaView>
  );
}
