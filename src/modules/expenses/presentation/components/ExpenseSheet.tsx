import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View, type DimensionValue } from 'react-native';

import { useCreateMovement } from '@/modules/movements/presentation/hooks/useCreateMovement';
import type { NewMovement } from '@/modules/movements/domain';
import { BottomSheet, Icon, Toast } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

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

  const createMovement = useCreateMovement();
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const isSubScreen = flow === 'manual';

  const handleSave = (movement: NewMovement) => {
    setError(null);
    createMovement.mutate(
      // A key per attempt: if the request is retried the API returns the original
      // movement instead of charging the user twice.
      { movement, idempotencyKey: `${movement.occurredOn}-${Date.now()}` },
      {
        onSuccess: () => {
          setToast(t(`expenses.toast.saved.${movement.type}`));
          closeSheet();
        },
        onError: () => setError(t('expenses.toast.saveFailed')),
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
          {flow === 'manual' ? (
            <ManualState
              onSave={handleSave}
              saving={createMovement.isPending}
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
        message={toast ?? ''}
        onDismiss={() => setToast(null)}
      />
    </>
  );
}
