import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useAccounts } from '@/modules/accounts/presentation/hooks/useAccounts';
import { useCategories } from '@/modules/categories/presentation/hooks/useCategories';
import type { SourceRef } from '@/modules/movements/domain';
import {
  AmountField,
  BottomSheet,
  Button,
  DatePickerSheet,
  DeleteFlow,
  FieldLabel,
  Segmented,
  SelectListInline,
  SelectRow,
  Text,
  TextField,
} from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { addDays, dayLabel } from '@/shared/presentation/utils/dates';

import type { Frequency, NewSubscription, Subscription } from '../../domain';

export type SubscriptionFormInput = NewSubscription & { active?: boolean };

type Props = {
  visible: boolean;
  subscription: Subscription | null;
  /** The device's local day, for the calendar. */
  today: string;
  saving?: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onSave: (input: SubscriptionFormInput) => void;
  onDelete: () => void;
};

const FREQUENCIES = ['weekly', 'monthly', 'yearly'] as const;

/** `type:id` keeps a source option unique — two sources may share a name. */
const refKey = (ref: SourceRef) => `${ref.type}:${ref.id}`;
function parseRef(key: string): SourceRef {
  const [type, ...rest] = key.split(':');
  return { type: type as SourceRef['type'], id: rest.join(':') };
}

