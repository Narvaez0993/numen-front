import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, TextInput } from 'react-native';

import type { CurrencyCode } from '@/shared/domain';
import {
  AmountSheet,
  DatePickerSheet,
  SheetDangerAction,
  SheetFieldRow,
  SheetHeaderButton,
  Text,
} from '@/shared/presentation/components';
import { useCurrencyStore } from '@/shared/presentation/currency/useCurrencyStore';
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

/**
 * Setting a goal — `CREAR`, with the target as the amount.
 *
 * It takes words, so it uses the phone's keyboard rather than the app's pad: a
 * goal has a name, and a pad that cannot type it while sitting where it needs to
 * be read is worse than no pad.
 *
 * The date is optional and that matters more than it looks. With one, the app
 * can say what each month needs and put that number on the contribute button;
 * without one it can only report the pace. The help line says so, because the
 * difference is invisible until you have already skipped the field.
 */
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
  const currency = useCurrencyStore((s) => s.currency) as CurrencyCode;
  const editing = goal != null;

  const [name, setName] = useState('');
  const [digits, setDigits] = useState('');
  const [targetDate, setTargetDate] = useState<string | null>(null);
  const [dateOpen, setDateOpen] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setName(goal?.name ?? '');
    setDigits(goal ? String(goal.target) : '');
    setTargetDate(goal?.targetDate ?? null);
  }, [visible, goal]);

  const target = Number(digits || '0');
  const valid = name.trim().length >= 2 && target > 0;

  return (
    <>
      <AmountSheet
        visible={visible}
        onClose={onClose}
        keyboard="system"
        digits={digits}
        onDigits={setDigits}
        currency={currency}
        label={t('goals.form.target')}
        help={t('goals.form.help')}
        primaryLabel={t('goals.form.save')}
        primaryDisabled={!valid || saving}
        onPrimary={() => onSave({ name: name.trim(), target, targetDate })}
        header={
          <>
            <SheetHeaderButton icon="x" label={t('common.close')} onPress={onClose} />
            <Text numberOfLines={1} style={{ flex: 1, fontSize: 16, fontWeight: '500' }}>
              {editing ? t('goals.form.editGoal') : t('goals.form.newGoal')}
            </Text>
            {editing ? (
              <SheetDangerAction
                label={t('goals.form.delete')}
                confirmLabel={t('goals.form.deleteConfirm')}
                onConfirm={onDelete}
              />
            ) : null}
          </>
        }
      >
        <SheetFieldRow label={t('goals.form.name')} onPress={() => undefined}>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder={t('goals.form.namePlaceholder')}
            placeholderTextColor={theme.colors.textTertiary}
            maxLength={40}
            selectionColor={theme.palette.acc}
            style={{
              flex: 1,
              textAlign: 'right',
              fontSize: 13.5,
              color: theme.colors.textPrimary,
              fontFamily: 'Geist_400Regular',
              padding: 0,
            }}
          />
        </SheetFieldRow>

        <SheetFieldRow
          label={t('goals.form.targetDate')}
          value={
            targetDate === null
              ? t('goals.form.noDate')
              : shortDate(targetDate, i18n.language)
          }
          chevron
          onPress={() => setDateOpen(true)}
        />

        {editing ? (
          <Pressable
            accessibilityRole="button"
            onPress={onArchive}
            style={({ pressed }) => ({
              minHeight: 44,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text color={theme.colors.textSecondary} style={{ fontSize: 12.5 }}>
              {t(goal.archived ? 'goals.form.reopen' : 'goals.form.archive')}
            </Text>
          </Pressable>
        ) : null}
      </AmountSheet>

      <DatePickerSheet
        visible={dateOpen}
        value={targetDate ?? today}
        today={today}
        allowFuture
        title={t('goals.form.targetDate')}
        language={i18n.language}
        onSelect={setTargetDate}
        onClose={() => setDateOpen(false)}
      />
    </>
  );
}
