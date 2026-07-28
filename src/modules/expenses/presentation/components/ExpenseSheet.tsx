import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View, type DimensionValue } from 'react-native';

import { useConfirmDraft } from '@/modules/assistant/presentation/hooks/useAssistantMutations';
import {
  overridesFromMovement,
  prefillFromDraft,
} from '@/modules/assistant/presentation/utils/draftForm';
import { useCreateMovement } from '@/modules/movements/presentation/hooks/useCreateMovement';
import { useDeleteMovement } from '@/modules/movements/presentation/hooks/useMovementMutations';
import type { NewMovement } from '@/modules/movements/domain';
import { BottomSheet, Icon, Toast } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { toIsoDate } from '@/shared/presentation/utils/dates';

import { useExpenseSheetStore, type SheetFlow } from '../stores/useExpenseSheetStore';

import { EntryState } from './EntryState';
import { ManualState } from './ManualState';

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
  const draft = useExpenseSheetStore((s) => s.draft);

  const today = useMemo(() => toIsoDate(new Date()), []);
  const createMovement = useCreateMovement();
  const confirmDraft = useConfirmDraft(today);
  const deleteMovement = useDeleteMovement();
  const [error, setError] = useState<string | null>(null);
  // The toast remembers what it just created so "undo" has something to remove.
  // A confirmed draft offers no undo: its card in the chat shows what happened.
  const [toast, setToast] = useState<{
    message: string;
    movementId: string | null;
  } | null>(null);

  const isSubScreen = flow === 'manual';

  const handleSave = (movement: NewMovement) => {
    setError(null);
    if (draft !== null) {
      // Editing an agent draft: the form's picture confirms THROUGH the draft,
      // so it settles as `confirmed` in the chat instead of leaving a pending twin.
      confirmDraft.mutate(
        { draftId: draft.id, overrides: overridesFromMovement(movement) },
        {
          onSuccess: () => {
            setToast({
              message: t(`expenses.toast.saved.${movement.type}`),
              movementId: null,
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
            movementId: created.id,
          });
          closeSheet();
        },
        onError: () => setError(t('expenses.toast.saveFailed')),
      },
    );
  };

  /** Undo is a real delete: the API reverts the deltas, so balances go back too. */
  const handleUndo = () => {
    if (!toast || toast.movementId === null) return;
    const { movementId } = toast;
    setToast(null);
    deleteMovement.mutate(movementId, {
      onError: () => setError(t('movements.errors.undoFailed')),
    });
  };

  return (
    <>
      <BottomSheet visible={open} onClose={closeSheet} maxHeight={MAX_HEIGHT[flow]}>
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
              key={draft?.id ?? 'blank'}
              initialType={initialType}
              initialValues={draft !== null ? prefillFromDraft(draft) : undefined}
              onSave={handleSave}
              saving={createMovement.isPending || confirmDraft.isPending}
              errorMessage={error}
            />
          ) : (
            <EntryState />
          )}
          <View style={{ height: 8 }} />
        </ScrollView>
      </BottomSheet>

      <Toast
        visible={toast !== null}
        message={toast?.message ?? ''}
        undoLabel={toast?.movementId != null ? t('movements.actions.undo') : undefined}
        onUndo={toast?.movementId != null ? handleUndo : undefined}
        onDismiss={() => setToast(null)}
      />
    </>
  );
}
