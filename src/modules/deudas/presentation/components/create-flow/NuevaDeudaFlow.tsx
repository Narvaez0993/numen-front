import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { SegmentProgress } from '@/modules/onboarding/presentation/components/SegmentProgress';
import { Button, Icon, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

import type {
  Counterparty,
  DebtDirection,
  Deuda,
  SharedEvent,
} from '../../../domain/types/Deuda';
import { useDeudasStore } from '../../stores/useDeudasStore';

import { Step1 } from './Step1';
import { Step2 } from './Step2';
import { Step3 } from './Step3';
import { YoPongoMasSheet } from './YoPongoMasSheet';

type Props = {
  visible: boolean;
  defaultDirection?: DebtDirection;
  onClose: () => void;
  onCreated: (toast: string) => void;
};

const newId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

export function NuevaDeudaFlow({
  visible,
  defaultDirection = 'incoming',
  onClose,
  onCreated,
}: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const today = useDeudasStore((s) => s.today);
  const addDeuda = useDeudasStore((s) => s.addDeuda);
  const addSharedEvent = useDeudasStore((s) => s.addSharedEvent);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [direction, setDirection] = useState<DebtDirection>(defaultDirection);
  const [persons, setPersons] = useState<Counterparty[]>([]);
  const [amount, setAmount] = useState(0);
  const [isExpense, setIsExpense] = useState(true);
  const [category, setCategory] = useState<string | null>(null);
  const [account, setAccount] = useState('BBVA Débito');
  const [date, setDate] = useState('Hoy · 14 may');
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [splits, setSplits] = useState<Record<string, number>>({});
  const [yoPongoOpen, setYoPongoOpen] = useState(false);

  useEffect(() => {
    if (visible) {
      setStep(1);
      setDirection(defaultDirection);
      setPersons([]);
      setAmount(0);
      setIsExpense(true);
      setCategory(null);
      setAccount('BBVA Débito');
      setDate('Hoy · 14 may');
      setDueDate(null);
      setNote('');
      setSplits({});
      setYoPongoOpen(false);
    }
  }, [visible, defaultDirection]);

  const isShared = persons.length >= 2;
  const totalSteps: 2 | 3 = isShared ? 3 : 2;

  const splitsSum = useMemo(
    () => persons.reduce((s, p) => s + (splits[p.id] ?? 0), 0),
    [persons, splits],
  );
  const yoShare = amount - splitsSum;
  const eachEqual = useMemo(() => {
    if (!isShared || amount <= 0) return 0;
    return Math.floor(amount / (persons.length + 1) / 100) * 100;
  }, [isShared, amount, persons.length]);
  const isEqual =
    isShared &&
    persons.length > 0 &&
    persons.every(
      (p) => (splits[p.id] ?? 0) > 0 && Math.abs((splits[p.id] ?? 0) - eachEqual) < 100,
    );

  const splitValid =
    isShared && yoShare >= 0 && persons.every((p) => (splits[p.id] ?? 0) > 0);
  const splitOverage = splitsSum > amount;

  const canStep1 = persons.length >= 1;
  const canStep2 = amount >= 1000;
  const canStep3 = splitValid && !splitOverage;

  const handleEqualSplit = () => {
    if (!isShared || amount <= 0) return;
    const each = Math.floor(amount / (persons.length + 1) / 100) * 100;
    const ns: Record<string, number> = {};
    persons.forEach((p) => {
      ns[p.id] = each;
    });
    setSplits(ns);
  };

  const handleYoPongoMasApply = (yoAmount: number) => {
    setYoPongoOpen(false);
    const remaining = Math.max(0, amount - yoAmount);
    const each =
      persons.length > 0 ? Math.floor(remaining / persons.length / 100) * 100 : 0;
    const ns: Record<string, number> = {};
    persons.forEach((p) => {
      ns[p.id] = each;
    });
    setSplits(ns);
  };

  const handleEditSplit = (pid: string, v: number) => {
    setSplits((prev) => ({ ...prev, [pid]: v }));
  };

  const finalize = () => {
    if (!isShared) {
      const person = persons[0];
      if (!person) return;
      const deuda: Deuda = {
        id: newId('d'),
        direction,
        counterpartyId: person.id,
        amount,
        balance: amount,
        createdAt: today,
        dueDate,
        note: note || null,
        payments: [],
        eventId: null,
        isExpense: direction === 'incoming' ? isExpense : undefined,
        category: direction === 'incoming' && isExpense ? (category ?? null) : undefined,
      };
      addDeuda(deuda);
      onCreated(t('deudas.create.toastIndividual', { name: person.name }));
    } else {
      const eventId = newId('ev');
      const eventName = note.trim() || t('deudas.create.step2.titleShared');
      const debts: Deuda[] = persons.map((p) => ({
        id: newId('d'),
        direction,
        counterpartyId: p.id,
        amount: splits[p.id] ?? 0,
        balance: splits[p.id] ?? 0,
        createdAt: today,
        dueDate,
        note: null,
        payments: [],
        eventId,
        isExpense: direction === 'incoming' ? isExpense : undefined,
        category: direction === 'incoming' && isExpense ? (category ?? null) : undefined,
      }));
      const event: SharedEvent = {
        id: eventId,
        name: eventName,
        icon: category ? 'tools-kitchen-2' : 'users',
        iconColor: 'purple',
        totalAmount: amount,
        date: today,
        debtIds: debts.map((d) => d.id),
      };
      addSharedEvent(event, debts);
      onCreated(t('deudas.create.toastShared', { event: eventName }));
    }
    onClose();
  };

  const handlePrimary = () => {
    if (step === 1 && canStep1) {
      setStep(2);
      return;
    }
    if (step === 2 && canStep2) {
      if (isShared) {
        if (Object.keys(splits).length === 0) {
          const each = Math.floor(amount / (persons.length + 1) / 100) * 100;
          const ns: Record<string, number> = {};
          persons.forEach((p) => {
            ns[p.id] = each;
          });
          setSplits(ns);
        }
        setStep(3);
      } else {
        finalize();
      }
      return;
    }
    if (step === 3 && canStep3) finalize();
  };

  const handleBack = () => {
    if (step === 1) onClose();
    else setStep((step - 1) as 1 | 2 | 3);
  };

  const primaryLabel =
    step === 3
      ? t('deudas.create.saveShared')
      : step === 2 && !isShared
        ? t('deudas.create.saveIndividual')
        : t('deudas.create.next');

  const primaryEnabled = step === 1 ? canStep1 : step === 2 ? canStep2 : canStep3;

  const insets = useSafeAreaInsets();
  const topPad = Math.max(insets.top, 44) + 8;

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      statusBarTranslucent
      onRequestClose={handleBack}
    >
      <SafeAreaView
        edges={['bottom']}
        style={{ flex: 1, backgroundColor: theme.colors.bgBase }}
      >
        <View
          style={{
            paddingTop: topPad,
            paddingBottom: 10,
            paddingHorizontal: 14,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
          }}
        >
          <Pressable
            onPress={handleBack}
            hitSlop={14}
            style={({ pressed }) => ({
              width: 42,
              height: 42,
              borderRadius: 13,
              backgroundColor: theme.colors.bgSurface,
              borderWidth: 1,
              borderColor: theme.colors.borderSubtle,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <Icon
              name={step === 1 ? 'x' : 'arrow-left'}
              size={16}
              stroke={1.9}
              color={theme.colors.textSecondary}
            />
          </Pressable>
          <Text
            variant="micro"
            uppercase
            color={theme.colors.textTertiary}
            style={{ fontSize: 11, letterSpacing: 1.1, fontFamily: 'Geist_500Medium' }}
          >
            {t('deudas.create.step', { current: step, total: totalSteps })}
          </Text>
          <View style={{ width: 42 }} />
        </View>

        <View style={{ paddingHorizontal: 18, paddingBottom: 14 }}>
          <SegmentProgress total={totalSteps} current={step - 1} />
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 14,
            paddingBottom: 24,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {step === 1 ? (
            <Step1
              direction={direction}
              onDirectionChange={setDirection}
              persons={persons}
              onPersonsChange={setPersons}
            />
          ) : step === 2 ? (
            <Step2
              direction={direction}
              isShared={isShared}
              amount={amount}
              onAmountChange={setAmount}
              isExpense={isExpense}
              onExpenseChange={setIsExpense}
              category={category}
              onCategoryChange={setCategory}
              account={account}
              onAccountChange={setAccount}
              date={date}
              onDateChange={setDate}
              dueDate={dueDate}
              onDueDateChange={setDueDate}
              note={note}
              onNoteChange={setNote}
            />
          ) : (
            <Step3
              amount={amount}
              persons={persons}
              splits={splits}
              yoShare={yoShare}
              splitsSum={splitsSum}
              isEqual={isEqual}
              splitValid={splitValid}
              splitOverage={splitOverage}
              onEditSplit={handleEditSplit}
              onEqualSplit={handleEqualSplit}
              onYoPongoMas={() => setYoPongoOpen(true)}
            />
          )}
        </ScrollView>

        <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24 }}>
          <Button
            full
            label={primaryLabel}
            disabled={!primaryEnabled}
            onPress={handlePrimary}
          />
        </View>

        <YoPongoMasSheet
          visible={yoPongoOpen}
          total={amount}
          personsCount={persons.length}
          onClose={() => setYoPongoOpen(false)}
          onApply={handleYoPongoMasApply}
        />
      </SafeAreaView>
    </Modal>
  );
}
