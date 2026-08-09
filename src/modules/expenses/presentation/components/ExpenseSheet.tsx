import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View, type DimensionValue } from 'react-native';

import type {
  CapturedRecord,
  DebtDraft,
  DebtDraftOverrides,
  DraftOverrides,
  MovementDraft,
} from '@/modules/assistant/domain/types/Assistant';
import { DebtPaymentAccountRequiredError } from '@/modules/assistant/domain';
import {
  useConfirmDebtDraft,
  useConfirmDraft,
  useDiscardDebtDraft,
  useDiscardDraft,
} from '@/modules/assistant/presentation/hooks/useAssistantMutations';
import {
  overridesFromMovement,
  prefillFromDraft,
} from '@/modules/assistant/presentation/utils/draftForm';
import {
  useDeleteDebt,
  useRemoveDebtPayment,
} from '@/modules/deudas/presentation/hooks/useDebtMutations';
import { useCreateMovement } from '@/modules/movements/presentation/hooks/useCreateMovement';
import { useDeleteMovement } from '@/modules/movements/presentation/hooks/useMovementMutations';
import type { NewMovement } from '@/modules/movements/domain';
import { BottomSheet, Icon, Toast } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { toIsoDate } from '@/shared/presentation/utils/dates';

import { useVoiceCapture } from '../hooks/useVoiceCapture';
import { useExpenseSheetStore, type SheetFlow } from '../stores/useExpenseSheetStore';

import { CaptureConfirmScreen } from './CaptureConfirmScreen';
import { VoiceCaptureScreen } from './VoiceCaptureScreen';
import { EntryState } from './EntryState';
import { ManualState } from './ManualState';
import { WritingState } from './WritingState';

const MAX_HEIGHT: Record<SheetFlow, DimensionValue> = {
  entry: '62%',
  recording: '62%',
  processing: '62%',
  writing: '78%',
  photo: '80%',
  manual: '92%',
  confirm: '88%',
};

