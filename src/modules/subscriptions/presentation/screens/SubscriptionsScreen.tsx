import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { AccentColor } from '@/shared/domain';
import { SubScreenHeader } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

import type { Subscription } from '../../domain';
import { AddSubscriptionButton } from '../components/AddSubscriptionButton';
import { MonthlyTotalCard } from '../components/MonthlyTotalCard';
import { SubscriptionCard } from '../components/SubscriptionCard';
import {
  SubscriptionFormSheet,
  type SubscriptionFormInput,
} from '../components/SubscriptionFormSheet';
import { useSubscriptions } from '../hooks/useSubscriptions';
import { useSubscriptionsStore } from '../stores/useSubscriptionsStore';

const SUB_COLORS: readonly AccentColor[] = ['coral', 'mint', 'purple', 'amber', 'pink'];

export function SubscriptionsScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { data } = useSubscriptions();

  const initialized = useSubscriptionsStore((s) => s.initialized);
  const init = useSubscriptionsStore((s) => s.init);
  const subscriptions = useSubscriptionsStore((s) => s.subscriptions);
  const addSubscription = useSubscriptionsStore((s) => s.addSubscription);
  const updateSubscription = useSubscriptionsStore((s) => s.updateSubscription);
  const removeSubscription = useSubscriptionsStore((s) => s.removeSubscription);

  const [formSheet, setFormSheet] = useState<{
    open: boolean;
    subscription: Subscription | null;
  }>({ open: false, subscription: null });

  useEffect(() => {
    if (data && !initialized) init(data);
  }, [data, initialized, init]);

  if (!initialized) {
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

  const monthly = subscriptions.reduce(
    (sum, s) => sum + (s.every >= 365 ? Math.round(s.amount / 12) : s.amount),
    0,
  );

  const closeForm = () => setFormSheet({ open: false, subscription: null });

  const handleSave = (input: SubscriptionFormInput) => {
    const existing = formSheet.subscription;
    if (existing) {
      updateSubscription(existing.id, input);
    } else {
      addSubscription({
        id: `sub-${Date.now()}`,
        icon: 'refresh',
        color: SUB_COLORS[subscriptions.length % SUB_COLORS.length] ?? 'purple',
        nextInDays: input.every,
        urgent: input.every < 3,
        ...input,
      });
    }
    closeForm();
  };

  const handleDelete = () => {
    if (formSheet.subscription) removeSubscription(formSheet.subscription.id);
    closeForm();
  };

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
          monthly={monthly}
          yearly={monthly * 12}
          count={subscriptions.length}
        />

        <View style={{ gap: 10, marginBottom: 16 }}>
          {subscriptions.map((subscription) => (
            <SubscriptionCard
              key={subscription.id}
              subscription={subscription}
              onPress={() => setFormSheet({ open: true, subscription })}
            />
          ))}
        </View>

        <AddSubscriptionButton
          label={t('subscriptions.add')}
          onPress={() => setFormSheet({ open: true, subscription: null })}
        />
      </ScrollView>

      <SubscriptionFormSheet
        visible={formSheet.open}
        subscription={formSheet.subscription}
        onClose={closeForm}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </SafeAreaView>
  );
}
