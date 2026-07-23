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
  Segmented,
  SelectRow,
  Text,
  TextField,
} from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

import type { Subscription } from '../../domain';

export type SubscriptionFormInput = {
  name: string;
  amount: number;
  every: number;
  account: string;
};

type Props = {
  visible: boolean;
  subscription: Subscription | null;
  onClose: () => void;
  onSave: (input: SubscriptionFormInput) => void;
  onDelete: () => void;
};

const ACCOUNTS = ['BBVA Débito', 'Bancolombia', 'Efectivo', 'BBVA Crédito'];
const CADENCES = ['weekly', 'monthly', 'yearly'] as const;
type Cadence = (typeof CADENCES)[number];

const CADENCE_DAYS: Record<Cadence, number> = {
  weekly: 7,
  monthly: 30,
  yearly: 365,
};

function cadenceFromDays(days: number): Cadence {
  if (days <= 7) return 'weekly';
  if (days >= 365) return 'yearly';
  return 'monthly';
}

export function SubscriptionFormSheet({
  visible,
  subscription,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const editing = subscription != null;

  const [name, setName] = useState('');
  const [digits, setDigits] = useState('');
  const [cadence, setCadence] = useState<Cadence>('monthly');
  const [account, setAccount] = useState(ACCOUNTS[0] ?? 'Efectivo');
  const [accountExpanded, setAccountExpanded] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setName(subscription?.name ?? '');
    setDigits(subscription ? String(subscription.amount) : '');
    setCadence(subscription ? cadenceFromDays(subscription.every) : 'monthly');
    setAccount(subscription?.account ?? ACCOUNTS[0] ?? 'Efectivo');
    setAccountExpanded(false);
    setConfirmingDelete(false);
  }, [visible, subscription]);

  const amount = Number(digits || '0');
  const valid = name.trim().length >= 2 && amount > 0;

  return (
    <BottomSheet visible={visible} onClose={onClose} maxHeight="88%">
      <View style={{ paddingHorizontal: 22, paddingTop: 8, paddingBottom: 26, gap: 16 }}>
        <View>
          <Text variant="h1" style={{ fontSize: 16 }}>
            {editing
              ? t('subscriptions.form.editTitle')
              : t('subscriptions.form.newTitle')}
          </Text>
          <Text
            variant="caption"
            color={theme.colors.textSecondary}
            style={{ marginTop: 4 }}
          >
            {t('subscriptions.form.subtitle')}
          </Text>
        </View>

        <View>
          <FieldLabel label={t('subscriptions.form.name')} />
          <TextField
            value={name}
            onChangeText={setName}
            placeholder={t('subscriptions.form.namePlaceholder')}
            autoFocus={!editing}
          />
        </View>

        <View>
          <FieldLabel label={t('subscriptions.form.amount')} />
          <AmountField digits={digits} onChangeDigits={setDigits} />
        </View>

        <View>
          <FieldLabel label={t('subscriptions.form.cadence')} />
          <Segmented
            options={CADENCES}
            value={cadence}
            onChange={setCadence}
            labels={{
              weekly: t('subscriptions.form.cadences.weekly'),
              monthly: t('subscriptions.form.cadences.monthly'),
              yearly: t('subscriptions.form.cadences.yearly'),
            }}
          />
        </View>

        <View
          style={{
            backgroundColor: theme.colors.bgFloat,
            borderColor: theme.colors.borderSubtle,
            borderWidth: 1,
            borderRadius: 12,
          }}
        >
          <SelectRow
            label={t('subscriptions.form.account')}
            value={account}
            expanded={accountExpanded}
            onToggle={() => setAccountExpanded((e) => !e)}
            last
          >
            <View style={{ paddingHorizontal: 12, paddingBottom: 10 }}>
              <OptionListInline
                options={ACCOUNTS}
                selected={account}
                onSelect={(value) => {
                  setAccount(value);
                  setAccountExpanded(false);
                }}
              />
            </View>
          </SelectRow>
        </View>

        <Button
          label={t('subscriptions.form.save')}
          full
          disabled={!valid}
          onPress={() =>
            onSave({
              name: name.trim(),
              amount,
              every: CADENCE_DAYS[cadence],
              account,
            })
          }
        />

        {editing ? (
          <DeleteFlow
            label={t('subscriptions.form.delete')}
            confirmTitle={t('subscriptions.form.deleteConfirmTitle', {
              name: subscription.name,
            })}
            confirmLabel={t('subscriptions.form.deleteConfirm')}
            cancelLabel={t('subscriptions.form.cancel')}
            confirming={confirmingDelete}
            onToggle={setConfirmingDelete}
            onConfirm={onDelete}
          />
        ) : null}
      </View>
    </BottomSheet>
  );
}
