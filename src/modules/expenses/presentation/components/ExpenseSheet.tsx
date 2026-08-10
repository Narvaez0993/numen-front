import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type {
  CapturedRecord,
  DebtDraftOverrides,
  DraftOverrides,
} from '@/modules/assistant/domain/types/Assistant';
import { DebtPaymentAccountRequiredError } from '@/modules/assistant/domain';
import {
  useConfirmDebtDraft,
  useConfirmDraft,
  useDiscardDebtDraft,
  useDiscardDraft,
} from '@/modules/assistant/presentation/hooks/useAssistantMutations';
import { useAccounts } from '@/modules/accounts/presentation/hooks/useAccounts';
import { useCategories } from '@/modules/categories/presentation/hooks/useCategories';
import {
  useDeleteDebt,
  useRemoveDebtPayment,
} from '@/modules/deudas/presentation/hooks/useDebtMutations';
import {
  overridesFromMovement,
  prefillFromDraft,
} from '@/modules/assistant/presentation/utils/draftForm';
import { useCreateMovement } from '@/modules/movements/presentation/hooks/useCreateMovement';
import { useDeleteMovement } from '@/modules/movements/presentation/hooks/useMovementMutations';
import type { NewMovement } from '@/modules/movements/domain';
import { DatePickerSheet, Toast } from '@/shared/presentation/components';
import { ChooseSheet } from '@/shared/presentation/components/ChooseSheet';
import { useCurrencyStore } from '@/shared/presentation/currency/useCurrencyStore';
import { dayLabel, toIsoDate } from '@/shared/presentation/utils/dates';
import { formatAmountDigits } from '@/shared/presentation/utils/formatMoney';

import { useVoiceCapture } from '../hooks/useVoiceCapture';
import { useExpenseSheetStore } from '../stores/useExpenseSheetStore';

import { CaptureScreen, type DetectedCardModel } from './CaptureScreen';
import { CorrectSheet } from './CorrectSheet';
import { ManualSheet } from './ManualSheet';

/** Local, per-card corrections made from the chips before anything is saved.
 *  Nothing here has touched the server yet — Registrar is what commits them. */
type Edit = {
  digits?: string;
  description?: string;
  categoryId?: string;
  sourceKey?: string;
  occurredOn?: string;
};

/** Which inline picker a chip opened, and for which card. */
type OpenPicker = { card: string; field: 'category' | 'source' } | null;

const refKey = (type: string, id: string) => `${type}:${id}`;

