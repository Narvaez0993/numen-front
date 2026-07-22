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
import { useTheme } from '@/shared/presentation/theme';

import type { CreditCard } from '../../domain';

export type CardFormInput = {
  name: string;
  debt: number;
  limit: number;
  cutoffDay: number;
};

type Props = {
  visible: boolean;
  card: CreditCard | null;
  onClose: () => void;
  onSave: (input: CardFormInput) => void;
  onDelete: () => void;
};

export function CardFormSheet({ visible, card, onClose, onSave, onDelete }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const editing = card != null;

  const [name, setName] = useState('');
  const [debtDigits, setDebtDigits] = useState('');
  const [limitDigits, setLimitDigits] = useState('');
  const [cutoff, setCutoff] = useState('');
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setName(card?.name ?? '');
    setDebtDigits(card ? String(card.debt) : '');
    setLimitDigits(card ? String(card.limit) : '');
    setCutoff(card ? String(card.cutoffDay) : '');
    setConfirmingDelete(false);
  }, [visible, card]);

  const debt = Number(debtDigits || '0');
  const limit = Number(limitDigits || '0');
  const cutoffDay = Number(cutoff || '0');
  const debtExceedsLimit = limit > 0 && debt > limit;
  const valid =
    name.trim().length >= 2 &&
    limit > 0 &&
    !debtExceedsLimit &&
    cutoffDay >= 1 &&
    cutoffDay <= 31;

  const handleSave = () => {
    if (!valid) return;
    onSave({ name: name.trim(), debt, limit, cutoffDay });
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
            <AmountField digits={debtDigits} onChangeDigits={setDebtDigits} />
          </View>
          <View style={{ flex: 1 }}>
            <FieldLabel label={t('accounts.form.limit')} />
            <AmountField digits={limitDigits} onChangeDigits={setLimitDigits} />
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

        <View>
          <FieldLabel label={t('accounts.form.cutoffDay')} />
          <TextInput
            value={cutoff}
            onChangeText={(v) => {
              const digits = v.replace(/\D/g, '').slice(0, 2);
              setCutoff(digits);
            }}
            keyboardType="number-pad"
            placeholder="25"
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
              width: 110,
            }}
          />
        </View>

        <Button
          label={t('accounts.form.save')}
          full
          disabled={!valid}
          onPress={handleSave}
        />

        {editing ? (
          <DeleteFlow
            label={t('accounts.form.delete')}
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
