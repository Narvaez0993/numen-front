import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { SegmentProgress } from '@/modules/onboarding/presentation/components/SegmentProgress';
import { Button, Icon, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

import type { DebtDirection } from '../../../domain';
import { useDebtsContext } from '../../context/DebtsContext';
import { useCreateDebt, useCreateSharedEvent } from '../../hooks/useDebtMutations';

import { Step1 } from './Step1';
import { Step2 } from './Step2';
import { Step3 } from './Step3';
import { YoPongoMasSheet } from './YoPongoMasSheet';
import { pickKey, type PersonPick } from './personPick';

type Props = {
  visible: boolean;
  defaultDirection?: DebtDirection;
  onClose: () => void;
  onCreated: (toast: string) => void;
  onFailed: (toast: string) => void;
};

export function NuevaDeudaFlow({
  visible,
  defaultDirection = 'incoming',
  onClose,
  onCreated,
  onFailed,
}: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { today } = useDebtsContext();
  const createDebt = useCreateDebt(today);
  const createEvent = useCreateSharedEvent(today);
  const saving = createDebt.isPending || createEvent.isPending;

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [direction, setDirection] = useState<DebtDirection>(defaultDirection);
  const [persons, setPersons] = useState<PersonPick[]>([]);
  const [amount, setAmount] = useState(0);
  const [dueOn, setDueOn] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [splits, setSplits] = useState<Record<string, number>>({});
  const [yoPongoOpen, setYoPongoOpen] = useState(false);

  useEffect(() => {
    if (visible) {
      setStep(1);
      setDirection(defaultDirection);
      setPersons([]);
      setAmount(0);
      setDueOn(null);
      setNote('');
      setSplits({});
      setYoPongoOpen(false);
    }
  }, [visible, defaultDirection]);

  const isShared = persons.length >= 2;
  const totalSteps: 2 | 3 = isShared ? 3 : 2;

  const splitsSum = useMemo(
    () => persons.reduce((sum, p) => sum + (splits[pickKey(p)] ?? 0), 0),
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
      (p) =>
        (splits[pickKey(p)] ?? 0) > 0 &&
        Math.abs((splits[pickKey(p)] ?? 0) - eachEqual) < 100,
    );

  const splitValid =
    isShared && yoShare >= 0 && persons.every((p) => (splits[pickKey(p)] ?? 0) > 0);
  const splitOverage = splitsSum > amount;

  const canStep1 = persons.length >= 1;
  const canStep2 = amount >= 1000;
  const canStep3 = splitValid && !splitOverage;

  const handleEqualSplit = () => {
    if (!isShared || amount <= 0) return;
    const each = Math.floor(amount / (persons.length + 1) / 100) * 100;
    const ns: Record<string, number> = {};
    persons.forEach((p) => {
      ns[pickKey(p)] = each;
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
      ns[pickKey(p)] = each;
    });
    setSplits(ns);
  };

  const handleEditSplit = (pid: string, v: number) => {
    setSplits((prev) => ({ ...prev, [pid]: v }));
  };

  const finalize = () => {
    if (saving) return;
    if (!isShared) {
      const person = persons[0];
      if (!person) return;
      createDebt.mutate(
        {
          direction,
          counterpartyId: person.id ?? undefined,
          counterpartyName: person.id === null ? person.name : undefined,
          amount,
          dueOn,
          note: note.trim() || null,
        },
        {
          onSuccess: () => {
            onCreated(t('deudas.create.toastIndividual', { name: person.name }));
            onClose();
          },
          onError: (error) => {
            onFailed(error.message || t('common.error'));
            onClose();
          },
        },
      );
    } else {
      // The note doubles as the event's name — "Cena del viernes" is the note you
      // would have written anyway.
      const eventName = note.trim() || t('deudas.create.step2.titleShared');
      createEvent.mutate(
        {
          direction,
          name: eventName,
          total: amount,
          dueOn,
          splits: persons.map((p) => ({
            counterpartyId: p.id ?? undefined,
            counterpartyName: p.id === null ? p.name : undefined,
            amount: splits[pickKey(p)] ?? 0,
          })),
        },
        {
          onSuccess: () => {
            onCreated(t('deudas.create.toastShared', { event: eventName }));
            onClose();
          },
          onError: (error) => {
            onFailed(error.message || t('common.error'));
            onClose();
          },
        },
      );
    }
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
            ns[pickKey(p)] = each;
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
              dueOn={dueOn}
              onDueOnChange={setDueOn}
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
            disabled={!primaryEnabled || saving}
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