export function ExpenseSheet() {
  const { t, i18n } = useTranslation();
  const currency = useCurrencyStore((s) => s.currency);
  const language = i18n.language.startsWith('en') ? 'en' : 'es';

  const open = useExpenseSheetStore((s) => s.open);
  const flow = useExpenseSheetStore((s) => s.flow);
  const closeSheet = useExpenseSheetStore((s) => s.closeSheet);
  const setFlow = useExpenseSheetStore((s) => s.setFlow);
  const initialType = useExpenseSheetStore((s) => s.initialType);
  const drafts = useExpenseSheetStore((s) => s.drafts);
  const debtDrafts = useExpenseSheetStore((s) => s.debtDrafts);
  const editing = useExpenseSheetStore((s) => s.editing);
  const transcript = useExpenseSheetStore((s) => s.transcript);
  const notice = useExpenseSheetStore((s) => s.notice);
  const setDrafts = useExpenseSheetStore((s) => s.setDrafts);
  const setDebtDrafts = useExpenseSheetStore((s) => s.setDebtDrafts);
  const saved = useExpenseSheetStore((s) => s.saved);
  const setSaved = useExpenseSheetStore((s) => s.setSaved);

  const today = useMemo(() => toIsoDate(new Date()), []);
  const capture = useVoiceCapture();
  const categories = useCategories();
  const accounts = useAccounts();
  const createMovement = useCreateMovement();
  const confirmDraft = useConfirmDraft(today);
  const discardDraft = useDiscardDraft();
  const confirmDebtDraft = useConfirmDebtDraft(today);
  const discardDebtDraft = useDiscardDebtDraft();
  const deleteMovement = useDeleteMovement();
  const deleteDebt = useDeleteDebt();
  const removeDebtPayment = useRemoveDebtPayment(today);

  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [edits, setEdits] = useState<Record<string, Edit>>({});
  const [correcting, setCorrecting] = useState<string | null>(null);
  const [picker, setPicker] = useState<OpenPicker>(null);
  const [datePickerFor, setDatePickerFor] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    records: CapturedRecord[];
  } | null>(null);

  // The screen stays mounted between captures, so a failure from the last one
  // used to greet the next card before the user had pressed anything.
  useEffect(() => {
    setError(null);
  }, [open, drafts, debtDrafts]);

  // A new capture starts with no corrections carried over from the last one.
  useEffect(() => {
    if (!open) setEdits({});
  }, [open]);

  const sourceOptions = useMemo(
    () => [
      ...(accounts.data?.accounts ?? []).map((account) => ({
        value: refKey('account', account.id),
        label: account.name,
      })),
      ...(accounts.data?.creditCards ?? []).map((card) => ({
        value: refKey('credit_card', card.id),
        label: card.name,
      })),
    ],
    [accounts.data],
  );

  const editOf = (id: string): Edit => edits[id] ?? {};
  const patch = (id: string, next: Edit) =>
    setEdits((current) => ({ ...current, [id]: { ...current[id], ...next } }));

  const understood = drafts.length + debtDrafts.length > 0;
  const state = understood
    ? 'understood'
    : flow === 'recording'
      ? 'recording'
      : flow === 'processing'
        ? 'processing'
        : 'empty';

  /** A movement draft, dressed as a card with its chips. */
  const movementCards: DetectedCardModel[] = drafts.map((draft) => {
    const edit = editOf(draft.id);
    const categoryId = edit.categoryId ?? draft.categoryId;
    const sourceKey =
      edit.sourceKey ??
      (draft.sourceId !== null && draft.sourceType !== null
        ? refKey(draft.sourceType, draft.sourceId)
        : null);
    const occurredOn = edit.occurredOn ?? draft.occurredOn;
    const digits = edit.digits ?? String(draft.amount);

    return {
      id: draft.id,
      title: edit.description ?? draft.description,
      amount: formatAmountDigits(digits, currency),
      sign: draft.type === 'income' ? '+$' : draft.type === 'transfer' ? '$' : '−$',
      income: draft.type === 'income',
      onEdit: () => setCorrecting(draft.id),
      onRemove: () => handleRemoveDraft(draft.id),
      chips: [
        ...(draft.type === 'transfer'
          ? []
          : [
              {
                key: 'category',
                label:
                  categories.data?.find((c) => c.id === categoryId)?.name ??
                  t('expenses.capture.chip.category'),
                onPress: () => setPicker({ card: draft.id, field: 'category' }),
              },
            ]),
        {
          key: 'source',
          label:
            sourceOptions.find((option) => option.value === sourceKey)?.label ??
            t('expenses.capture.chip.source'),
          onPress: () => setPicker({ card: draft.id, field: 'source' }),
        },
        {
          key: 'date',
          label: dayLabel(occurredOn, today, language, {
            today: t('movements.days.today'),
            yesterday: t('movements.days.yesterday'),
          }),
          onPress: () => setDatePickerFor(draft.id),
        },
      ],
    };
  });

  /** A debt draft. Its direction is a statement, not a field: it is what the
   *  sentence was, and changing it here would mean the app misheard, not that
   *  the user changed their mind. */
  const debtCards: DetectedCardModel[] = debtDrafts.map((draft) => {
    const edit = editOf(draft.id);
    const sourceKey =
      edit.sourceKey ?? (draft.accountId ? refKey('account', draft.accountId) : null);
    const digits = edit.digits ?? String(draft.amount);

    return {
      id: draft.id,
      title:
        edit.description ?? (draft.counterpartyName || t('assistant.debtDraft.someone')),
      amount: formatAmountDigits(digits, currency),
      sign: draft.direction === 'incoming' ? '+$' : '−$',
      income: draft.direction === 'incoming',
      onEdit: () => setCorrecting(draft.id),
      onRemove: () => handleRemoveDebtDraft(draft.id),
      chips: [
        {
          key: 'kind',
          label: t(
            draft.kind === 'payment'
              ? 'assistant.debtDraft.paymentPill'
              : `assistant.debtDraft.direction.${draft.direction}`,
          ),
          fixed: true,
        },
        {
          key: 'source',
          label:
            sourceOptions.find((option) => option.value === sourceKey)?.label ??
            t('expenses.capture.chip.source'),
          onPress: () => setPicker({ card: draft.id, field: 'source' }),
        },
      ],
    };
  });

  const cards = [...movementCards, ...debtCards];

  const handleRemoveDraft = (id: string) => {
    discardDraft.mutate(id, {
      onError: () => setError(t('assistant.errors.discardFailed')),
    });
    setDrafts(drafts.filter((entry) => entry.id !== id));
    setCorrecting(null);
  };

  const handleRemoveDebtDraft = (id: string) => {
    discardDebtDraft.mutate(id, {
      onError: () => setError(t('assistant.errors.discardFailed')),
    });
    setDebtDrafts(debtDrafts.filter((entry) => entry.id !== id));
    setCorrecting(null);
  };

  /**
   * One button, every card.
   *
   * The old screen confirmed them one at a time, which turned "un café y unas
   * papitas" into two decisions about things the user had already decided when
   * they spoke. The corrections made with the chips ride along here — they never
   * touched the server before this, so nothing is half-applied if it fails.
   */
  const handleRegister = async () => {
    setError(null);
    setSaving(true);
    const records: CapturedRecord[] = [];
    let failed = false;

    for (const draft of drafts) {
      const edit = editOf(draft.id);
      const overrides: DraftOverrides = {};
      if (edit.digits !== undefined) overrides.amount = Number(edit.digits || '0');
      if (edit.description !== undefined) overrides.description = edit.description;
      if (edit.categoryId !== undefined) overrides.categoryId = edit.categoryId;
      if (edit.occurredOn !== undefined) overrides.occurredOn = edit.occurredOn;
      if (edit.sourceKey !== undefined) {
        const [type, ...rest] = edit.sourceKey.split(':');
        overrides.sourceType = type as 'account' | 'credit_card';
        overrides.sourceId = rest.join(':');
      }
      try {
        const done = await confirmDraft.mutateAsync({
          draftId: draft.id,
          overrides: Object.keys(overrides).length > 0 ? overrides : undefined,
        });
        records.push({ kind: 'movement', movementId: done.movementId });
      } catch {
        failed = true;
      }
    }

    for (const draft of debtDrafts) {
      const edit = editOf(draft.id);
      const overrides: DebtDraftOverrides = {};
      if (edit.digits !== undefined) overrides.amount = Number(edit.digits || '0');
      if (edit.sourceKey !== undefined) {
        overrides.accountId = edit.sourceKey.split(':').slice(1).join(':');
      }
      try {
        const done = await confirmDebtDraft.mutateAsync({
          draftId: draft.id,
          overrides: Object.keys(overrides).length > 0 ? overrides : undefined,
        });
        records.push(
          done.movementId !== null
            ? { kind: 'payment', debtId: done.debtId, movementId: done.movementId }
            : { kind: 'debt', debtId: done.debtId },
        );
      } catch (err) {
        failed = true;
        if (err instanceof DebtPaymentAccountRequiredError) {
          setError(t('assistant.debtDraft.accountRequired'));
        }
      }
    }

    setSaving(false);
    if (failed) {
      setError((current) => current ?? t('assistant.errors.confirmFailed'));
      return;
    }
    setSaved(records);
    closeSheet();
  };

  const handleSaveManual = (movement: NewMovement) => {
    setError(null);
    if (editing !== null) {
      // Editing an agent draft: the form's picture confirms THROUGH the draft, so
      // it settles as `confirmed` instead of leaving a pending twin.
      confirmDraft.mutate(
        { draftId: editing.id, overrides: overridesFromMovement(movement) },
        {
          onSuccess: () => {
            setToast({
              message: t(`expenses.toast.saved.${movement.type}`),
              records: [],
            });
            closeSheet();
          },
          onError: () => setError(t('expenses.toast.saveFailed')),
        },
      );
      return;
    }
    createMovement.mutate(
      // A key per attempt: if the request is retried the API returns the original
      // movement instead of charging the user twice.
      { movement, idempotencyKey: `${movement.occurredOn}-${Date.now()}` },
      {
        onSuccess: (created) => {
          setToast({
            message: t(`expenses.toast.saved.${movement.type}`),
            records: [{ kind: 'movement', movementId: created.id }],
          });
          closeSheet();
        },
        onError: () => setError(t('expenses.toast.saveFailed')),
      },
    );
  };

  /**
   * Undo is a real revert, and it is not one operation.
   *
   * A movement is deleted. A new debt is deleted, which takes its loan transfer
   * with it. An abono is undone by deleting the movement that carried it — the
   * debt has to survive that one, or undoing a repayment would erase the loan.
   */
  const handleUndo = () => {
    if (!toast || toast.records.length === 0) return;
    const { records } = toast;
    setToast(null);
    setSaved(null);
    const failed = () => setError(t('movements.errors.undoFailed'));
    for (const record of records) {
      if (record.kind === 'movement') {
        deleteMovement.mutate(record.movementId, { onError: failed });
      } else if (record.kind === 'debt') {
        deleteDebt.mutate(record.debtId, { onError: failed });
      } else {
        removeDebtPayment.mutate(
          { id: record.debtId, paymentId: record.movementId },
          { onError: failed },
        );
      }
    }
  };

  useEffect(() => {
    if (saved === null || saved.length === 0) return;
    setToast({
      message:
        saved.length > 1
          ? t('expenses.toast.savedMany', { count: saved.length })
          : t('expenses.toast.savedOne'),
      records: saved,
    });
    setSaved(null);
  }, [saved, setSaved, t]);

  const correctingDraft = drafts.find((draft) => draft.id === correcting) ?? null;
  const correctingDebt = debtDrafts.find((draft) => draft.id === correcting) ?? null;
  const correctingEdit = correcting !== null ? editOf(correcting) : {};

  return (
    <>
      <CaptureScreen
        visible={open && flow !== 'manual'}
        state={state}
        text={capture.text}
        onChangeText={capture.setText}
        transcript={capture.liveTranscript}
        phrase={transcript}
        cards={cards}
        level={capture.level}
        elapsed={capture.elapsed}
        notice={notice}
        error={error ?? capture.inlineError}
        saving={saving}
        onSend={capture.submitTyped}
        onStartRecording={capture.onMicPress}
        onStopRecording={capture.onMicPress}
        onCancelRecording={capture.onCancelRecording}
        onRegister={() => void handleRegister()}
        onRetry={capture.onRetry}
        onFillByHand={() => setFlow('manual')}
        onClose={closeSheet}
      />

      <ManualSheet
        visible={open && flow === 'manual'}
        initialType={initialType}
        initialValues={editing !== null ? prefillFromDraft(editing) : undefined}
        onSave={handleSaveManual}
        onSpeak={() => setFlow('entry')}
        onClose={closeSheet}
        saving={createMovement.isPending || confirmDraft.isPending}
        errorMessage={error}
      />

      <CorrectSheet
        visible={correcting !== null}
        digits={
          correctingEdit.digits ??
          String(correctingDraft?.amount ?? correctingDebt?.amount ?? 0)
        }
        description={
          correctingEdit.description ??
          correctingDraft?.description ??
          correctingDebt?.counterpartyName ??
          ''
        }
        currency={currency}
        sign={
          correctingDraft?.type === 'income' || correctingDebt?.direction === 'incoming'
            ? '+'
            : '−'
        }
        income={
          correctingDraft?.type === 'income' || correctingDebt?.direction === 'incoming'
        }
        onClose={() => setCorrecting(null)}
        onRemove={() => {
          if (correctingDraft !== null) handleRemoveDraft(correctingDraft.id);
          else if (correctingDebt !== null) handleRemoveDebtDraft(correctingDebt.id);
        }}
        onDone={(next) => {
          if (correcting !== null) patch(correcting, next);
          setCorrecting(null);
        }}
      />

      <ChooseSheet
        visible={picker?.field === 'category'}
        title={t('expenses.sheet.manualEntry.category')}
        options={(categories.data ?? []).map((category) => ({
          value: category.id,
          label: category.name,
        }))}
        value={
          picker !== null
            ? (editOf(picker.card).categoryId ??
              drafts.find((d) => d.id === picker.card)?.categoryId ??
              null)
            : null
        }
        onChange={(value: string) =>
          picker !== null && patch(picker.card, { categoryId: value })
        }
        onClose={() => setPicker(null)}
      />

      <ChooseSheet
        visible={picker?.field === 'source'}
        title={t('expenses.sheet.manualEntry.source')}
        options={sourceOptions}
        value={picker !== null ? (editOf(picker.card).sourceKey ?? null) : null}
        onChange={(value: string) =>
          picker !== null && patch(picker.card, { sourceKey: value })
        }
        onClose={() => setPicker(null)}
      />

      <DatePickerSheet
        visible={datePickerFor !== null}
        value={
          datePickerFor !== null ? (editOf(datePickerFor).occurredOn ?? today) : today
        }
        today={today}
        title={t('expenses.sheet.manualEntry.date')}
        language={language}
        onSelect={(value: string) =>
          datePickerFor !== null ? patch(datePickerFor, { occurredOn: value }) : undefined
        }
        onClose={() => setDatePickerFor(null)}
      />

      <Toast
        visible={toast !== null}
        message={toast?.message ?? ''}
        undoLabel={toast?.records.length ? t('movements.actions.undo') : undefined}
        onUndo={toast?.records.length ? handleUndo : undefined}
        onDismiss={() => setToast(null)}
      />
    </>
  );
}
