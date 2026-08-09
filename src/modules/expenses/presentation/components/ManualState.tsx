import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Pressable, TextInput, View } from 'react-native';

import { useAccounts } from '@/modules/accounts/presentation/hooks/useAccounts';
import { useCategories } from '@/modules/categories/presentation/hooks/useCategories';
import type { MovementType, NewMovement, SourceRef } from '@/modules/movements/domain';
import {
  Button,
  CategoryPickerInline,
  DatePickerSheet,
  SelectListInline,
  SelectRow,
  Text,
} from '@/shared/presentation/components';
import { useCurrencyStore } from '@/shared/presentation/currency/useCurrencyStore';
import { accentColorKey, useTheme } from '@/shared/presentation/theme';
import { dayLabel, recentDays, toIsoDate } from '@/shared/presentation/utils/dates';
import { formatAmountDigits } from '@/shared/presentation/utils/formatMoney';

/** Values the form opens with — how an agent draft (or any future parse)
 * lands here already filled in, instead of making the user retype it. */
export type ManualPrefill = {
  amount?: number;
  description?: string;
  categoryId?: string | null;
  source?: SourceRef;
  destination?: SourceRef | null;
  occurredOn?: string;
};

type Props = {
  /** Which movement type the form opens on (default `expense`). */
  initialType?: MovementType;
  initialValues?: ManualPrefill;
  onSave: (movement: NewMovement) => void;
  saving?: boolean;
  errorMessage?: string | null;
};

type ExpandedField = 'category' | 'source' | 'destination' | 'date' | null;

/** Quick options; anything older opens the calendar. */
const QUICK_DAYS = 3;

const TYPES: MovementType[] = ['expense', 'income', 'transfer'];

/** `type:id` keeps a source picker option unique — two accounts may share a name. */
const refKey = (ref: SourceRef) => `${ref.type}:${ref.id}`;
const parseRefKey = (key: string): SourceRef => {
  const [type, ...rest] = key.split(':');
  return { type: type as SourceRef['type'], id: rest.join(':') };
};

