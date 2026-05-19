import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SubScreenHeader } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

import { AddSubscriptionButton } from '../components/AddSubscriptionButton';
import { MonthlyTotalCard } from '../components/MonthlyTotalCard';
import { SubscriptionCard } from '../components/SubscriptionCard';
import { useSubscriptions } from '../hooks/useSubscriptions';

export function SubscriptionsScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { data, isLoading } = useSubscriptions();

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
      <SubScreenHeader title={t('subscriptions.title')} onBack={() => router.back()} />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 32,
        }}
        showsVerticalScrollIndicator={false}
      >
        <MonthlyTotalCard
          monthly={data.monthly}
          yearly={data.yearly}
          count={data.count}
        />

        <View style={{ gap: 10, marginBottom: 16 }}>
          {data.subscriptions.map((subscription) => (
            <SubscriptionCard key={subscription.id} subscription={subscription} />
          ))}
        </View>

        <AddSubscriptionButton label={t('subscriptions.add')} />
      </ScrollView>
    </SafeAreaView>
  );
}
