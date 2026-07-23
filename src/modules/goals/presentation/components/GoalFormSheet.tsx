import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import {
  AmountField,
  BottomSheet,
  Button,
  DeleteFlow,
  FieldLabel,
  Text,
  TextField,
} from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

import type { Goal } from '../../domain/types/Goal';

export type GoalFormInput = {
  name: string;
  target: number;
};

type Props = {
  visible: boolean;
  goal: Goal | null;
  onClose: () => void;
  onSave: (input: GoalFormInput) => void;
  onDelete: () => void;
};

export function GoalFormSheet({ visible, goal, onClose, onSave, onDelete }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const editing = goal != null;

  const [name, setName] = useState('');
  const [digits, setDigits] = useState('');
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setName(goal?.name ?? '');
    setDigits(goal ? String(goal.target) : '');
    setConfirmingDelete(false);
  }, [visible, goal]);

  const target = Number(digits || '0');
  const valid = name.trim().length >= 2 && target > 0;

  return (
    <BottomSheet visible={visible} onClose={onClose} maxHeight="88%">
      <View style={{ paddingHorizontal: 22, paddingTop: 8, paddingBottom: 26, gap: 16 }}>
        <View>
          <Text variant="h1" style={{ fontSize: 16 }}>
            {editing ? t('goals.form.editGoal') : t('goals.form.newGoal')}
          </Text>
          <Text
            variant="caption"
            color={theme.colors.textSecondary}
            style={{ marginTop: 4 }}
          >
            {t('goals.form.subtitle')}
          </Text>
        </View>

        <View>
          <FieldLabel label={t('goals.form.name')} />
          <TextField
            value={name}
            onChangeText={setName}
            placeholder={t('goals.form.namePlaceholder')}
            autoFocus={!editing}
          />
        </View>

        <View>
          <FieldLabel label={t('goals.form.target')} />
          <AmountField digits={digits} onChangeDigits={setDigits} />
        </View>

        <Button
          label={t('goals.form.save')}
          full
          disabled={!valid}
          onPress={() => onSave({ name: name.trim(), target })}
        />

        {editing ? (
          <DeleteFlow
            label={t('goals.form.delete')}
            confirmTitle={t('goals.form.deleteConfirmTitle', { name: goal.name })}
            confirmLabel={t('goals.form.deleteConfirm')}
            cancelLabel={t('goals.form.cancel')}
            confirming={confirmingDelete}
            onToggle={setConfirmingDelete}
            onConfirm={onDelete}
          />
        ) : null}
      </View>
    </BottomSheet>
  );
}
