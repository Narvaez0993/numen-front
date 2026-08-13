import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, TextInput, View } from 'react-native';

import { useAccounts } from '@/modules/accounts/presentation/hooks/useAccounts';
import { useCategories } from '@/modules/categories/presentation/hooks/useCategories';
import type { MovementType, NewMovement, SourceRef } from '@/modules/movements/domain';
import {
  AmountSheet,
  ChooseSheet,
  DatePickerSheet,
  Icon,
  SheetFieldRow,
  Text,
} from '@/shared/presentation/components';
import { useCurrencyStore } from '@/shared/presentation/currency/useCurrencyStore';
import { useTheme } from '@/shared/presentation/theme';
import { dayLabel, toIsoDate } from '@/shared/presentation/utils/dates';

/** Values the form opens with — how an agent draft lands here already filled in,
 * instead of making the user retype it. */
export type ManualPrefill = {
  amount?: number;
  description?: string;
  categoryId?: string | null;
  source?: SourceRef;
  destination?: SourceRef | null;
  occurredOn?: string;
};

type Props = {
  visible: boolean;
  initialType?: MovementType;
  initialValues?: ManualPrefill;
  onSave: (movement: NewMovement) => void;
  /** Back to speaking — the arrow in the header and the mic beside Guardar. */
  onSpeak: () => void;
  onClose: () => void;
  saving?: boolean;
  errorMessage?: string | null;
};

type Picker = 'category' | 'source' | 'destination' | null;

const TYPES: MovementType[] = ['expense', 'income', 'transfer'];

/** `type:id` keeps a source option unique — two accounts may share a name. */
const refKey = (ref: SourceRef) => `${ref.type}:${ref.id}`;
const parseRefKey = (key: string): SourceRef => {
  const [type, ...rest] = key.split(':');
  return { type: type as SourceRef['type'], id: rest.join(':') };
};

/**
 * Writing it down, when talking is not the way.
 *
 * The layout is upside-down compared to an ordinary form, and deliberately: the
 * **amount is at the top at 50px and the keypad is at the bottom**, with the
 * fields squeezed between them. That is the order the hand works in — the number
 * is the only thing that must be right, everything else already has a sensible
 * default, and the save button is a thumb-reach from the last key you pressed.
 *
 * It uses the app's own keypad rather than the system one so the bottom third is
 * a known height. With a system keyboard the sheet would have to scroll, and a
 * capture you scroll is a form.
 *
 * The mic never disappears: it is in the header as a back arrow and beside
 * Guardar as a button. Choosing to type should never be a door that locks.
 */
