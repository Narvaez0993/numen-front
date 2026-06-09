import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FAB, Icon, Text, Toast } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { formatCOP } from '@/shared/presentation/utils/formatCOP';

import { type DebtDirection, debtStatus } from '../../domain/types/Deuda';
import { DeudaCardIndividual } from '../components/DeudaCardIndividual';
import { DeudaCardShared } from '../components/DeudaCardShared';
import { DeudaDetail } from '../components/DeudaDetail';
import { DeudasHeader } from '../components/DeudasHeader';
import { DirectionTabs } from '../components/DirectionTabs';
import { EmptyDeudasState } from '../components/EmptyDeudasState';
import { NuevaDeudaFlow } from '../components/create-flow/NuevaDeudaFlow';
import { RegistrarAbonoSheet } from '../components/sheets/RegistrarAbonoSheet';
import { useDeudas } from '../hooks/useDeudas';
import { useDeudasStore } from '../stores/useDeudasStore';
import { useDeudasFlowStore } from '../stores/useDeudasFlowStore';

export function DeudasScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { isLoading } = useDeudas();

  const allDebts = useDeudasStore((s) => s.debts);
  const events = useDeudasStore((s) => s.events);
  const today = useDeudasStore((s) => s.today);
  const initialized = useDeudasStore((s) => s.initialized);

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
  const [expandedEvent, setExpandedEvent] = useState<string | null>('ev-comida');
  const [toast, setToast] = useState<{ visible: boolean; message: string }>({
    visible: false,
    message: '',
  });

  const activeDebts = useMemo(
    () =>
      allDebts.filter(
        (d) => d.direction === direction && debtStatus(d, today) !== 'paid',
      ),
    [allDebts, direction, today],
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

  if (isLoading || !initialized) {
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

  // === DETAIL VIEW ===
  if (selectedDebtId) {
    const exists = allDebts.find((d) => d.id === selectedDebtId);
    if (!exists) {
      closeDetail();
      return null;
    }
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: theme.colors.bgBase }}
        edges={['top']}
      >
        <DeudaDetail
          debtId={selectedDebtId}
          onBack={closeDetail}
          onAbono={() => openAbono(selectedDebtId)}
        />
        <FAB variant="pink" bottomOffset={28} onPress={() => openCreate(direction)} />
        <RegistrarAbonoSheet
          visible={!!abonoForId}
          debtId={abonoForId}
          onClose={closeAbono}
          onSaved={(amount) => {
            setToast({
              visible: true,
              message: t('deudas.abono.toast', { amount: formatCOP(amount) }),
            });
          }}
        />
        <NuevaDeudaFlow
          visible={createOpen}
          defaultDirection={createDirection}
          onClose={closeCreate}
          onCreated={(msg) => setToast({ visible: true, message: msg })}
        />
        <Toast
          visible={toast.visible}
          message={toast.message}
          onDismiss={() => setToast({ visible: false, message: '' })}
        />
      </SafeAreaView>
    );
  }

  // === LIST VIEW ===
  const isEmpty = items.length === 0;

  return (
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
                const ev = events.find((e) => e.id === item.eventId);
                if (!ev) return null;
                const eventDebts = activeDebts.filter((d) => d.eventId === item.eventId);
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

      <RegistrarAbonoSheet
        visible={!!abonoForId}
        debtId={abonoForId}
        onClose={closeAbono}
        onSaved={(amount) => {
          setToast({
            visible: true,
            message: t('deudas.abono.toast', { amount: formatCOP(amount) }),
          });
        }}
      />
      <NuevaDeudaFlow
        visible={createOpen}
        defaultDirection={createDirection}
        onClose={closeCreate}
        onCreated={(msg) => setToast({ visible: true, message: msg })}
      />
      <Toast
        visible={toast.visible}
        message={toast.message}
        onDismiss={() => setToast({ visible: false, message: '' })}
      />
    </SafeAreaView>
  );
}
