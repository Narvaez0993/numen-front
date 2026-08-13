import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, TextInput, View } from 'react-native';

import { useAccounts } from '@/modules/accounts/presentation/hooks/useAccounts';
import { useCategories } from '@/modules/categories/presentation/hooks/useCategories';
import type { SourceRef } from '@/modules/movements/domain';
import type { CurrencyCode } from '@/shared/domain';
import {
  AmountSheet,
  ChooseSheet,
  DatePickerSheet,
  SheetDangerAction,
  SheetFieldRow,
  SheetHeaderButton,
  Text,
} from '@/shared/presentation/components';
import { useCurrencyStore } from '@/shared/presentation/currency/useCurrencyStore';
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

/** `type:id` keeps a source option unique — two accounts may share a name. */
const refKey = (ref: SourceRef) => `${ref.type}:${ref.id}`;
function parseRef(key: string): SourceRef {
  const [type, ...rest] = key.split(':');
  return { type: type as SourceRef['type'], id: rest.join(':') };
}

type Picker = 'source' | 'category' | null;

/**
 * A subscription — `CREAR` with four fields, which is the shape this sheet was
 * built for.
 *
 * The system keyboard rather than the app's pad, because a subscription has a
 * name. Everything else picks from a list, so only the amount and the name are
 * ever typed.
 *
 * Frequency sits in the header as a switch. It is the field that changes what
 * every other number MEANS — $16.900 weekly and $16.900 yearly are not close to
 * the same subscription — so it belongs above them rather than buried in a row.
 * The amount's own label follows it, which is the cheapest way to make the
 * difference impossible to miss.
 */
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
  const currency = useCurrencyStore((s) => s.currency) as CurrencyCode;
  const accounts = useAccounts();
  const categories = useCategories();

  const [name, setName] = useState('');
  const [digits, setDigits] = useState('');
  const [frequency, setFrequency] = useState<Frequency>('monthly');
  const [firstChargeOn, setFirstChargeOn] = useState(today);
  const [sourceKey, setSourceKey] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [active, setActive] = useState(true);
  const [picker, setPicker] = useState<Picker>(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

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
    setPicker(null);
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
  const dateLabel =
    firstChargeOn === addDays(today, 1)
      ? t('subscriptions.form.tomorrow')
      : dayLabel(firstChargeOn, today, language, {
          today: t('movements.days.today'),
          yesterday: t('movements.days.yesterday'),
        });

  const sourceLabel =
    sourceOptions.find((option) => option.value === sourceKey)?.label ??
    t('subscriptions.form.noSource');
  const categoryLabel =
    categoryOptions.find((option) => option.value === categoryId)?.label ??
    t('subscriptions.form.noCategory');

  return (
    <>
      <AmountSheet
        visible={visible}
        onClose={onClose}
        keyboard="system"
        digits={digits}
        onDigits={setDigits}
        currency={currency}
        label={t(`subscriptions.form.amountLabel.${frequency}`)}
        help={errorMessage ?? t('subscriptions.form.help')}
        amountColor={errorMessage ? theme.colors.accentCoral : undefined}
        primaryLabel={t('subscriptions.form.save')}
        primaryDisabled={!valid || saving}
        onPrimary={() =>
          sourceKey !== null &&
          onSave({
            name: name.trim(),
            amount,
            frequency,
            firstChargeOn,
            source: parseRef(sourceKey),
            categoryId,
            ...(editing ? { active } : {}),
          })
        }
        header={
          <>
            <SheetHeaderButton icon="x" label={t('common.close')} onPress={onClose} />
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                gap: 6,
                padding: 3,
                borderRadius: 14,
                backgroundColor: theme.colors.bgSurface,
              }}
            >
              {FREQUENCIES.map((option) => {
                const selected = option === frequency;
                return (
                  <Pressable
                    key={option}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => setFrequency(option)}
                    style={({ pressed }) => ({
                      flex: 1,
                      alignItems: 'center',
                      paddingVertical: 8,
                      borderRadius: 11,
                      backgroundColor: selected ? theme.colors.bgElevated : 'transparent',
                      opacity: pressed ? 0.8 : 1,
                    })}
                  >
                    <Text
                      color={
                        selected ? theme.colors.textPrimary : theme.colors.textTertiary
                      }
                      style={{ fontSize: 12.5, fontWeight: '500' }}
                    >
                      {t(`subscriptions.form.cadences.${option}`)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            {editing ? (
              <SheetDangerAction
                label={t('subscriptions.form.delete')}
                confirmLabel={t('subscriptions.form.deleteConfirm')}
                onConfirm={onDelete}
              />
            ) : null}
          </>
        }
      >
        <SheetFieldRow label={t('subscriptions.form.name')} onPress={() => undefined}>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder={t('subscriptions.form.namePlaceholder')}
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
          label={t('subscriptions.form.source')}
          value={sourceLabel}
          chevron
          onPress={() => setPicker('source')}
        />

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <SheetFieldRow
              label={t('subscriptions.form.category')}
              value={categoryLabel}
              chevron
              onPress={() => setPicker('category')}
            />
          </View>
          <SheetFieldRow value={dateLabel} onPress={() => setDatePickerOpen(true)} />
        </View>

        {editing ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => setActive((current) => !current)}
            style={({ pressed }) => ({
              minHeight: 44,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text color={theme.colors.textSecondary} style={{ fontSize: 12.5 }}>
              {t(active ? 'subscriptions.form.pause' : 'subscriptions.form.resume')}
            </Text>
          </Pressable>
        ) : null}
      </AmountSheet>

      <ChooseSheet
        visible={picker === 'source'}
        title={t('subscriptions.form.source')}
        options={sourceOptions}
        value={sourceKey}
        onChange={setSourceKey}
        onClose={() => setPicker(null)}
      />
      <ChooseSheet
        visible={picker === 'category'}
        title={t('subscriptions.form.category')}
        options={categoryOptions}
        value={categoryId}
        onChange={setCategoryId}
        onClose={() => setPicker(null)}
      />
      <DatePickerSheet
        visible={datePickerOpen}
        value={firstChargeOn}
        today={today}
        allowFuture
        title={t('subscriptions.form.firstCharge')}
        language={i18n.language}
        onSelect={setFirstChargeOn}
        onClose={() => setDatePickerOpen(false)}
      />
    </>
  );
}
