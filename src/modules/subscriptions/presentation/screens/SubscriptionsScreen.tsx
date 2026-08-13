import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useMovementCatalogs } from '@/modules/movements/presentation/hooks/useMovementCatalogs';
import {
  Aurora,
  DashedButton,
  Icon,
  RetryState,
  Text,
  Toast,
} from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { toIsoDate } from '@/shared/presentation/utils/dates';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

import {
  ChargeAlreadySettledError,
  InvalidSubscriptionError,
  SubscriptionSourceCurrencyMismatchError,
  type Subscription,
} from '../../domain';
import { PendingChargesCard } from '../components/PendingChargesCard';
import { SubscriptionRow } from '../components/SubscriptionRow';
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

/**
 * Every charge that happens without being asked for.
 *
 * The screen leads with the monthly total and says the yearly one under it,
 * because the yearly figure is the one that changes minds — nobody cancels over
 * $16.900 and plenty of people cancel over $202.800.
 *
 * The list is ordered as a calendar rather than an inventory: the day badge
 * comes first, and what has already been charged reads at full contrast while
 * what is coming steps back. Same rule as the rhythm strip's dashed projection —
 * what happened is fact, what is coming is a forecast.
 */
export function SubscriptionsScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
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
        <RetryState
          titleKey="subscriptions.error.title"
          retryKey="subscriptions.error.retry"
          onRetry={() => void refetch()}
        />
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
        <ActivityIndicator color={theme.palette.acc} />
      </SafeAreaView>
    );
  }

  const sourceOf = (subscription: Subscription) =>
    catalogs.sourceById[subscription.source.id]?.name;

  return (
    <Aurora>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 26,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            paddingHorizontal: 22,
          }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('common.back')}
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
            <Icon
              name="arrow-left"
              size={16}
              stroke={2}
              color={theme.colors.textSecondary}
            />
          </Pressable>
          <Text style={{ fontSize: 16, fontWeight: '500' }}>
            {t('subscriptions.title')}
          </Text>
        </View>

        <View style={{ paddingHorizontal: 26, paddingTop: 26 }}>
          <Text
            variant="micro"
            uppercase
            color={theme.colors.textTertiary}
            style={{ letterSpacing: 2.2, marginBottom: 9 }}
          >
            {t('subscriptions.hero.label')}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 3 }}>
            <Text
              color={theme.colors.textTertiary}
              style={{ fontSize: 19, fontWeight: '300' }}
            >
              $
            </Text>
            <Text
              tabular
              style={{
                fontSize: 43,
                lineHeight: 43,
                fontWeight: '500',
                letterSpacing: -2.1,
              }}
            >
              {formatMoney(data.monthly, data.currency).replace(/^[^\d-]*/, '')}
            </Text>
          </View>
          {/* The yearly figure is the one that changes minds. */}
          <Text
            color={theme.colors.textTertiary}
            style={{ fontSize: 12.5, marginTop: 10 }}
          >
            {t('subscriptions.hero.summary', {
              count: data.count,
              amount: formatMoney(data.yearly, data.currency),
            })}
          </Text>
        </View>

        <View style={{ paddingHorizontal: 22, paddingTop: 22 }}>
          <PendingChargesCard
            charges={pending.data ?? []}
            subscriptions={data.subscriptions}
            sourceName={sourceOf}
            today={today}
            busy={confirm.isPending || skip.isPending}
            onConfirm={(id) => confirm.mutate({ id }, { onError: settleError })}
            onSkip={(id) => skip.mutate(id, { onError: settleError })}
          />
        </View>

        <View style={{ paddingHorizontal: 26, paddingTop: 24 }}>
          <Text
            variant="micro"
            uppercase
            color={theme.colors.textTertiary}
            style={{ letterSpacing: 2.2, marginBottom: 8 }}
          >
            {t('subscriptions.activeLabel')}
          </Text>

          {data.subscriptions.length === 0 ? (
            <Text
              color={theme.colors.textTertiary}
              style={{ fontSize: 13, lineHeight: 19, paddingVertical: 16 }}
            >
              {t('subscriptions.empty')}
            </Text>
          ) : (
            data.subscriptions.map((subscription, index) => (
              <SubscriptionRow
                key={subscription.id}
                subscription={subscription}
                today={today}
                sourceName={sourceOf(subscription)}
                last={index === data.subscriptions.length - 1}
                onPress={() => {
                  setFormError(null);
                  setSheet({ open: true, subscription });
                }}
              />
            ))
          )}
        </View>

        <View style={{ paddingHorizontal: 24, paddingTop: 18 }}>
          <DashedButton
            label={t('subscriptions.add')}
            onPress={() => {
              setFormError(null);
              setSheet({ open: true, subscription: null });
            }}
          />
          <Text
            color={theme.colors.textTertiary}
            style={{ fontSize: 11, textAlign: 'center', marginTop: 10, lineHeight: 16 }}
          >
            {t('subscriptions.footer')}
          </Text>
        </View>
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
    </Aurora>
  );
}
