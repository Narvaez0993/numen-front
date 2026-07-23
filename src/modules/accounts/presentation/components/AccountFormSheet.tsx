import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import {
  AmountField,
  BottomSheet,
  Button,
  DeleteFlow,
  FieldLabel,
  Segmented,
  Text,
  TextField,
} from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

import type { Account } from '../../domain';

export type AccountFormInput = {
  kind: 'debit' | 'cash';
  name: string;
  sub: string;
  balance: number;
};

type Props = {
  visible: boolean;
  account: Account | null;
  onClose: () => void;
  onSave: (input: AccountFormInput) => void;
  onDelete: () => void;
};

const KINDS = ['debit', 'cash'] as const;

export function AccountFormSheet({ visible, account, onClose, onSave, onDelete }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const editing = account != null;

  const [kind, setKind] = useState<'debit' | 'cash'>('debit');
  const [name, setName] = useState('');
  const [sub, setSub] = useState('');
  const [digits, setDigits] = useState('');
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setKind(account?.kind ?? 'debit');
    setName(account?.name ?? '');
    setSub(account?.sub ?? '');
    setDigits(account ? String(Math.max(0, account.balance)) : '');
    setConfirmingDelete(false);
  }, [visible, account]);

  const valid = name.trim().length >= 2;

  const handleSave = () => {
    if (!valid) return;
    onSave({
      kind,
      name: name.trim(),
      sub: sub.trim(),
      balance: Number(digits || '0'),
    });
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} maxHeight="88%">
      <View style={{ paddingHorizontal: 22, paddingTop: 8, paddingBottom: 26, gap: 16 }}>
        <View>
          <Text variant="h1" style={{ fontSize: 16 }}>
            {editing ? t('accounts.form.editAccount') : t('accounts.form.newAccount')}
          </Text>
          <Text
            variant="caption"
            color={theme.colors.textSecondary}
            style={{ marginTop: 4 }}
          >
            {t('accounts.form.accountSubtitle')}
          </Text>
        </View>

        {!editing ? (
          <Segmented
            options={KINDS}
            value={kind}
            onChange={setKind}
            labels={{
              debit: t('accounts.form.kind.debit'),
              cash: t('accounts.form.kind.cash'),
            }}
          />
        ) : null}

        <View>
          <FieldLabel label={t('accounts.form.name')} />
          <TextField
            value={name}
            onChangeText={setName}
            placeholder={t('accounts.form.namePlaceholder')}
            autoFocus={!editing}
          />
        </View>

        <View>
          <FieldLabel label={t('accounts.form.sub')} />
          <TextField
            value={sub}
            onChangeText={setSub}
            placeholder={t('accounts.form.subPlaceholder')}
          />
        </View>

        <View>
          <FieldLabel label={t('accounts.form.balance')} />
          <AmountField digits={digits} onChangeDigits={setDigits} />
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
            confirmTitle={t('accounts.form.deleteConfirmTitle', {
              name: account.name,
            })}
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
