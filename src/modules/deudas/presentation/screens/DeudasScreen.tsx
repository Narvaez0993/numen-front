import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FAB, Icon, RetryState, Text, Toast } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { toIsoDate } from '@/shared/presentation/utils/dates';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

import type { DebtDirection } from '../../domain';
import { DeudaCardIndividual } from '../components/DeudaCardIndividual';
import { DeudaCardShared } from '../components/DeudaCardShared';
import { DeudaDetail } from '../components/DeudaDetail';
import { DeudasHeader } from '../components/DeudasHeader';
import { DirectionTabs } from '../components/DirectionTabs';
import { EmptyDeudasState } from '../components/EmptyDeudasState';
import { NuevaDeudaFlow } from '../components/create-flow/NuevaDeudaFlow';
import { ConfirmDeleteSheet } from '../components/sheets/ConfirmDeleteSheet';
import { ConfirmWriteOffSheet } from '../components/sheets/ConfirmWriteOffSheet';
import { HistorySheet } from '../components/sheets/HistorySheet';
import { RegistrarAbonoSheet } from '../components/sheets/RegistrarAbonoSheet';
import { DebtsProvider } from '../context/DebtsContext';
import { useDeleteDebt, useReopenDebt, useWriteOffDebt } from '../hooks/useDebtMutations';
import { useDeudas } from '../hooks/useDeudas';
import { useDeudasFlowStore } from '../stores/useDeudasFlowStore';

/**
 * The ledger of who owes whom, running on the API.
 *
 * The prototype held everything in a zustand store, so a debt registered on Tuesday
 * was gone on Wednesday. The snapshot is the state now: every sheet calls its
 * mutation, the query refreshes, and the whole screen redraws from truth.
 */
