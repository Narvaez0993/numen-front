import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { useAccounts } from '@/modules/accounts/presentation/hooks/useAccounts';
import type { CurrencyCode } from '@/shared/domain';
import {
  AmountKeypad,
  ChooseSheet,
  KeypadAmount,
  SHEET_TOP,
  Segmented,
  SheetHeaderButton,
  SheetShell,
  Text,
  pressAmountKey,
} from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { addDays, toIsoDate } from '@/shared/presentation/utils/dates';

import type { DebtDirection } from '../../../domain';
import { useDebtsContext } from '../../context/DebtsContext';
import { useCreateDebt, useCreateSharedEvent } from '../../hooks/useDebtMutations';
import { debtTone } from '../../utils/debtTone';

import { DetailStep } from './DetailStep';
import { SplitStep } from './SplitStep';
import { WhoStep } from './WhoStep';
import { YoPongoMasSheet } from './YoPongoMasSheet';
import { pickKey, type PersonPick } from './personPick';

type Props = {
  visible: boolean;
  defaultDirection?: DebtDirection;
  currency: CurrencyCode;
  onClose: () => void;
  onCreated: (toast: string) => void;
  onFailed: (toast: string) => void;
};

type StepId = 'who' | 'amount' | 'split' | 'detail';

/** How long "recordármelo" means. Two weeks and a bit: long enough not to nag,
 *  short enough that the loan is still a recent thing to both of you. */
const REMIND_IN_DAYS = 15;

/** Below this it is a mis-tap, not a loan. */
const MIN_AMOUNT = 1000;

/** "No cash moved" is a real answer, not a skipped field: a split's bill already
 *  left as one expense. */
const NO_ACCOUNT = '__none__';

/**
 * `NUEVA DEUDA` — three steps, and a fourth only when the money is split.
 *
 * The design draws three: who, how much, the details. The fourth is the one it
 * does not have a picture for — dividing a bill between four people — and it
 * slots in right after the amount, because that is what it divides. The progress
 * bar is built from however many steps this particular debt has, so the counter
 * never promises a step that will not come.
 *
 * The direction switch lives on the amount step rather than the first one. It is
 * the field that decides what the number MEANS, and putting it beside the number
 * is what makes "me debe" and "yo le debo" impossible to get backwards.
 */
