import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import type { CurrencyCode } from '@/shared/domain';
import {
  Aurora,
  DashedButton,
  Icon,
  RetryState,
  Text,
  Toast,
} from '@/shared/presentation/components';
import { useCurrencyStore } from '@/shared/presentation/currency/useCurrencyStore';
import { useTheme } from '@/shared/presentation/theme';
import { toIsoDate } from '@/shared/presentation/utils/dates';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

import type { DebtDirection } from '../../domain';
import { DebtHero } from '../components/DebtHero';
import { DebtRow } from '../components/DebtRow';
import { DeudaCardShared } from '../components/DeudaCardShared';
import { DeudaDetailSheet } from '../components/DeudaDetailSheet';
import { DirectionTabs } from '../components/DirectionTabs';
import { EmptyDeudasState } from '../components/EmptyDeudasState';
import { NuevaDeudaSheet } from '../components/create-flow/NuevaDeudaSheet';
import { HistorySheet } from '../components/sheets/HistorySheet';
import { DebtsProvider } from '../context/DebtsContext';
import { useDeleteDebt, useReopenDebt, useWriteOffDebt } from '../hooks/useDebtMutations';
import { useDeudas } from '../hooks/useDeudas';
import { useDeudasFlowStore } from '../stores/useDeudasFlowStore';

type Item = { kind: 'debt'; id: string } | { kind: 'event'; id: string };

/**
 * Who owes whom, as one list per side.
 *
 * The screen used to lead with both totals at 12.5px and then a stack of cards.
 * It now leads with the switch and the one total that answers the question you
 * opened it with, and the debts are rows rather than cards — a card per person
 * turns eight debts into eight boxes and loses the thread on the way down.
 *
 * A shared bill keeps its group and its disclosure, because four people who
 * split a dinner are not four unrelated loans. It just wears the same row as
 * everybody else, so the list still reads as one list.
 */
