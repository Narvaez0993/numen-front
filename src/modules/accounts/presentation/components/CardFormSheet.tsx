import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TextInput, View } from 'react-native';

import type { CurrencyCode } from '@/shared/domain';
import {
  AmountSheet,
  SheetDangerAction,
  SheetHeaderButton,
  Text,
} from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

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

const onlyDigits = (value: string) => value.replace(/[^0-9]/g, '');

/**
 * A credit card — `CREAR`'s shape with the system keyboard under it.
 *
 * It briefly had the app's number pad and a trick where tapping a row promoted
 * it to the hero, because there were four numbers and one pad. The trick was
 * clever and wrong: it existed to work around a constraint that only made sense
 * for sheets holding nothing but numbers, and this one also holds a name. Every
 * field is live now, which needs no explaining to anybody.
 *
 * The debt keeps the hero because it is the number that changes — the limit and
 * the two days are set once and read for years.
 */
export function CardFormSheet({
  visible,
  card,
  currency,
  submitting = false,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const { t } = useTranslation();
  const editing = card != null;

  const [name, setName] = useState('');
  const [debtDigits, setDebtDigits] = useState('');
  const [limitDigits, setLimitDigits] = useState('');
  const [cutoff, setCutoff] = useState('');
  const [due, setDue] = useState('');

  useEffect(() => {
    if (!visible) return;
    setName(card?.name ?? '');
    setDebtDigits(card ? String(card.debt) : '');
    setLimitDigits(card ? String(card.limit) : '');
    setCutoff(card ? String(card.cutoffDay) : '');
    setDue(card?.dueDay ? String(card.dueDay) : '');
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

  return (
    <AmountSheet
      visible={visible}
      onClose={onClose}
      digits={debtDigits}
      onDigits={setDebtDigits}
      currency={currency}
      keyboard="system"
      label={t('accounts.form.debt')}
      help={debtExceedsLimit ? t('accounts.form.debtExceedsLimit') : undefined}
      primaryLabel={t('accounts.form.save')}
      primaryDisabled={!valid || submitting}
      onPrimary={() => onSave({ name: name.trim(), debt, limit, cutoffDay, dueDay })}
      header={
        <>
          <SheetHeaderButton icon="x" label={t('common.close')} onPress={onClose} />
          <Text numberOfLines={1} style={{ flex: 1, fontSize: 16, fontWeight: '500' }}>
            {editing ? t('accounts.form.editCard') : t('accounts.form.newCard')}
          </Text>
          {editing ? (
            <SheetDangerAction
              label={t('accounts.form.delete')}
              confirmLabel={t('accounts.form.deleteConfirm')}
              onConfirm={onDelete}
            />
          ) : null}
        </>
      }
    >
      <FieldRow label={t('accounts.form.name')}>
        <RowInput
          value={name}
          placeholder={t('accounts.form.cardNamePlaceholder')}
          onChangeText={setName}
        />
      </FieldRow>

      <FieldRow label={t('accounts.form.limit')}>
        <RowInput
          value={limitDigits ? formatMoney(limit, currency) : ''}
          placeholder="—"
          numeric
          onChangeText={(next) => setLimitDigits(onlyDigits(next))}
        />
      </FieldRow>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1 }}>
          <FieldRow label={t('accounts.form.cutoffDay')}>
            <RowInput
              value={cutoff}
              placeholder="—"
              numeric
              maxLength={2}
              onChangeText={(next) => setCutoff(onlyDigits(next).slice(0, 2))}
            />
          </FieldRow>
        </View>
        <View style={{ flex: 1 }}>
          <FieldRow label={t('accounts.form.dueDay')}>
            <RowInput
              value={due}
              placeholder="—"
              numeric
              maxLength={2}
              onChangeText={(next) => setDue(onlyDigits(next).slice(0, 2))}
            />
          </FieldRow>
        </View>
      </View>
    </AmountSheet>
  );
}

/** A labelled row with a live field in it. */
function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  const { theme } = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        minHeight: 44,
        paddingHorizontal: 16,
        paddingVertical: 13,
        borderRadius: 16,
        backgroundColor: theme.colors.bgSurface,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
      }}
    >
      <Text color={theme.colors.textTertiary} style={{ fontSize: 13.5 }}>
        {label}
      </Text>
      {children}
    </View>
  );
}

function RowInput({
  value,
  placeholder,
  numeric = false,
  maxLength = 40,
  onChangeText,
}: {
  value: string;
  placeholder: string;
  numeric?: boolean;
  maxLength?: number;
  onChangeText: (next: string) => void;
}) {
  const { theme } = useTheme();

  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={theme.colors.textTertiary}
      keyboardType={numeric ? 'number-pad' : 'default'}
      maxLength={maxLength}
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
  );
}
