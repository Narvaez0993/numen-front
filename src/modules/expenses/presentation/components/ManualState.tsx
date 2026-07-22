import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Pressable, TextInput, View } from 'react-native';

import { Button, Icon, Text } from '@/shared/presentation/components';
import { accentColorKey, useTheme } from '@/shared/presentation/theme';

import type { DetectedExpense } from '../../domain/types/Expense';
import {
  ACCOUNTS,
  DATE_OPTIONS,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  categoryColor,
} from '../constants/manualOptions';

import { CategoryPickerInline, OptionListInline } from './InlinePickers';

export type ManualEntryType = 'expense' | 'income' | 'transfer';

type Props = {
  onSave: (item: DetectedExpense, type: ManualEntryType) => void;
  saving?: boolean;
};

type ExpandedField = 'category' | 'account' | 'accountTo' | 'date' | null;

const TYPES: ManualEntryType[] = ['expense', 'income', 'transfer'];

function formatDigits(digits: string): string {
  if (!digits) return '';
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function ManualState({ onSave, saving = false }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const [type, setType] = useState<ManualEntryType>('expense');
  const [digits, setDigits] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Mercado');
  const [account, setAccount] = useState(ACCOUNTS[0] ?? 'Efectivo');
  const [accountTo, setAccountTo] = useState('BBVA Crédito');
  const [date, setDate] = useState(DATE_OPTIONS[0] ?? 'Hoy');
  const [expanded, setExpanded] = useState<ExpandedField>(null);

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

  const amount = Number(digits || '0');
  const valid = amount > 0 && (type === 'transfer' || description.trim().length >= 2);
  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const changeType = (next: ManualEntryType) => {
    setType(next);
    setExpanded(null);
    if (next === 'income' && !INCOME_CATEGORIES.some((c) => c.name === category)) {
      setCategory(INCOME_CATEGORIES[0]?.name ?? 'Salario');
    }
    if (next === 'expense' && !EXPENSE_CATEGORIES.some((c) => c.name === category)) {
      setCategory(EXPENSE_CATEGORIES[0]?.name ?? 'Mercado');
    }
  };

  const handleSave = () => {
    if (!valid) return;
    const fallbackDescription =
      type === 'transfer'
        ? `${account} → ${accountTo}`
        : t(`expenses.sheet.manualEntry.type.${type}`);
    onSave(
      {
        id: `m-${Date.now()}`,
        description: description.trim() || fallbackDescription,
        categoryName: type === 'transfer' ? 'Transferencia' : category,
        categoryColor: type === 'transfer' ? 'mint' : categoryColor(category),
        amount,
        sourceName: account,
      },
      type,
    );
  };

  const amountColor =
    type === 'income'
      ? theme.colors.accentMint
      : type === 'transfer'
        ? theme.colors.textSecondary
        : theme.colors.textPrimary;

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
          backgroundColor: theme.colors.bgFloat,
          borderColor: theme.colors.borderSubtle,
          borderWidth: 1,
          borderRadius: 12,
          padding: 3,
          gap: 3,
        }}
      >
        {TYPES.map((option) => {
          const active = option === type;
          return (
            <Pressable
              key={option}
              accessibilityRole="button"
              onPress={() => changeType(option)}
              style={({ pressed }) => ({
                flex: 1,
                alignItems: 'center',
                paddingVertical: 8,
                borderRadius: 9,
                backgroundColor: active ? theme.colors.bgElevated : 'transparent',
                borderWidth: active ? 1 : 0,
                borderColor: theme.colors.borderDefault,
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Text
                variant="label"
                color={active ? theme.colors.textPrimary : theme.colors.textTertiary}
                style={{ fontSize: 12 }}
              >
                {t(`expenses.sheet.manualEntry.type.${option}`)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={{ alignItems: 'center', paddingVertical: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Text variant="display" tabular color={amountColor} style={{ fontSize: 30 }}>
            {type === 'income' ? '+' : ''}$
          </Text>
          <TextInput
            ref={amountRef}
            value={formatDigits(digits)}
            onChangeText={(v) => setDigits(v.replace(/\D/g, ''))}
            keyboardType="number-pad"
            placeholder="0"
            placeholderTextColor={theme.colors.textTertiary}
            style={{
              fontSize: 30,
              color: amountColor,
              fontFamily: 'Geist_500Medium',
              fontVariant: ['tabular-nums'],
              minWidth: 60,
              padding: 0,
            }}
          />
        </View>
      </View>

      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder={t('expenses.sheet.manualEntry.descriptionPlaceholder')}
        placeholderTextColor={theme.colors.textTertiary}
        style={{
          backgroundColor: theme.colors.bgFloat,
          borderWidth: 1,
          borderColor: theme.colors.borderSubtle,
          borderRadius: 12,
          paddingHorizontal: 14,
          paddingVertical: 12,
          fontSize: 14,
          color: theme.colors.textPrimary,
          fontFamily: 'Geist_400Regular',
        }}
      />

      <View
        style={{
          backgroundColor: theme.colors.bgFloat,
          borderColor: theme.colors.borderSubtle,
          borderWidth: 1,
          borderRadius: 12,
        }}
      >
        {type !== 'transfer' ? (
          <SelectRow
            label={t('expenses.sheet.manualEntry.category')}
            value={category}
            valueColor={theme.colors[accentColorKey(categoryColor(category), 'fg')]}
            expanded={expanded === 'category'}
            onToggle={() => setExpanded((e) => (e === 'category' ? null : 'category'))}
          >
            <View style={{ paddingHorizontal: 12, paddingBottom: 12 }}>
              <CategoryPickerInline
                categories={categories}
                selected={category}
                onSelect={(name) => {
                  setCategory(name);
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
          value={account}
          expanded={expanded === 'account'}
          onToggle={() => setExpanded((e) => (e === 'account' ? null : 'account'))}
        >
          <View style={{ paddingHorizontal: 12, paddingBottom: 10 }}>
            <OptionListInline
              options={ACCOUNTS}
              selected={account}
              onSelect={(v) => {
                setAccount(v);
                setExpanded(null);
              }}
            />
          </View>
        </SelectRow>

        {type === 'transfer' ? (
          <SelectRow
            label={t('expenses.sheet.manualEntry.to')}
            value={accountTo}
            expanded={expanded === 'accountTo'}
            onToggle={() => setExpanded((e) => (e === 'accountTo' ? null : 'accountTo'))}
          >
            <View style={{ paddingHorizontal: 12, paddingBottom: 10 }}>
              <OptionListInline
                options={ACCOUNTS.filter((a) => a !== account)}
                selected={accountTo}
                onSelect={(v) => {
                  setAccountTo(v);
                  setExpanded(null);
                }}
              />
            </View>
          </SelectRow>
        ) : null}

        <SelectRow
          label={t('expenses.sheet.manualEntry.date')}
          value={date}
          expanded={expanded === 'date'}
          onToggle={() => setExpanded((e) => (e === 'date' ? null : 'date'))}
          last
        >
          <View style={{ paddingHorizontal: 12, paddingBottom: 10 }}>
            <OptionListInline
              options={DATE_OPTIONS}
              selected={date}
              onSelect={(v) => {
                setDate(v);
                setExpanded(null);
              }}
            />
          </View>
        </SelectRow>
      </View>

      <Button
        label={t(`expenses.sheet.manualEntry.save.${type}`)}
        full
        disabled={!valid}
        loading={saving}
        onPress={handleSave}
      />
    </Animated.View>
  );
}

function SelectRow({
  label,
  value,
  valueColor,
  expanded,
  onToggle,
  last = false,
  children,
}: {
  label: string;
  value: string;
  valueColor?: string;
  expanded: boolean;
  onToggle: () => void;
  last?: boolean;
  children: React.ReactNode;
}) {
  const { theme } = useTheme();
  return (
    <View
      style={{
        borderBottomWidth: last && !expanded ? 0 : last ? 0 : 1,
        borderBottomColor: theme.colors.borderSubtle,
      }}
    >
      <Pressable
        accessibilityRole="button"
        onPress={onToggle}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 12,
          paddingVertical: 13,
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Text variant="caption" muted>
          {label}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text
            variant="label"
            color={valueColor ?? theme.colors.textPrimary}
            style={{ fontSize: 12.5 }}
          >
            {value}
          </Text>
          <Icon
            name={expanded ? 'chevron-down' : 'chevron-right'}
            size={13}
            color={theme.colors.textTertiary}
          />
        </View>
      </Pressable>
      {expanded ? children : null}
    </View>
  );
}