export function ManualState({
  initialType = 'expense',
  initialValues,
  onSave,
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
  const [expanded, setExpanded] = useState<ExpandedField>(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const amountRef = useRef<TextInput>(null);
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
    const tid = setTimeout(() => amountRef.current?.focus(), 250);
    return () => clearTimeout(tid);
  }, [opacity]);

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
      .map((category) => ({
        id: category.id,
        name: category.name,
        color: category.color === 'neutral' ? ('mint' as const) : category.color,
      }));
  }, [categories.data, type]);

  const labelFor = useCallback(
    (iso: string) =>
      dayLabel(iso, today, language, {
        today: t('movements.days.today'),
        yesterday: t('movements.days.yesterday'),
      }),
    [today, language, t],
  );

  const dateOptions = useMemo(
    () =>
      recentDays(QUICK_DAYS, today).map((iso) => ({ value: iso, label: labelFor(iso) })),
    [today, labelFor],
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
    if (!categoryOptions.some((option) => option.id === categoryId)) {
      setCategoryId(categoryOptions[0]?.id ?? null);
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

  const selectedCategory = categoryOptions.find((option) => option.id === categoryId);
  const sourceLabel =
    sourceOptions.find((option) => option.value === sourceKey)?.label ?? '—';
  const destinationLabel =
    destinationOptions.find((option) => option.value === destinationKey)?.label ?? '—';
  // Derived, not looked up in the quick list: a date picked from the calendar is
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

  if (accounts.data && accounts.data.accounts.length === 0) {
    return (
      <View style={{ paddingVertical: 24, paddingHorizontal: 10, gap: 8 }}>
        <Text variant="h1" style={{ fontSize: 16, textAlign: 'center' }}>
          {t('expenses.sheet.manualEntry.noSources.title')}
        </Text>
        <Text
          variant="caption"
          color={theme.colors.textSecondary}
          style={{ textAlign: 'center', lineHeight: 19 }}
        >
          {t('expenses.sheet.manualEntry.noSources.body')}
        </Text>
      </View>
    );
  }

  return (
    <Animated.View style={{ gap: 14, paddingTop: 4, opacity }}>
      <View style={{ paddingHorizontal: 40 }}>
        <Text variant="h1" style={{ fontSize: 16, textAlign: 'center' }}>
          {t('expenses.sheet.manualEntry.title')}
        </Text>
        <Text
          variant="caption"
          color={theme.colors.textSecondary}
          style={{ marginTop: 4, textAlign: 'center' }}
        >
          {t('expenses.sheet.manualEntry.subtitle')}
        </Text>
      </View>

      <View
        style={{
          flexDirection: 'row',
          backgroundColor: theme.colors.bgSurface,
          borderRadius: 14,
          padding: 3,
          gap: 6,
        }}
      >
        {TYPES.map((option) => {
          const active = option === type;
          return (
            <Pressable
              key={option}
              accessibilityRole="button"
              onPress={() => {
                setType(option);
                setExpanded(null);
              }}
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
                variant="label"
                color={active ? theme.colors.textPrimary : theme.colors.textTertiary}
                style={{ fontSize: 12.5, fontWeight: '500' }}
              >
                {t(`expenses.sheet.manualEntry.type.${option}`)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View
        style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4, paddingTop: 6 }}
      >
        <Text tabular color={amountColor} style={{ fontSize: 21, fontWeight: '300' }}>
          {type === 'income' ? '+' : ''}$
        </Text>
        <TextInput
          ref={amountRef}
          value={formatAmountDigits(digits, currency)}
          onChangeText={(v) => setDigits(v.replace(/\D/g, ''))}
          keyboardType="number-pad"
          placeholder="0"
          placeholderTextColor={theme.colors.textTertiary}
          style={{
            flex: 1,
            fontSize: 50,
            lineHeight: 54,
            letterSpacing: -2.4,
            color: amountColor,
            fontFamily: 'Geist_500Medium',
            fontVariant: ['tabular-nums'],
            padding: 0,
          }}
        />
      </View>

      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder={t('expenses.sheet.manualEntry.descriptionPlaceholder')}
        placeholderTextColor={theme.colors.textTertiary}
        maxLength={80}
        style={{
          backgroundColor: theme.colors.bgFloat,
          borderWidth: 1,
          borderColor: theme.colors.borderSubtle,
          borderRadius: 16,
          paddingHorizontal: 16,
          paddingVertical: 13,
          minHeight: 44,
          fontSize: 14,
          color: theme.colors.textPrimary,
          fontFamily: 'Geist_400Regular',
        }}
      />

      <View style={{ gap: 10 }}>
        {type !== 'transfer' ? (
          <SelectRow
            label={t('expenses.sheet.manualEntry.category')}
            value={selectedCategory?.name ?? '—'}
            valueColor={
              selectedCategory
                ? theme.colors[accentColorKey(selectedCategory.color, 'fg')]
                : undefined
            }
            expanded={expanded === 'category'}
            onToggle={() => setExpanded((e) => (e === 'category' ? null : 'category'))}
          >
            <View style={{ paddingHorizontal: 12, paddingBottom: 12 }}>
              <CategoryPickerInline
                categories={categoryOptions.map((option) => ({
                  name: option.name,
                  color: option.color,
                }))}
                selected={selectedCategory?.name ?? ''}
                onSelect={(name) => {
                  // Names are unique per flow (the API enforces it), so the label
                  // maps back to exactly one category.
                  const match = categoryOptions.find((option) => option.name === name);
                  if (match) setCategoryId(match.id);
                  setExpanded(null);
                }}
              />
            </View>
          </SelectRow>
        ) : null}

        <SelectRow
          label={
            type === 'transfer'
              ? t('expenses.sheet.manualEntry.from')
              : t('expenses.sheet.manualEntry.account')
          }
          value={sourceLabel}
          expanded={expanded === 'source'}
          onToggle={() => setExpanded((e) => (e === 'source' ? null : 'source'))}
        >
          <View style={{ paddingHorizontal: 12, paddingBottom: 10 }}>
            <SelectListInline
              options={sourceOptions}
              selected={sourceKey}
              onSelect={(value) => {
                setSourceKey(value);
                if (value === destinationKey) setDestinationKey(null);
                setExpanded(null);
              }}
            />
          </View>
        </SelectRow>

        {needsDestination ? (
          <SelectRow
            label={t('expenses.sheet.manualEntry.to')}
            value={destinationLabel}
            expanded={expanded === 'destination'}
            onToggle={() =>
              setExpanded((e) => (e === 'destination' ? null : 'destination'))
            }
          >
            <View style={{ paddingHorizontal: 12, paddingBottom: 10 }}>
              <SelectListInline
                options={destinationOptions}
                selected={destinationKey}
                onSelect={(value) => {
                  setDestinationKey(value);
                  setExpanded(null);
                }}
              />
            </View>
          </SelectRow>
        ) : null}

        <SelectRow
          label={t('expenses.sheet.manualEntry.date')}
          value={dateLabel}
          expanded={expanded === 'date'}
          onToggle={() => setExpanded((e) => (e === 'date' ? null : 'date'))}
          last
        >
          <View style={{ paddingHorizontal: 12, paddingBottom: 10 }}>
            <SelectListInline
              options={[
                ...dateOptions,
                { value: 'pick', label: t('expenses.sheet.manualEntry.pickDate') },
              ]}
              selected={occurredOn}
              onSelect={(value) => {
                setExpanded(null);
                if (value === 'pick') {
                  setDatePickerOpen(true);
                  return;
                }
                setOccurredOn(value);
              }}
            />
          </View>
        </SelectRow>
      </View>

      {errorMessage ? (
        <Text
          variant="caption"
          style={{ color: theme.colors.accentCoral, fontSize: 12, textAlign: 'center' }}
        >
          {errorMessage}
        </Text>
      ) : null}

      <Button
        label={t(`expenses.sheet.manualEntry.save.${type}`)}
        full
        disabled={!valid}
        loading={saving}
        onPress={handleSave}
      />

      <DatePickerSheet
        visible={datePickerOpen}
        value={occurredOn}
        today={today}
        title={t('movements.detail.datePickerTitle')}
        language={language}
        onClose={() => setDatePickerOpen(false)}
        onSelect={setOccurredOn}
      />
    </Animated.View>
  );
}