export function SubscriptionFormSheet({
  visible,
  subscription,
  today,
  saving = false,
  errorMessage,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const language = i18n.language.startsWith('en') ? 'en' : 'es';

  const accounts = useAccounts();
  const categories = useCategories();

  const [name, setName] = useState('');
  const [digits, setDigits] = useState('');
  const [frequency, setFrequency] = useState<Frequency>('monthly');
  const [firstChargeOn, setFirstChargeOn] = useState(today);
  const [sourceKey, setSourceKey] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [active, setActive] = useState(true);
  const [expanded, setExpanded] = useState<'source' | 'category' | 'date' | null>(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const editing = subscription !== null;

  // Charged to an account or to a card — most subscriptions are on a card.
  const sourceOptions = useMemo(
    () => [
      ...(accounts.data?.accounts ?? []).map((account) => ({
        value: refKey({ type: 'account', id: account.id }),
        label: account.name,
      })),
      ...(accounts.data?.creditCards ?? []).map((card) => ({
        value: refKey({ type: 'credit_card', id: card.id }),
        label: card.name,
      })),
    ],
    [accounts.data],
  );

  const categoryOptions = useMemo(
    () =>
      (categories.data ?? [])
        .filter((category) => category.flow === 'expense')
        .map((category) => ({ value: category.id, label: category.name })),
    [categories.data],
  );

  useEffect(() => {
    if (!visible) return;
    setName(subscription?.name ?? '');
    setDigits(subscription ? String(subscription.amount) : '');
    setFrequency(subscription?.frequency ?? 'monthly');
    setFirstChargeOn(subscription?.firstChargeOn ?? today);
    setSourceKey(subscription ? refKey(subscription.source) : null);
    // The charge is an expense, and the standard catalog already has "Suscripciones".
    setCategoryId(subscription ? subscription.categoryId : 'subs');
    setActive(subscription?.active ?? true);
    setExpanded(null);
    setConfirmingDelete(false);
  }, [visible, subscription, today]);

  // Keep the selection valid while the catalogs load.
  useEffect(() => {
    if (sourceKey === null && sourceOptions.length > 0) {
      setSourceKey(sourceOptions[0]?.value ?? null);
    }
  }, [sourceKey, sourceOptions]);

  const amount = Number(digits || '0');
  const valid = name.trim().length >= 2 && amount > 0 && sourceKey !== null;

  // Derived, never stored: a label like "tomorrow" is wrong the next day.
  const labelFor = (iso: string) =>
    iso === addDays(today, 1)
      ? t('subscriptions.form.tomorrow')
      : dayLabel(iso, today, language, {
          today: t('movements.days.today'),
          yesterday: t('movements.days.yesterday'),
        });
  // A first charge is usually today or tomorrow; anything else opens the calendar.
  const dateOptions = [today, addDays(today, 1)].map((iso) => ({
    value: iso,
    label: labelFor(iso),
  }));

  const sourceLabel =
    sourceOptions.find((option) => option.value === sourceKey)?.label ??
    t('subscriptions.form.noSource');
  const categoryLabel =
    categoryOptions.find((option) => option.value === categoryId)?.label ??
    t('subscriptions.form.noCategory');

  const box = {
    backgroundColor: theme.colors.bgFloat,
    borderColor: theme.colors.borderSubtle,
    borderWidth: 1,
    borderRadius: 12,
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} maxHeight="92%">
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
            options={FREQUENCIES}
            value={frequency}
            onChange={setFrequency}
            labels={{
              weekly: t('subscriptions.form.cadences.weekly'),
              monthly: t('subscriptions.form.cadences.monthly'),
              yearly: t('subscriptions.form.cadences.yearly'),
            }}
          />
        </View>

        <View style={box}>
          <SelectRow
            label={t('subscriptions.form.firstCharge')}
            value={labelFor(firstChargeOn)}
            expanded={expanded === 'date'}
            onToggle={() => setExpanded(expanded === 'date' ? null : 'date')}
          >
            <View style={{ paddingHorizontal: 12, paddingBottom: 10 }}>
              <SelectListInline
                options={[
                  ...dateOptions,
                  { value: 'pick', label: t('subscriptions.form.pickDate') },
                ]}
                selected={firstChargeOn}
                onSelect={(value) => {
                  setExpanded(null);
                  if (value === 'pick') {
                    setDatePickerOpen(true);
                    return;
                  }
                  setFirstChargeOn(value);
                }}
              />
            </View>
          </SelectRow>
          <SelectRow
            label={t('subscriptions.form.source')}
            value={sourceLabel}
            expanded={expanded === 'source'}
            onToggle={() => setExpanded(expanded === 'source' ? null : 'source')}
          >
            <View style={{ paddingHorizontal: 12, paddingBottom: 10 }}>
              <SelectListInline
                options={sourceOptions}
                selected={sourceKey}
                onSelect={(value) => {
                  setSourceKey(value);
                  setExpanded(null);
                }}
              />
            </View>
          </SelectRow>
          <SelectRow
            label={t('subscriptions.form.category')}
            value={categoryLabel}
            expanded={expanded === 'category'}
            onToggle={() => setExpanded(expanded === 'category' ? null : 'category')}
            last
          >
            <View style={{ paddingHorizontal: 12, paddingBottom: 10 }}>
              <SelectListInline
                options={categoryOptions}
                selected={categoryId}
                onSelect={(value) => {
                  setCategoryId(value);
                  setExpanded(null);
                }}
              />
            </View>
          </SelectRow>
        </View>

        {editing ? (
          <Button
            label={
              active ? t('subscriptions.form.pause') : t('subscriptions.form.resume')
            }
            variant="secondary"
            full
            onPress={() => setActive((current) => !current)}
          />
        ) : null}

        {errorMessage ? (
          <Text variant="caption" color={theme.colors.accentCoral}>
            {errorMessage}
          </Text>
        ) : null}

        <Button
          label={t('subscriptions.form.save')}
          full
          loading={saving}
          disabled={!valid || saving}
          onPress={() => {
            if (sourceKey === null) return;
            onSave({
              name: name.trim(),
              amount,
              frequency,
              firstChargeOn,
              source: parseRef(sourceKey),
              categoryId,
              ...(editing ? { active } : {}),
            });
          }}
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

      <DatePickerSheet
        visible={datePickerOpen}
        value={firstChargeOn}
        today={today}
        // A subscription can start tomorrow — that is the point of a forecast.
        allowFuture
        title={t('subscriptions.form.firstCharge')}
        language={language}
        onClose={() => setDatePickerOpen(false)}
        onSelect={(iso) => {
          setFirstChargeOn(iso);
          setDatePickerOpen(false);
        }}
      />
    </BottomSheet>
  );
}
