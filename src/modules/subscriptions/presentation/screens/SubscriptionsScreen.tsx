import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useMovementCatalogs } from '@/modules/movements/presentation/hooks/useMovementCatalogs';
import { SubScreenHeader, Text, Toast } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { toIsoDate } from '@/shared/presentation/utils/dates';

import {
  ChargeAlreadySettledError,
  InvalidSubscriptionError,
  SubscriptionSourceCurrencyMismatchError,
  type Subscription,
} from '../../domain';
import { AddSubscriptionButton } from '../components/AddSubscriptionButton';
import { MonthlyTotalCard } from '../components/MonthlyTotalCard';
import { PendingChargesCard } from '../components/PendingChargesCard';
import { SubscriptionCard } from '../components/SubscriptionCard';
import {
  SubscriptionFormSheet,
  type SubscriptionFormInput,
} from '../components/SubscriptionFormSheet';
import { useCharges, useConfirmCharge, useSkipCharge } from '../hooks/useCharges';
import {
  useCreateSubscription,
  useDeleteSubscription,
  useUpdateSubscription,
} from '../hooks/useSubscriptionMutations';
import { useSubscriptions } from '../hooks/useSubscriptions';

type Sheet = { open: boolean; subscription: Subscription | null };

export function SubscriptionsScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  // Pinned once per mount: a re-render must not move what "today" means.
  const today = useMemo(() => toIsoDate(new Date()), []);

  const { data, isLoading, isError, refetch } = useSubscriptions(today);
  const pending = useCharges('pending');
  // The source name lives in the accounts catalog the app already caches.
  const catalogs = useMovementCatalogs();

  const create = useCreateSubscription();
  const update = useUpdateSubscription();
  const remove = useDeleteSubscription();
  const confirm = useConfirmCharge();
  const skip = useSkipCharge();

  const [sheet, setSheet] = useState<Sheet>({ open: false, subscription: null });
  const [formError, setFormError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const closeSheet = () => {
    setSheet({ open: false, subscription: null });
    setFormError(null);
  };

  const handleFormError = (error: Error) => {
    if (error instanceof SubscriptionSourceCurrencyMismatchError) {
      // Nothing in the form fixes this one: the account itself is in another
      // currency, so the message points at where the problem actually is.
      setFormError(t('subscriptions.errors.currencyMismatch'));
      return;
    }
    setFormError(
      error instanceof InvalidSubscriptionError
        ? t('subscriptions.errors.invalid')
        : t('subscriptions.errors.generic'),
    );
  };

  const handleSave = (input: SubscriptionFormInput) => {
    setFormError(null);
    const existing = sheet.subscription;
    if (existing) {
      update.mutate(
        { id: existing.id, patch: input },
        { onSuccess: closeSheet, onError: handleFormError },
      );
    } else {
      create.mutate(input, { onSuccess: closeSheet, onError: handleFormError });
    }
  };

  const handleDelete = () => {
    if (!sheet.subscription) return;
    remove.mutate(sheet.subscription.id, {
      onSuccess: closeSheet,
      onError: () => setToast(t('subscriptions.errors.deleteFailed')),
    });
  };

  const settleError = (error: Error) =>
    setToast(
      error instanceof ChargeAlreadySettledError
        ? t('subscriptions.errors.alreadySettled')
        : t('subscriptions.errors.generic'),
    );

  if (isError) {
    return (
      <SafeAreaView
        edges={['top']}
        style={{ flex: 1, backgroundColor: theme.colors.bgBase }}
      >
        <SubScreenHeader title={t('subscriptions.title')} onBack={() => router.back()} />
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 32,
            gap: 16,
          }}
        >
          <Text variant="body" muted style={{ fontSize: 14, textAlign: 'center' }}>
            {t('subscriptions.error.title')}
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => void refetch()}
            style={({ pressed }) => ({
              paddingHorizontal: 20,
              paddingVertical: 11,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: theme.colors.borderSubtle,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text
              variant="label"
              color={theme.colors.accentMint}
              style={{ fontSize: 13 }}
            >
              {t('subscriptions.error.retry')}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

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
          currency={data.currency}
        />

        <PendingChargesCard
          charges={pending.data ?? []}
          subscriptions={data.subscriptions}
          today={today}
          busy={confirm.isPending || skip.isPending}
          onConfirm={(id) => confirm.mutate({ id }, { onError: settleError })}
          onSkip={(id) => skip.mutate(id, { onError: settleError })}
        />

        <View style={{ gap: 10, marginBottom: 16 }}>
          {data.subscriptions.length === 0 ? (
            <View style={{ paddingVertical: 28, paddingHorizontal: 16 }}>
              <Text variant="body" muted style={{ fontSize: 13, textAlign: 'center' }}>
                {t('subscriptions.empty')}
              </Text>
            </View>
          ) : (
            data.subscriptions.map((subscription) => (
              <SubscriptionCard
                key={subscription.id}
                subscription={subscription}
                today={today}
                sourceName={catalogs.sourceById[subscription.source.id]?.name}
                onPress={() => {
                  setFormError(null);
                  setSheet({ open: true, subscription });
                }}
              />
            ))
          )}
        </View>

        <AddSubscriptionButton
          label={t('subscriptions.add')}
          onPress={() => {
            setFormError(null);
            setSheet({ open: true, subscription: null });
          }}
        />

        <Text
          variant="caption"
          muted
          style={{ fontSize: 11, lineHeight: 16, textAlign: 'center', marginTop: 18 }}
        >
          {t('subscriptions.footer')}
        </Text>
      </ScrollView>

      <SubscriptionFormSheet
        visible={sheet.open}
        subscription={sheet.subscription}
        today={today}
        saving={create.isPending || update.isPending}
        errorMessage={formError}
        onClose={closeSheet}
        onSave={handleSave}
        onDelete={handleDelete}
      />

      <Toast
        visible={toast !== null}
        message={toast ?? ''}
        onDismiss={() => setToast(null)}
        durationMs={2500}
      />
    </SafeAreaView>
  );
}