export function ManualSheet({
  visible,
  initialType = 'expense',
  initialValues,
  onSave,
  onSpeak,
  onClose,
  saving = false,
  errorMessage,
}: Props) {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const currency = useCurrencyStore((s) => s.currency);
  const language = i18n.language.startsWith('en') ? 'en' : 'es';

  const categories = useCategories();
  const accounts = useAccounts();

  const [today] = useState(() => toIsoDate(new Date()));
  const [type, setType] = useState<MovementType>(initialType);
  const [digits, setDigits] = useState(() =>
    initialValues?.amount !== undefined ? String(initialValues.amount) : '',
  );
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [editingDescription, setEditingDescription] = useState(false);
  const [categoryId, setCategoryId] = useState<string | null>(
    initialValues?.categoryId ?? null,
  );
  const [sourceKey, setSourceKey] = useState<string | null>(() =>
    initialValues?.source ? refKey(initialValues.source) : null,
  );
  const [destinationKey, setDestinationKey] = useState<string | null>(() =>
    initialValues?.destination ? refKey(initialValues.destination) : null,
  );
  const [occurredOn, setOccurredOn] = useState(initialValues?.occurredOn ?? today);
  const [picker, setPicker] = useState<Picker>(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  // An income lands on an account; a card is somewhere you owe, not somewhere you
  // get paid (a refund is handled by adjusting the card's debt).
  const sourceOptions = useMemo(() => {
    const list = (accounts.data?.accounts ?? []).map((account) => ({
      value: refKey({ type: 'account', id: account.id }),
      label: account.name,
    }));
    if (type === 'income') return list;
    return [
      ...list,
      ...(accounts.data?.creditCards ?? []).map((card) => ({
        value: refKey({ type: 'credit_card', id: card.id }),
        label: card.name,
      })),
    ];
  }, [accounts.data, type]);

  const categoryOptions = useMemo(() => {
    const flow = type === 'income' ? 'income' : 'expense';
    return (categories.data ?? [])
      .filter((category) => category.flow === flow)
      .map((category) => ({ value: category.id, label: category.name }));
  }, [categories.data, type]);

  const labelFor = useCallback(
    (iso: string) =>
      dayLabel(iso, today, language, {
        today: t('movements.days.today'),
        yesterday: t('movements.days.yesterday'),
      }),
    [today, language, t],
  );

  // Keep the selections valid as the catalogs load or the type changes.
  useEffect(() => {
    if (sourceOptions.length === 0) return;
    if (!sourceOptions.some((option) => option.value === sourceKey)) {
      setSourceKey(sourceOptions[0]!.value);
    }
  }, [sourceOptions, sourceKey]);

  useEffect(() => {
    if (type === 'transfer') {
      setCategoryId(null);
      return;
    }
    setDestinationKey(null);
    // While the catalog is still loading, leave the selection alone — otherwise
    // this pass would wipe a prefilled category before it had a chance to exist.
    if (categoryOptions.length === 0) return;
    if (!categoryOptions.some((option) => option.value === categoryId)) {
      setCategoryId(categoryOptions[0]?.value ?? null);
    }
  }, [type, categoryOptions, categoryId]);

  const destinationOptions = sourceOptions.filter((option) => option.value !== sourceKey);
  const amount = Number(digits || '0');
  const source = sourceKey ? parseRefKey(sourceKey) : null;
  const destination = destinationKey ? parseRefKey(destinationKey) : null;
  const needsDestination = type === 'transfer';
  const valid =
    amount > 0 &&
    source !== null &&
    (needsDestination ? destination !== null : description.trim().length >= 2);

  const sourceLabel =
    sourceOptions.find((option) => option.value === sourceKey)?.label ?? '—';
  const destinationLabel =
    destinationOptions.find((option) => option.value === destinationKey)?.label ?? '—';
  const categoryLabel =
    categoryOptions.find((option) => option.value === categoryId)?.label ?? '—';
  // Derived, not looked up in a quick list: a date picked from the calendar is
  // usually older than the shortcuts and would otherwise render blank.
  const dateLabel = labelFor(occurredOn);

  const handleSave = () => {
    if (!valid || saving || source === null) return;
    onSave({
      type,
      description:
        description.trim() || `${sourceLabel} → ${destinationLabel}`.slice(0, 80),
      amount,
      source,
      destination: needsDestination ? destination : null,
      categoryId: needsDestination ? null : categoryId,
      occurredOn,
      capturedVia: 'manual',
    });
  };

  const amountColor =
    type === 'income'
      ? theme.colors.accentMint
      : type === 'transfer'
        ? theme.colors.textSecondary
        : theme.colors.textPrimary;
  const sign = type === 'income' ? '+' : type === 'transfer' ? '' : '−';

  const noSources = accounts.data && accounts.data.accounts.length === 0;

  if (noSources) {
    return (
      <AmountSheet
        visible={visible}
        onClose={onClose}
        digits=""
        onDigits={() => undefined}
        primaryLabel={t('common.close')}
        onPrimary={onClose}
        header={
          <Text style={{ flex: 1, fontSize: 16, fontWeight: '500' }}>
            {t('expenses.sheet.manualEntry.noSources.title')}
          </Text>
        }
        help={t('expenses.sheet.manualEntry.noSources.body')}
      />
    );
  }

  return (
    <>
      <AmountSheet
        visible={visible}
        onClose={onClose}
        digits={digits}
        onDigits={setDigits}
        currency={currency}
        sign={sign}
        amountColor={amountColor}
        primaryLabel={t('expenses.sheet.manualEntry.save')}
        onPrimary={handleSave}
        primaryDisabled={!valid || saving}
        onMic={onSpeak}
        header={
          <>
            {/* Back to speaking. The mic never disappears — choosing to type
                should not be a door that locks. */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('expenses.voice.mic')}
              onPress={onSpeak}
              style={({ pressed }) => ({
                width: 34,
                height: 34,
                borderRadius: 17,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: theme.colors.bgFloat,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Icon
                name="arrow-left"
                size={15}
                stroke={2}
                color={theme.colors.textSecondary}
              />
            </Pressable>

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
              {TYPES.map((option) => {
                const active = option === type;
                return (
                  <Pressable
                    key={option}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    onPress={() => setType(option)}
                    style={({ pressed }) => ({
                      flex: 1,
                      alignItems: 'center',
                      paddingVertical: 8,
                      borderRadius: 11,
                      backgroundColor: active ? theme.colors.bgElevated : 'transparent',
                      opacity: pressed ? 0.8 : 1,
                    })}
                  >
                    <Text
                      color={
                        active ? theme.colors.textPrimary : theme.colors.textTertiary
                      }
                      style={{ fontSize: 12.5, fontWeight: '500' }}
                    >
                      {t(`expenses.sheet.manualEntry.type.${option}`)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        }
        overlays={
          <>
            <ChooseSheet
              visible={picker === 'category'}
              title={t('expenses.sheet.manualEntry.category')}
              options={categoryOptions}
              value={categoryId}
              onChange={setCategoryId}
              onClose={() => setPicker(null)}
            />
            <ChooseSheet
              visible={picker === 'source'}
              title={t(
                type === 'income'
                  ? 'expenses.sheet.manualEntry.destination'
                  : 'expenses.sheet.manualEntry.source',
              )}
              options={sourceOptions}
              value={sourceKey}
              onChange={setSourceKey}
              onClose={() => setPicker(null)}
            />
            <ChooseSheet
              visible={picker === 'destination'}
              title={t('expenses.sheet.manualEntry.destination')}
              options={destinationOptions}
              value={destinationKey}
              onChange={setDestinationKey}
              onClose={() => setPicker(null)}
            />
            <DatePickerSheet
              visible={datePickerOpen}
              value={occurredOn}
              today={today}
              title={t('expenses.sheet.manualEntry.date')}
              language={language}
              onSelect={setOccurredOn}
              onClose={() => setDatePickerOpen(false)}
            />
          </>
        }
      >
        <SheetFieldRow
          label={t('expenses.sheet.manualEntry.description')}
          onPress={() => setEditingDescription(true)}
        >
          {editingDescription ? (
            <TextInput
              value={description}
              onChangeText={setDescription}
              autoFocus
              maxLength={80}
              onBlur={() => setEditingDescription(false)}
              style={{
                flex: 1,
                textAlign: 'right',
                fontSize: 13.5,
                color: theme.colors.textPrimary,
                fontFamily: 'Geist_400Regular',
                padding: 0,
              }}
            />
          ) : (
            <Text
              numberOfLines={1}
              color={description ? theme.colors.textPrimary : theme.colors.textTertiary}
              style={{ flex: 1, textAlign: 'right', fontSize: 13.5 }}
            >
              {description || t('expenses.sheet.manualEntry.descriptionPlaceholder')}
            </Text>
          )}
        </SheetFieldRow>

        {type !== 'transfer' ? (
          <SheetFieldRow
            label={t('expenses.sheet.manualEntry.category')}
            value={categoryLabel}
            chevron
            onPress={() => setPicker('category')}
          />
        ) : null}

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <SheetFieldRow
              label={t(
                type === 'income'
                  ? 'expenses.sheet.manualEntry.destination'
                  : 'expenses.sheet.manualEntry.source',
              )}
              value={sourceLabel}
              chevron
              onPress={() => setPicker('source')}
            />
          </View>
          <SheetFieldRow value={dateLabel} onPress={() => setDatePickerOpen(true)} />
        </View>

        {needsDestination ? (
          <SheetFieldRow
            label={t('expenses.sheet.manualEntry.destination')}
            value={destinationLabel}
            chevron
            onPress={() => setPicker('destination')}
          />
        ) : null}

        {errorMessage ? (
          <Text color={theme.colors.accentCoral} style={{ fontSize: 12 }}>
            {errorMessage}
          </Text>
        ) : null}
      </AmountSheet>
    </>
  );
}
