import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View, type DimensionValue } from 'react-native';

import { BottomSheet, Icon, Toast } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

import type { DetectedExpense } from '../../domain/types/Expense';
import { useCreateExpenses } from '../hooks/useCreateExpenses';
import { useExpenseSheetStore, type SheetFlow } from '../stores/useExpenseSheetStore';

import { ConfirmState } from './ConfirmState';
import { EntryState } from './EntryState';
import { ManualState } from './ManualState';
import { PhotoState } from './PhotoState';
import { WritingState } from './WritingState';

const MAX_HEIGHT: Record<SheetFlow, DimensionValue> = {
  entry: '62%',
  recording: '62%',
  processing: '62%',
  writing: '78%',
  photo: '80%',
  manual: '88%',
  confirm: '88%',
};

export function ExpenseSheet() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const open = useExpenseSheetStore((s) => s.open);
  const flow = useExpenseSheetStore((s) => s.flow);
  const closeSheet = useExpenseSheetStore((s) => s.closeSheet);
  const setFlow = useExpenseSheetStore((s) => s.setFlow);

  const createExpenses = useCreateExpenses();
  const [toast, setToast] = useState<{ visible: boolean; message: string }>({
    visible: false,
    message: '',
  });

  const isSubScreen = flow === 'writing' || flow === 'photo' || flow === 'manual';

  const handleSave = (items: DetectedExpense[], messageKey?: string) => {
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
          const key =
            messageKey ??
            (savedCount === 1 ? 'expenses.toast.savedOne' : 'expenses.toast.saved');
          setToast({
            visible: true,
            message: t(key, { count: savedCount, total: formatMoney(totalAmount) }),
          });
          closeSheet();
        },
      },
    );
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
          {flow === 'confirm' ? (
            <ConfirmState onSave={handleSave} saving={createExpenses.isPending} />
          ) : flow === 'writing' ? (
            <WritingState />
          ) : flow === 'photo' ? (
            <PhotoState />
          ) : flow === 'manual' ? (
            <ManualState
              onSave={(item, type) =>
                handleSave(
                  [item],
                  type === 'income'
                    ? 'expenses.toast.savedIncome'
                    : type === 'transfer'
                      ? 'expenses.toast.savedTransfer'
                      : undefined,
                )
              }
              saving={createExpenses.isPending}
            />
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