export function NuevaDeudaSheet({
  visible,
  defaultDirection = 'incoming',
  currency,
  onClose,
  onCreated,
  onFailed,
}: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { today } = useDebtsContext();
  const accounts = useAccounts();
  const createDebt = useCreateDebt(today);
  const createEvent = useCreateSharedEvent(today);
  const saving = createDebt.isPending || createEvent.isPending;

  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<DebtDirection>(defaultDirection);
  const [persons, setPersons] = useState<PersonPick[]>([]);
  const [digits, setDigits] = useState('');
  // `null` is a real answer, not "unanswered": a split moved no cash of its own.
  const [accountId, setAccountId] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [remind, setRemind] = useState(false);
  const [splits, setSplits] = useState<Record<string, number>>({});
  const [yoPongoOpen, setYoPongoOpen] = useState(false);
  const [accountPickerOpen, setAccountPickerOpen] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setIndex(0);
    setDirection(defaultDirection);
    setPersons([]);
    setDigits('');
    setAccountId(null);
    setNote('');
    setRemind(false);
    setSplits({});
    setYoPongoOpen(false);
    setAccountPickerOpen(false);
  }, [visible, defaultDirection]);

  const accountOptions = useMemo(
    () => [
      ...(accounts.data?.accounts ?? []).map((account) => ({
        value: account.id,
        label: account.name,
      })),
      { value: NO_ACCOUNT, label: t('deudas.account.none') },
    ],
    [accounts.data, t],
  );

  // Seed the first choice once the catalog lands, and never again: re-running
  // would overwrite whatever the user picked.
  useEffect(() => {
    if (accountId === null && (accounts.data?.accounts?.length ?? 0) > 0) {
      setAccountId(accounts.data?.accounts?.[0]?.id ?? null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accounts.data]);

  const amount = Number(digits || '0');
  const isShared = persons.length >= 2;

  const steps: StepId[] = useMemo(
    () => (isShared ? ['who', 'amount', 'split', 'detail'] : ['who', 'amount', 'detail']),
    [isShared],
  );
  const step = steps[Math.min(index, steps.length - 1)] ?? 'who';
  const last = index >= steps.length - 1;

  const splitsSum = persons.reduce((sum, pick) => sum + (splits[pickKey(pick)] ?? 0), 0);
  const yoShare = amount - splitsSum;
  const splitValid =
    isShared && yoShare >= 0 && persons.every((pick) => (splits[pickKey(pick)] ?? 0) > 0);

  const canContinue =
    step === 'who'
      ? persons.length >= 1
      : step === 'amount'
        ? amount >= MIN_AMOUNT
        : step === 'split'
          ? splitValid
          : true;

  const equalSplit = () => {
    if (!isShared || amount <= 0) return;
    // The user is one of the payers, so the bill divides by people + 1. Rounded
    // down to the hundred: nobody is owed 3.333,33.
    const each = Math.floor(amount / (persons.length + 1) / 100) * 100;
    const next: Record<string, number> = {};
    persons.forEach((pick) => {
      next[pickKey(pick)] = each;
    });
    setSplits(next);
  };

  const finalize = () => {
    if (saving) return;
    const dueOn = remind ? addDays(toIsoDate(new Date()), REMIND_IN_DAYS) : null;

    if (!isShared) {
      const person = persons[0];
      if (!person) return;
      createDebt.mutate(
        {
          direction,
          counterpartyId: person.id ?? undefined,
          counterpartyName: person.id === null ? person.name : undefined,
          amount,
          accountId,
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
      return;
    }

    // The note doubles as the event's name — "Cena del viernes" is the note you
    // would have written anyway.
    const eventName = note.trim() || t('deudas.create.defaultEventName');
    createEvent.mutate(
      {
        direction,
        name: eventName,
        total: amount,
        dueOn,
        splits: persons.map((pick) => ({
          counterpartyId: pick.id ?? undefined,
          counterpartyName: pick.id === null ? pick.name : undefined,
          amount: splits[pickKey(pick)] ?? 0,
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
  };

  const handlePrimary = () => {
    if (!canContinue) return;
    if (last) {
      finalize();
      return;
    }
    // Arriving at the split with nothing divided yet: even shares are the answer
    // nine times out of ten, and an empty form would ask for four numbers that
    // are already known.
    if (steps[index + 1] === 'split' && Object.keys(splits).length === 0) equalSplit();
    setIndex(index + 1);
  };

  const handleBack = () => {
    if (index === 0) onClose();
    else setIndex(index - 1);
  };

  const tone = debtTone(theme, direction);

  return (
    <SheetShell
      visible={visible}
      onClose={onClose}
      top={SHEET_TOP.create}
      header={
        <>
          <SheetHeaderButton
            icon={index === 0 ? 'x' : 'arrow-left'}
            label={t(index === 0 ? 'common.close' : 'common.back')}
            onPress={handleBack}
          />
          <View style={{ flex: 1, flexDirection: 'row', gap: 5 }}>
            {steps.map((id, at) => (
              <View
                key={id}
                style={{
                  flex: 1,
                  height: 3,
                  borderRadius: 2,
                  backgroundColor:
                    at <= index ? theme.palette.acc : theme.colors.bgElevated,
                }}
              />
            ))}
          </View>
          <Text
            tabular
            color={theme.colors.textTertiary}
            style={{ fontSize: 11.5 }}
          >{`${index + 1}/${steps.length}`}</Text>
        </>
      }
      overlays={
        <>
          <ChooseSheet
            visible={accountPickerOpen}
            title={t(
              direction === 'incoming'
                ? 'deudas.create.cameFrom'
                : 'deudas.create.wentTo',
            )}
            options={accountOptions}
            value={accountId ?? NO_ACCOUNT}
            onChange={(value) => setAccountId(value === NO_ACCOUNT ? null : value)}
            onClose={() => setAccountPickerOpen(false)}
          />
          <YoPongoMasSheet
            visible={yoPongoOpen}
            total={amount}
            currency={currency}
            personsCount={persons.length}
            onClose={() => setYoPongoOpen(false)}
            onApply={(mine) => {
              setYoPongoOpen(false);
              const left = Math.max(0, amount - mine);
              const each =
                persons.length > 0 ? Math.floor(left / persons.length / 100) * 100 : 0;
              const next: Record<string, number> = {};
              persons.forEach((pick) => {
                next[pickKey(pick)] = each;
              });
              setSplits(next);
            }}
          />
        </>
      }
    >
      <View style={{ paddingHorizontal: 26, paddingTop: 26 }}>
        <Text
          style={{
            fontSize: 24,
            lineHeight: 31,
            fontWeight: '300',
            letterSpacing: -0.7,
          }}
        >
          {t(`deudas.create.titles.${step}`, {
            name: persons[0]?.name ?? '',
            count: persons.length,
          })}
        </Text>
      </View>

      {step === 'who' ? (
        <WhoStep selected={persons} onChange={setPersons} />
      ) : step === 'amount' ? (
        <View style={{ flex: 1 }}>
          <View style={{ paddingHorizontal: 24, paddingTop: 20 }}>
            <Segmented
              value={direction}
              onChange={setDirection}
              options={[
                { value: 'incoming', label: t('deudas.create.theyOweMe') },
                { value: 'outgoing', label: t('deudas.create.iOweThem') },
              ]}
            />
          </View>
          <View style={{ paddingHorizontal: 26, paddingTop: 22 }}>
            <KeypadAmount digits={digits} currency={currency} color={tone} />
          </View>
          <View style={{ flex: 1 }} />
          <View style={{ paddingHorizontal: 20 }}>
            <AmountKeypad onKey={(key) => setDigits(pressAmountKey(digits, key))} />
          </View>
        </View>
      ) : step === 'split' ? (
        <SplitStep
          amount={amount}
          currency={currency}
          persons={persons}
          splits={splits}
          yoShare={yoShare}
          onEditSplit={(id, value) => setSplits((prev) => ({ ...prev, [id]: value }))}
          onEqualSplit={equalSplit}
          onYoPongoMas={() => setYoPongoOpen(true)}
        />
      ) : (
        <DetailStep
          direction={direction}
          isShared={isShared}
          amount={amount}
          currency={currency}
          persons={persons}
          note={note}
          onNote={setNote}
          accountLabel={
            accountOptions.find((option) => option.value === (accountId ?? NO_ACCOUNT))
              ?.label ?? t('deudas.account.none')
          }
          onPickAccount={() => setAccountPickerOpen(true)}
          remind={remind}
          onRemind={setRemind}
          remindInDays={REMIND_IN_DAYS}
        />
      )}

      <View style={{ paddingHorizontal: 22, paddingTop: 14, paddingBottom: 30 }}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: !canContinue || saving }}
          disabled={!canContinue || saving}
          onPress={handlePrimary}
          style={({ pressed }) => ({
            minHeight: 52,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 18,
            backgroundColor: theme.colors.textPrimary,
            opacity: !canContinue || saving ? 0.4 : pressed ? 0.9 : 1,
          })}
        >
          <Text color={theme.colors.bgBase} style={{ fontSize: 14, fontWeight: '600' }}>
            {t(last ? 'deudas.create.save' : 'deudas.create.next')}
          </Text>
        </Pressable>

        {step === 'who' ? (
          <Text
            color={theme.colors.textTertiary}
            style={{ fontSize: 11, textAlign: 'center', marginTop: 12 }}
          >
            {t('deudas.create.voiceHint')}
          </Text>
        ) : null}
      </View>
    </SheetShell>
  );
}
