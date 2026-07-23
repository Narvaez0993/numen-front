import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import {
  AmountField,
  BottomSheet,
  Button,
  DeleteFlow,
  FieldLabel,
  OptionListInline,
  Pill,
  SelectRow,
  Text,
  TextField,
} from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

import type { Account, Category } from '../../domain/types/MovementsCatalog';
import type { Transaction } from '../../domain/types/Transaction';
import type { TransactionPatch } from '../stores/useMovementsStore';

type Props = {
  visible: boolean;
  tx: Transaction | null;
  categories: Record<string, Category>;
  accounts: Record<string, Account>;
  onClose: () => void;
  onSave: (patch: TransactionPatch) => void;
  onDelete: () => void;
};

type ExpandedField = 'category' | 'account' | null;

export function TxDetailSheet({
  visible,
  tx,
  categories,
  accounts,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const [description, setDescription] = useState('');
  const [digits, setDigits] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [expanded, setExpanded] = useState<ExpandedField>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    if (!visible || !tx) return;
    setDescription(tx.description);
    setDigits(String(Math.abs(tx.amount)));
    setCategoryId(tx.categoryId);
    setAccountId(tx.accountId);
    setExpanded(null);
    setConfirmingDelete(false);
  }, [visible, tx]);

  if (!tx) return null;

  const isTransfer = tx.tag === 'transfer';
  const isIncome = !isTransfer && tx.amount > 0;
  const amount = Number(digits || '0');
  const valid = description.trim().length >= 2 && amount > 0;

  const categoryOptions = Object.values(categories).filter(
    (c) => c.id !== 'transfer' && c.id !== 'ingreso',
  );
  const accountOptions = Object.values(accounts);
  const categoryName = categories[categoryId]?.name ?? '';
  const accountName = accounts[accountId]?.name ?? '';

  const handleSave = () => {
    if (!valid) return;
    onSave({
      description: description.trim(),
      amount: isIncome ? amount : -amount,
      categoryId: categoryId as Transaction['categoryId'],
      accountId: accountId as Transaction['accountId'],
    });
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} maxHeight="88%">
      <View style={{ paddingHorizontal: 22, paddingTop: 8, paddingBottom: 26, gap: 16 }}>
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text variant="h1" style={{ fontSize: 16 }}>
              {t('movements.detail.title')}
            </Text>
            {tx.tag === 'recurrente' ? (
              <Pill variant="amber">{t('common.recurring')}</Pill>
            ) : null}
          </View>
          <Text
            variant="caption"
            color={theme.colors.textSecondary}
            style={{ marginTop: 4 }}
          >
            {isTransfer ? t('movements.transferTag') : `${tx.dayBucket} · ${tx.time}`}
          </Text>
        </View>

        <View>
          <FieldLabel label={t('movements.detail.description')} />
          <TextField value={description} onChangeText={setDescription} />
        </View>

        <View>
          <FieldLabel label={t('movements.detail.amount')} />
          <AmountField digits={digits} onChangeDigits={setDigits} />
        </View>

        <View
          style={{
            backgroundColor: theme.colors.bgFloat,
            borderColor: theme.colors.borderSubtle,
            borderWidth: 1,
            borderRadius: 12,
          }}
        >
          {!isTransfer && !isIncome ? (
            <SelectRow
              label={t('movements.detail.category')}
              value={categoryName}
              expanded={expanded === 'category'}
              onToggle={() => setExpanded((e) => (e === 'category' ? null : 'category'))}
            >
              <View style={{ paddingHorizontal: 12, paddingBottom: 10 }}>
                <OptionListInline
                  options={categoryOptions.map((c) => c.name)}
                  selected={categoryName}
                  onSelect={(name) => {
                    const match = categoryOptions.find((c) => c.name === name);
                    if (match) setCategoryId(match.id);
                    setExpanded(null);
                  }}
                />
              </View>
            </SelectRow>
          ) : null}
          <SelectRow
            label={t('movements.detail.account')}
            value={accountName}
            expanded={expanded === 'account'}
            onToggle={() => setExpanded((e) => (e === 'account' ? null : 'account'))}
            last
          >
            <View style={{ paddingHorizontal: 12, paddingBottom: 10 }}>
              <OptionListInline
                options={accountOptions.map((a) => a.name)}
                selected={accountName}
                onSelect={(name) => {
                  const match = accountOptions.find((a) => a.name === name);
                  if (match) setAccountId(match.id);
                  setExpanded(null);
                }}
              />
            </View>
          </SelectRow>
        </View>

        <Button
          label={t('movements.detail.save')}
          full
          disabled={!valid}
          onPress={handleSave}
        />

        <DeleteFlow
          label={t('movements.detail.delete')}
          confirmTitle={t('movements.detail.deleteConfirmTitle', {
            name: tx.description,
          })}
          confirmLabel={t('movements.detail.deleteConfirm')}
          cancelLabel={t('movements.detail.cancel')}
          confirming={confirmingDelete}
          onToggle={setConfirmingDelete}
          onConfirm={onDelete}
        />
      </View>
    </BottomSheet>
  );
}
