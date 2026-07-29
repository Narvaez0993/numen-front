import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import {
  AmountField,
  BottomSheet,
  Button,
  DatePickerSheet,
  DeleteFlow,
  FieldLabel,
  Icon,
  Text,
  TextField,
} from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { shortDate } from '@/shared/presentation/utils/dates';

import type { Goal } from '../../domain';

export type GoalFormInput = {
  name: string;
  target: number;
  targetDate: string | null;
};

type Props = {
  visible: boolean;
  goal: Goal | null;
  /** The snapshot's day — lower bound of the date picker. */
  today: string;
  saving?: boolean;
  onClose: () => void;
  onSave: (input: GoalFormInput) => void;
  /** Closes an active pocket (must be empty) or reopens an archived one. */
  onArchive: () => void;
  onDelete: () => void;
};

export function GoalFormSheet({
  visible,
  goal,
  today,
  saving = false,
  onClose,
  onSave,
  onArchive,
  onDelete,
}: Props) {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const editing = goal != null;

  const [name, setName] = useState('');
  const [digits, setDigits] = useState('');
  const [targetDate, setTargetDate] = useState<string | null>(null);
  const [dateOpen, setDateOpen] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setName(goal?.name ?? '');
    setDigits(goal ? String(goal.target) : '');
    setTargetDate(goal?.targetDate ?? null);
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

        <View>
          <FieldLabel label={t('goals.form.targetDate')} />
          <Pressable
            onPress={() => setDateOpen(true)}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              paddingVertical: 12,
              paddingHorizontal: 14,
              backgroundColor: theme.colors.bgSurface,
              borderWidth: 1,
              borderColor: theme.colors.borderSubtle,
              borderRadius: 12,
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <Icon
              name="calendar-event"
              size={15}
              stroke={1.9}
              color={theme.colors.textSecondary}
            />
            <Text
              style={{ flex: 1, fontSize: 13.5 }}
              color={targetDate ? theme.colors.textPrimary : theme.colors.textTertiary}
            >
              {targetDate ? shortDate(targetDate, i18n.language) : t('goals.form.noDate')}
            </Text>
            {targetDate ? (
              <Pressable
                hitSlop={8}
                onPress={() => setTargetDate(null)}
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              >
                <Icon name="x" size={13} stroke={2.2} color={theme.colors.textTertiary} />
              </Pressable>
            ) : (
              <Icon name="chevron-down" size={14} color={theme.colors.textTertiary} />
            )}
          </Pressable>
        </View>

        <Button
          label={t('goals.form.save')}
          full
          disabled={!valid || saving}
          onPress={() => onSave({ name: name.trim(), target, targetDate })}
        />

        {editing ? (
          <>
            <Pressable
              onPress={onArchive}
              style={({ pressed }) => ({
                width: '100%',
                paddingVertical: 10,
                alignItems: 'center',
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text
                variant="label"
                color={theme.colors.textSecondary}
                style={{ fontSize: 12.5 }}
              >
                {t(goal.archived ? 'goals.form.reopen' : 'goals.form.archive')}
              </Text>
            </Pressable>
            <DeleteFlow
              label={t('goals.form.delete')}
              confirmTitle={t('goals.form.deleteConfirmTitle', { name: goal.name })}
              confirmLabel={t('goals.form.deleteConfirm')}
              cancelLabel={t('goals.form.cancel')}
              confirming={confirmingDelete}
              onToggle={setConfirmingDelete}
              onConfirm={onDelete}
            />
          </>
        ) : null}
      </View>

      <DatePickerSheet
        visible={dateOpen}
        value={targetDate ?? today}
        today={today}
        // A goal's deadline lives in the future — that is the point of one.
        allowFuture
        title={t('goals.form.targetDate')}
        language={i18n.language}
        onClose={() => setDateOpen(false)}
        onSelect={(iso) => {
          setTargetDate(iso);
          setDateOpen(false);
        }}
      />
    </BottomSheet>
  );
}
