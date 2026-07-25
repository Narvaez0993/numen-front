import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TextInput, View } from 'react-native';

import {
  AmountField,
  BottomSheet,
  Button,
  DeleteFlow,
  FieldLabel,
  Text,
  TextField,
} from '@/shared/presentation/components';
import type { CurrencyCode } from '@/shared/domain';
import { useTheme } from '@/shared/presentation/theme';

import type { CreditCard } from '../../domain';

export type CardFormInput = {
  name: string;
  /** Minor units of the card's currency. */
  debt: number;
  limit: number;
  cutoffDay: number;
  dueDay: number | null;
};

type Props = {
  visible: boolean;
  card: CreditCard | null;
  currency: CurrencyCode;
  submitting?: boolean;
  deleting?: boolean;
  onClose: () => void;
  onSave: (input: CardFormInput) => void;
  onDelete: () => void;
};

/** Day-of-month input: two digits, never a display string (see CreditCard). */
function DayField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  const { theme } = useTheme();
  return (
    <TextInput
      value={value}
      onChangeText={(v) => onChange(v.replace(/\D/g, '').slice(0, 2))}
      keyboardType="number-pad"
      placeholder={placeholder}
      placeholderTextColor={theme.colors.textTertiary}
      style={{
        backgroundColor: theme.colors.bgFloat,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
        color: theme.colors.textPrimary,
        fontFamily: 'Geist_500Medium',
        fontVariant: ['tabular-nums'],
      }}
    />
  );
}

export function CardFormSheet({
  visible,
  card,
  currency,
  submitting = false,
  deleting = false,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const editing = card != null;

  const [name, setName] = useState('');
  const [debtDigits, setDebtDigits] = useState('');
  const [limitDigits, setLimitDigits] = useState('');
  const [cutoff, setCutoff] = useState('');
  const [due, setDue] = useState('');
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setName(card?.name ?? '');
    setDebtDigits(card ? String(card.debt) : '');
    setLimitDigits(card ? String(card.limit) : '');
    setCutoff(card ? String(card.cutoffDay) : '');
    setDue(card?.dueDay ? String(card.dueDay) : '');
    setConfirmingDelete(false);
  }, [visible, card]);

  const debt = Number(debtDigits || '0');
  const limit = Number(limitDigits || '0');
  const cutoffDay = Number(cutoff || '0');
  const dueDay = due ? Number(due) : null;
  const debtExceedsLimit = limit > 0 && debt > limit;
  const dayInMonth = (day: number) => day >= 1 && day <= 31;
  // A stored payment day can be changed but not blanked (the API only sets it),
  // so the form requires it instead of accepting an edit that does nothing.
  const dueRequired = card?.dueDay != null;
  const valid =
    name.trim().length >= 2 &&
    limit > 0 &&
    !debtExceedsLimit &&
    dayInMonth(cutoffDay) &&
    (dueDay === null ? !dueRequired : dayInMonth(dueDay));

  const handleSave = () => {
    if (!valid || submitting) return;
    onSave({ name: name.trim(), debt, limit, cutoffDay, dueDay });
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} maxHeight="88%">
      <View style={{ paddingHorizontal: 22, paddingTop: 8, paddingBottom: 26, gap: 16 }}>
        <View>
          <Text variant="h1" style={{ fontSize: 16 }}>
            {editing ? t('accounts.form.editCard') : t('accounts.form.newCard')}
          </Text>
          <Text
            variant="caption"
            color={theme.colors.textSecondary}
            style={{ marginTop: 4 }}
          >
            {t('accounts.form.cardSubtitle')}
          </Text>
        </View>

        <View>
          <FieldLabel label={t('accounts.form.name')} />
          <TextField
            value={name}
            onChangeText={setName}
            placeholder={t('accounts.form.cardNamePlaceholder')}
            autoFocus={!editing}
          />
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <FieldLabel label={t('accounts.form.debt')} />
            <AmountField
              digits={debtDigits}
              onChangeDigits={setDebtDigits}
              currency={currency}
            />
          </View>
          <View style={{ flex: 1 }}>
            <FieldLabel label={t('accounts.form.limit')} />
            <AmountField
              digits={limitDigits}
              onChangeDigits={setLimitDigits}
              currency={currency}
            />
          </View>
        </View>
        {debtExceedsLimit ? (
          <Text
            variant="caption"
            color={theme.colors.accentCoral}
            style={{ fontSize: 11.5, marginTop: -8 }}
          >
            {t('accounts.form.debtExceedsLimit')}
          </Text>
        ) : null}

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <FieldLabel label={t('accounts.form.cutoffDay')} />
            <DayField value={cutoff} onChange={setCutoff} placeholder="25" />
          </View>
          <View style={{ flex: 1 }}>
            <FieldLabel label={t('accounts.form.dueDay')} />
            <DayField value={due} onChange={setDue} placeholder="5" />
          </View>
        </View>

        <Button
          label={t('accounts.form.save')}
          full
          disabled={!valid}
          loading={submitting}
          onPress={handleSave}
        />

        {editing ? (
          <DeleteFlow
            label={deleting ? t('accounts.form.deleting') : t('accounts.form.delete')}
            confirmTitle={t('accounts.form.deleteConfirmTitle', { name: card.name })}
            confirmLabel={t('accounts.form.deleteConfirm')}
            cancelLabel={t('accounts.form.cancel')}
            confirming={confirmingDelete}
            onToggle={setConfirmingDelete}
            onConfirm={onDelete}
          />
        ) : null}
      </View>
    </BottomSheet>
  );
}