export function ExpenseSheet() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const open = useExpenseSheetStore((s) => s.open);
  const flow = useExpenseSheetStore((s) => s.flow);
  const closeSheet = useExpenseSheetStore((s) => s.closeSheet);
  const setFlow = useExpenseSheetStore((s) => s.setFlow);
  const initialType = useExpenseSheetStore((s) => s.initialType);
  const drafts = useExpenseSheetStore((s) => s.drafts);
  const debtDrafts = useExpenseSheetStore((s) => s.debtDrafts);
  const editing = useExpenseSheetStore((s) => s.editing);
  const transcript = useExpenseSheetStore((s) => s.transcript);
  const clarification = useExpenseSheetStore((s) => s.clarification);
  const notice = useExpenseSheetStore((s) => s.notice);
  const settleDraft = useExpenseSheetStore((s) => s.settleDraft);
  const settleDebtDraft = useExpenseSheetStore((s) => s.settleDebtDraft);
  const saved = useExpenseSheetStore((s) => s.saved);
  const setSaved = useExpenseSheetStore((s) => s.setSaved);
  const setEditing = useExpenseSheetStore((s) => s.setEditing);

  const today = useMemo(() => toIsoDate(new Date()), []);
  const capture = useVoiceCapture();
  const createMovement = useCreateMovement();
  const confirmDraft = useConfirmDraft(today);
  const discardDraft = useDiscardDraft();
  const confirmDebtDraft = useConfirmDebtDraft(today);
  const discardDebtDraft = useDiscardDebtDraft();
  const deleteMovement = useDeleteMovement();
  const deleteDebt = useDeleteDebt();
  const removeDebtPayment = useRemoveDebtPayment(today);
  const [error, setError] = useState<string | null>(null);
  /** Only the card being confirmed shows a spinner; its siblings stay usable. */
  const [busyDraftId, setBusyDraftId] = useState<string | null>(null);
  // The toast remembers what it just created so "undo" has something to remove.
  // A confirmed draft offers no undo: its card in the chat shows what happened.
  // What the toast can undo. A capture that saved itself carries the full list;
  // a manual save carries the one movement it created.
  const [toast, setToast] = useState<{
    message: string;
    records: CapturedRecord[];
  } | null>(null);

  // The sheet stays mounted between captures, so a failure from the last one used
  // to greet the next card before the user had pressed anything. The error belongs
  // to an attempt, not to the sheet.
  useEffect(() => {
    setError(null);
  }, [open, drafts, debtDrafts]);

  const isSubScreen = flow === 'manual' || flow === 'writing';
  // Talking, listening and thinking are one screen, not three faces of a sheet.
  const isVoice = flow === 'entry' || flow === 'recording' || flow === 'processing';

  const handleSave = (movement: NewMovement) => {
    setError(null);
    if (editing !== null) {
      // Editing an agent draft: the form's picture confirms THROUGH the draft,
      // so it settles as `confirmed` in the chat instead of leaving a pending twin.
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

  /** The queue is empty once this draft leaves it — the caller already knows
   * whether its own card was the last one standing. */
  const wasLast = (draftId: string) =>
    drafts.filter((entry) => entry.id !== draftId).length +
      debtDrafts.filter((entry) => entry.id !== draftId).length ===
    0;

  const handleConfirmDraft = (draft: MovementDraft, overrides?: DraftOverrides) => {
    setError(null);
    setBusyDraftId(draft.id);
    confirmDraft.mutate(
      { draftId: draft.id, overrides },
      {
        onSuccess: () => {
          setBusyDraftId(null);
          // Several movements from one capture settle one by one; the sheet
          // stays open until the last card is answered, so nothing is lost by
          // confirming the coffee before deciding on the groceries.
          if (wasLast(draft.id)) {
            setToast({
              message: t(`expenses.toast.saved.${draft.type}`),
              records: [],
            });
            closeSheet();
            return;
          }
          settleDraft(draft.id);
        },
        onError: () => {
          setBusyDraftId(null);
          setError(t('assistant.errors.confirmFailed'));
        },
      },
    );
  };

  const handleDiscardDraft = (draft: MovementDraft) => {
    discardDraft.mutate(draft.id, {
      onError: () => setError(t('assistant.errors.discardFailed')),
    });
    // Discarding never touches money, so the card leaves immediately. With the
    // queue empty there is nothing left to confirm: back to the capture loop.
    if (wasLast(draft.id)) {
      settleDraft(draft.id);
      setFlow('entry');
      return;
    }
    settleDraft(draft.id);
  };

  const handleConfirmDebtDraft = (draft: DebtDraft, overrides?: DebtDraftOverrides) => {
    setBusyDraftId(draft.id);
    confirmDebtDraft.mutate(
      { draftId: draft.id, overrides },
      {
        onSuccess: () => {
          setBusyDraftId(null);
          if (wasLast(draft.id)) {
            // No undo offered: unlike a movement, taking a debt back means
            // deleting its transfer too, and that lives in Deudas.
            setToast({ message: t('assistant.debtDraft.saved'), records: [] });
            closeSheet();
            return;
          }
          settleDebtDraft(draft.id);
        },
        onError: (error) => {
          setBusyDraftId(null);
          setError(
            error instanceof DebtPaymentAccountRequiredError
              ? t('assistant.debtDraft.accountRequired')
              : t('assistant.debtDraft.confirmFailed'),
          );
        },
      },
    );
  };

  const handleDiscardDebtDraft = (draft: DebtDraft) => {
    discardDebtDraft.mutate(draft.id, {
      onError: () => setError(t('assistant.errors.discardFailed')),
    });
    if (wasLast(draft.id)) {
      settleDebtDraft(draft.id);
      setFlow('entry');
      return;
    }
    settleDebtDraft(draft.id);
  };

  /**
   * Undo is a real revert, and it is not one operation.
   *
   * A movement is deleted. A new debt is deleted, which takes its loan transfer with
   * it. An abono is undone by deleting the movement that carried it — the debt has
   * to survive that one, or undoing a repayment would erase the whole loan.
   *
   * This is what makes saving without asking safe. An undo that only dismissed the
   * toast would be the app moving money and then lying about being able to take it
   * back.
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

  // A capture that saved itself announces it once, with the way back out.
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

  return (
    <>
      {/* The sheet steps aside for the confirm screen: answering questions earned a
          screen of its own, and two stacked modals is nobody's idea of clarity. */}
      <BottomSheet
        visible={open && flow !== 'confirm' && !isVoice}
        onClose={closeSheet}
        maxHeight={MAX_HEIGHT[flow]}
      >
        {isSubScreen ? (
          <Pressable
            onPress={() => setFlow('entry')}
            accessibilityRole="button"
            accessibilityLabel={t('expenses.sheet.back')}
            style={({ pressed }) => ({
              position: 'absolute',
              top: 16,
              left: 16,
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: theme.colors.bgFloat,
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Icon name="arrow-left" size={16} color={theme.colors.textSecondary} />
          </Pressable>
        ) : null}
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 22,
            paddingTop: 8,
            paddingBottom: 26,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {flow === 'manual' ? (
            <ManualState
              key={editing?.id ?? 'blank'}
              initialType={initialType}
              initialValues={editing !== null ? prefillFromDraft(editing) : undefined}
              onSave={handleSave}
              saving={createMovement.isPending || confirmDraft.isPending}
              errorMessage={error ?? notice}
            />
          ) : flow === 'writing' ? (
            <WritingState
              clarification={clarification}
              initialText={transcript ?? ''}
              busy={capture.parsePending}
              error={capture.inlineError}
              onSubmit={capture.submitText}
            />
          ) : (
            <EntryState
              liveTranscript={capture.liveTranscript}
              permissionDenied={capture.permissionDenied}
              inlineError={capture.inlineError}
              onMicPress={capture.onMicPress}
            />
          )}
          <View style={{ height: 8 }} />
        </ScrollView>
      </BottomSheet>

      <VoiceCaptureScreen
        visible={open && isVoice}
        transcript={capture.liveTranscript}
        recording={flow === 'recording'}
        busy={flow === 'processing'}
        permissionDenied={capture.permissionDenied}
        error={capture.inlineError}
        onMicPress={capture.onMicPress}
        onWriteInstead={() => setFlow('manual')}
        onClose={closeSheet}
      />

      <CaptureConfirmScreen
        visible={open && flow === 'confirm' && drafts.length + debtDrafts.length > 0}
        drafts={drafts}
        debtDrafts={debtDrafts}
        today={today}
        transcript={transcript}
        busyDraftId={busyDraftId}
        error={error}
        onClose={closeSheet}
        onConfirm={handleConfirmDraft}
        onEdit={(draft) => {
          setEditing(draft);
          setFlow('manual');
        }}
        onDiscard={handleDiscardDraft}
        onConfirmDebt={handleConfirmDebtDraft}
        onDiscardDebt={handleDiscardDebtDraft}
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
