import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';

import { BottomSheet, Toast } from '@/shared/presentation/components';
import { formatCOP } from '@/shared/presentation/utils/formatCOP';

import type { DetectedExpense } from '../../domain/types/Expense';
import { useCreateExpenses } from '../hooks/useCreateExpenses';
import { useExpenseSheetStore } from '../stores/useExpenseSheetStore';

import { ConfirmState } from './ConfirmState';
import { EntryState } from './EntryState';

export function ExpenseSheet() {
  const { t } = useTranslation();
  const open = useExpenseSheetStore((s) => s.open);
  const flow = useExpenseSheetStore((s) => s.flow);
  const closeSheet = useExpenseSheetStore((s) => s.closeSheet);

  const createExpenses = useCreateExpenses();
  const [toast, setToast] = useState<{ visible: boolean; message: string }>({
    visible: false,
    message: '',
  });

  const handleSave = (items: DetectedExpense[]) => {
    createExpenses.mutate(
      {
        expenses: items.map((it) => ({
          description: it.description,
          categoryName: it.categoryName,
          amount: it.amount,
          sourceName: it.sourceName,
        })),
      },
      {
        onSuccess: ({ savedCount, totalAmount }) => {
          const messageKey =
            savedCount === 1 ? 'expenses.toast.savedOne' : 'expenses.toast.saved';
          setToast({
            visible: true,
            message: t(messageKey, { count: savedCount, total: formatCOP(totalAmount) }),
          });
          closeSheet();
        },
      },
    );
  };

  return (
    <>
      <BottomSheet
        visible={open}
        onClose={closeSheet}
        maxHeight={flow === 'confirm' ? '88%' : '62%'}
      >
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 22,
            paddingTop: 8,
            paddingBottom: 26,
          }}
          showsVerticalScrollIndicator={false}
        >
          {flow === 'confirm' ? (
            <ConfirmState onSave={handleSave} saving={createExpenses.isPending} />
          ) : (
            <EntryState />
          )}
          <View style={{ height: 8 }} />
        </ScrollView>
      </BottomSheet>

      <Toast
        visible={toast.visible}
        message={toast.message}
        undoLabel={t('expenses.toast.undo')}
        onUndo={() => setToast((p) => ({ ...p, visible: false }))}
        onDismiss={() => setToast((p) => ({ ...p, visible: false }))}
      />
    </>
  );
}