export function DeudasScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const currency = useCurrencyStore((s) => s.currency) as CurrencyCode;

  // Pinned once per mount: `status` (and so overdue) is derived for this day.
  const today = useMemo(() => toIsoDate(new Date()), []);
  const { data, isLoading, isError, refetch } = useDeudas(today);

  const selectedDebtId = useDeudasFlowStore((s) => s.selectedDebtId);
  const createOpen = useDeudasFlowStore((s) => s.createOpen);
  const createDirection = useDeudasFlowStore((s) => s.createDirection);
  const openDetail = useDeudasFlowStore((s) => s.openDetail);
  const closeDetail = useDeudasFlowStore((s) => s.closeDetail);
  const openCreate = useDeudasFlowStore((s) => s.openCreate);
  const closeCreate = useDeudasFlowStore((s) => s.closeCreate);

  const [direction, setDirection] = useState<DebtDirection>('incoming');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const deleteDebt = useDeleteDebt();
  const writeOff = useWriteOffDebt(today);
  const reopen = useReopenDebt(today);

  const active = useMemo(
    () =>
      (data?.debts ?? []).filter(
        (debt) =>
          debt.direction === direction &&
          debt.status !== 'paid' &&
          debt.status !== 'written_off',
      ),
    [data, direction],
  );

  /** Splits first, then the individual loans. A group is one entry either way. */
  const items = useMemo<Item[]>(() => {
    const eventIds = Array.from(
      new Set(active.filter((debt) => debt.eventId).map((debt) => debt.eventId!)),
    );
    return [
      ...eventIds.map((id) => ({ kind: 'event' as const, id })),
      ...active
        .filter((debt) => !debt.eventId)
        .map((debt) => ({ kind: 'debt' as const, id: debt.id })),
    ];
  }, [active]);

  if (isError) {
    return (
      <SafeAreaView
        edges={['top']}
        style={{ flex: 1, backgroundColor: theme.colors.bgBase }}
      >
        <RetryState
          titleKey="deudas.error.title"
          retryKey="deudas.error.retry"
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

  const side = direction === 'incoming' ? data.owedToMe : data.iOwe;

  const handleDelete = (id: string) => {
    closeDetail();
    deleteDebt.mutate(id, {
      onSuccess: () => setToast(t('deudas.detail.deleted')),
      onError: () => setToast(t('common.error')),
    });
  };

  const handleWriteOff = (id: string) => {
    writeOff.mutate(id, {
      onSuccess: () => {
        closeDetail();
        setToast(t('deudas.writeOff.toast'));
      },
      onError: () => setToast(t('common.error')),
    });
  };

  const handleReopen = (id: string) => {
    reopen.mutate(id, {
      onSuccess: () => setToast(t('deudas.writeOff.reopenToast')),
      onError: () => setToast(t('common.error')),
    });
  };

  return (
    <DebtsProvider snapshot={data}>
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
            <Text style={{ fontSize: 16, fontWeight: '500' }}>{t('deudas.title')}</Text>
          </View>

          <View style={{ paddingHorizontal: 24, paddingTop: 20 }}>
            <DirectionTabs direction={direction} onChange={setDirection} />
          </View>

          <DebtHero
            direction={direction}
            total={side.total}
            count={side.count}
            currency={currency}
          />

          <View style={{ paddingHorizontal: 26, paddingTop: 26 }}>
            {items.length === 0 ? (
              <EmptyDeudasState direction={direction} />
            ) : (
              items.map((item, index) => {
                const last = index === items.length - 1;
                if (item.kind === 'event') {
                  const event = data.events.find((one) => one.id === item.id);
                  if (!event) return null;
                  return (
                    <DeudaCardShared
                      key={item.id}
                      event={event}
                      debts={active.filter((debt) => debt.eventId === item.id)}
                      currency={currency}
                      expanded={expanded === item.id}
                      last={last}
                      onToggle={() => setExpanded(expanded === item.id ? null : item.id)}
                      onPersonPress={(debt) => openDetail(debt.id)}
                    />
                  );
                }
                const debt = active.find((one) => one.id === item.id);
                if (!debt) return null;
                const person = data.counterparties.find(
                  (one) => one.id === debt.counterpartyId,
                );
                return (
                  <DebtRow
                    key={debt.id}
                    deuda={debt}
                    name={person?.name ?? '—'}
                    detail={
                      debt.note?.trim() ||
                      t(
                        debt.direction === 'incoming'
                          ? 'deudas.detail.subTheyOweYou'
                          : 'deudas.detail.subYouOweThem',
                      )
                    }
                    currency={currency}
                    last={last}
                    onPress={() => openDetail(debt.id)}
                  />
                );
              })
            )}
          </View>

          <View style={{ paddingHorizontal: 24, paddingTop: 18 }}>
            <DashedButton
              label={t('deudas.newDebt')}
              onPress={() => openCreate(direction)}
            />
            <Text
              color={theme.colors.textTertiary}
              style={{ fontSize: 11, textAlign: 'center', marginTop: 12 }}
            >
              {t('deudas.voiceHint')}
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => setHistoryOpen(true)}
            style={({ pressed }) => ({
              alignSelf: 'center',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              minHeight: 44,
              paddingHorizontal: 8,
              marginTop: 6,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text color={theme.colors.textTertiary} style={{ fontSize: 12 }}>
              {t('deudas.viewHistory')}
            </Text>
            <Icon name="chevron-right" size={12} color={theme.colors.textTertiary} />
          </Pressable>
        </ScrollView>

        <DeudaDetailSheet
          debtId={selectedDebtId}
          currency={currency}
          writingOff={writeOff.isPending}
          onClose={closeDetail}
          onWriteOff={() => selectedDebtId && handleWriteOff(selectedDebtId)}
          onReopen={() => selectedDebtId && handleReopen(selectedDebtId)}
          onDelete={() => selectedDebtId && handleDelete(selectedDebtId)}
          onPaid={(amount) =>
            setToast(t('deudas.abono.toast', { amount: formatMoney(amount, currency) }))
          }
        />

        <NuevaDeudaSheet
          visible={createOpen}
          defaultDirection={createDirection}
          currency={currency}
          onClose={closeCreate}
          onCreated={setToast}
          onFailed={setToast}
        />

        <HistorySheet
          visible={historyOpen}
          currency={currency}
          onClose={() => setHistoryOpen(false)}
        />

        <Toast
          visible={toast !== null}
          message={toast ?? ''}
          onDismiss={() => setToast(null)}
        />
      </Aurora>
    </DebtsProvider>
  );
}