export function DeudasScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();

  // Pinned once per mount: `status` (and so overdue) is derived for this day.
  const today = useMemo(() => toIsoDate(new Date()), []);
  const { data, isLoading, isError, refetch } = useDeudas(today);

  const selectedDebtId = useDeudasFlowStore((s) => s.selectedDebtId);
  const abonoForId = useDeudasFlowStore((s) => s.abonoForId);
  const createOpen = useDeudasFlowStore((s) => s.createOpen);
  const createDirection = useDeudasFlowStore((s) => s.createDirection);
  const openDetail = useDeudasFlowStore((s) => s.openDetail);
  const closeDetail = useDeudasFlowStore((s) => s.closeDetail);
  const openAbono = useDeudasFlowStore((s) => s.openAbono);
  const closeAbono = useDeudasFlowStore((s) => s.closeAbono);
  const openCreate = useDeudasFlowStore((s) => s.openCreate);
  const closeCreate = useDeudasFlowStore((s) => s.closeCreate);

  const [direction, setDirection] = useState<DebtDirection>('incoming');
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmWriteOffId, setConfirmWriteOffId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ visible: boolean; message: string }>({
    visible: false,
    message: '',
  });

  const deleteDebt = useDeleteDebt();
  const writeOffDebt = useWriteOffDebt(today);
  const reopenDebt = useReopenDebt(today);

  const activeDebts = useMemo(
    () =>
      (data?.debts ?? []).filter(
        (d) =>
          d.direction === direction && d.status !== 'paid' && d.status !== 'written_off',
      ),
    [data, direction],
  );

  // Group items: events first, then individuals
  const items = useMemo(() => {
    const individuals = activeDebts.filter((d) => !d.eventId);
    const eventIds = Array.from(
      new Set(activeDebts.filter((d) => d.eventId).map((d) => d.eventId!)),
    );
    return [
      ...eventIds.map((eid) => ({ type: 'event' as const, eventId: eid })),
      ...individuals.map((d) => ({ type: 'individual' as const, debt: d })),
    ];
  }, [activeDebts]);

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

  const showToast = (message: string) => setToast({ visible: true, message });

  const handleConfirmDelete = () => {
    const id = confirmDeleteId;
    setConfirmDeleteId(null);
    if (!id) return;
    closeDetail();
    deleteDebt.mutate(id, {
      onSuccess: () => showToast(t('deudas.detail.deleted')),
      onError: () => showToast(t('common.error')),
    });
  };

  const handleConfirmWriteOff = () => {
    const id = confirmWriteOffId;
    setConfirmWriteOffId(null);
    if (!id) return;
    writeOffDebt.mutate(id, {
      onSuccess: () => showToast(t('deudas.writeOff.toast')),
      onError: () => showToast(t('common.error')),
    });
  };

  const handleReopen = (id: string) => {
    reopenDebt.mutate(id, {
      onSuccess: () => showToast(t('deudas.writeOff.reopenToast')),
      onError: () => showToast(t('common.error')),
    });
  };

  const writeOffTarget = confirmWriteOffId
    ? data.debts.find((d) => d.id === confirmWriteOffId)
    : undefined;

  const sheets = (
    <>
      <RegistrarAbonoSheet
        visible={!!abonoForId}
        debtId={abonoForId}
        onClose={closeAbono}
        onSaved={(amount) =>
          showToast(t('deudas.abono.toast', { amount: formatMoney(amount) }))
        }
      />
      <NuevaDeudaFlow
        visible={createOpen}
        defaultDirection={createDirection}
        onClose={closeCreate}
        onCreated={showToast}
        onFailed={showToast}
      />
      <ConfirmDeleteSheet
        visible={confirmDeleteId !== null}
        onConfirm={handleConfirmDelete}
        onClose={() => setConfirmDeleteId(null)}
      />
      <ConfirmWriteOffSheet
        visible={writeOffTarget !== undefined}
        remaining={writeOffTarget?.remaining ?? 0}
        name={
          writeOffTarget
            ? (data.counterparties.find((c) => c.id === writeOffTarget.counterpartyId)
                ?.name ?? '')
            : ''
        }
        busy={writeOffDebt.isPending}
        onConfirm={handleConfirmWriteOff}
        onClose={() => setConfirmWriteOffId(null)}
      />
      <Toast
        visible={toast.visible}
        message={toast.message}
        onDismiss={() => setToast({ visible: false, message: '' })}
      />
    </>
  );

  // === DETAIL VIEW ===
  if (selectedDebtId) {
    const exists = data.debts.find((d) => d.id === selectedDebtId);
    if (!exists) {
      closeDetail();
      return null;
    }
    return (
      <DebtsProvider snapshot={data}>
        <SafeAreaView
          style={{ flex: 1, backgroundColor: theme.colors.bgBase }}
          edges={['top']}
        >
          <DeudaDetail
            debtId={selectedDebtId}
            onBack={closeDetail}
            onAbono={() => openAbono(selectedDebtId)}
            onDelete={() => setConfirmDeleteId(selectedDebtId)}
            onWriteOff={() => setConfirmWriteOffId(selectedDebtId)}
            onReopen={() => handleReopen(selectedDebtId)}
          />
          <FAB variant="pink" bottomOffset={28} onPress={() => openCreate(direction)} />
          {sheets}
        </SafeAreaView>
      </DebtsProvider>
    );
  }

  // === LIST VIEW ===
  const isEmpty = items.length === 0;

  return (
    <DebtsProvider snapshot={data}>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: theme.colors.bgBase }}
        edges={['top']}
      >
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 14,
            paddingBottom: 130,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ gap: 16 }}>
            <DeudasHeader
              onBack={() => router.back()}
              onProfile={() => router.push('/profile')}
            />
            <DirectionTabs direction={direction} onChange={setDirection} />

            {isEmpty ? (
              <EmptyDeudasState
                direction={direction}
                onCreate={() => openCreate(direction)}
              />
            ) : (
              <View style={{ gap: 10 }}>
                {items.map((item) => {
                  if (item.type === 'individual') {
                    return (
                      <DeudaCardIndividual
                        key={item.debt.id}
                        deuda={item.debt}
                        onPress={() => openDetail(item.debt.id)}
                      />
                    );
                  }
                  const ev = data.events.find((e) => e.id === item.eventId);
                  if (!ev) return null;
                  const eventDebts = activeDebts.filter(
                    (d) => d.eventId === item.eventId,
                  );
                  return (
                    <DeudaCardShared
                      key={item.eventId}
                      event={ev}
                      debts={eventDebts}
                      expanded={expandedEvent === item.eventId}
                      onToggle={() =>
                        setExpandedEvent(
                          expandedEvent === item.eventId ? null : item.eventId,
                        )
                      }
                      onPersonPress={(d) => openDetail(d.id)}
                    />
                  );
                })}
              </View>
            )}

            {!isEmpty ? (
              <Pressable
                onPress={() => setHistoryOpen(true)}
                style={({ pressed }) => ({
                  marginTop: 4,
                  alignSelf: 'center',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  paddingVertical: 12,
                  paddingHorizontal: 8,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Text
                  variant="label"
                  color={theme.colors.textSecondary}
                  style={{ fontSize: 12.5 }}
                >
                  {t('deudas.viewHistory')}
                </Text>
                <Icon name="chevron-right" size={12} color={theme.colors.textSecondary} />
              </Pressable>
            ) : null}
          </View>
        </ScrollView>

        <FAB variant="pink" onPress={() => openCreate(direction)} />

        <HistorySheet visible={historyOpen} onClose={() => setHistoryOpen(false)} />
        {sheets}
      </SafeAreaView>
    </DebtsProvider>
  );
}
