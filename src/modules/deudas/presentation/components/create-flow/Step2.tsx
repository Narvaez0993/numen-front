import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TextInput, View } from 'react-native';

import { Pill, SectionLabel, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

import type { DebtDirection } from '../../../domain/types/Deuda';
import {
  ACCOUNT_OPTIONS,
  ALL_CATEGORIES,
  DATE_OPTIONS,
  DUE_OPTIONS,
  type SelectOption,
} from '../../constants/options';
import { SelectListSheet } from '../sheets/SelectListSheet';

import { CategoryPicker } from './CategoryPicker';
import { ExpenseToggle } from './ExpenseToggle';
import { FakeSelectRow } from './FakeSelectRow';

type Props = {
  direction: DebtDirection;
  isShared: boolean;
  amount: number;
  onAmountChange: (v: number) => void;
  isExpense: boolean;
  onExpenseChange: (v: boolean) => void;
  category: string | null;
  onCategoryChange: (v: string | null) => void;
  account: string;
  onAccountChange: (v: string) => void;
  date: string;
  onDateChange: (v: string) => void;
  dueDate: string | null;
  onDueDateChange: (v: string | null) => void;
  note: string;
  onNoteChange: (v: string) => void;
};

const formatThousands = (n: number) =>
  n > 0 ? n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '';

export function Step2({
  direction,
  isShared,
  amount,
  onAmountChange,
  isExpense,
  onExpenseChange,
  category,
  onCategoryChange,
  account,
  onAccountChange,
  date,
  onDateChange,
  dueDate,
  onDueDateChange,
  note,
  onNoteChange,
}: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [catSheet, setCatSheet] = useState(false);
  const [acctSheet, setAcctSheet] = useState(false);
  const [dateSheet, setDateSheet] = useState(false);
  const [dueSheet, setDueSheet] = useState(false);

  const display = formatThousands(amount);
  const showCategory = isExpense && direction === 'incoming';

  const accountLabel =
    direction === 'incoming' && isExpense
      ? t('deudas.create.step2.accountIncomingPaid')
      : direction === 'incoming'
        ? t('deudas.create.step2.accountIncoming')
        : t('deudas.create.step2.accountOutgoing');

  return (
    <View style={{ gap: 18 }}>
      <View>
        <Text
          style={{
            fontSize: 24,
            fontWeight: '500',
            letterSpacing: -0.6,
            marginBottom: 8,
          }}
        >
          {t(
            isShared
              ? 'deudas.create.step2.titleShared'
              : 'deudas.create.step2.titleIndividual',
          )}
        </Text>
        <Text
          color={theme.colors.textSecondary}
          style={{ fontSize: 13, lineHeight: 18.85 }}
        >
          {t(
            isShared
              ? 'deudas.create.step2.subShared'
              : 'deudas.create.step2.subIndividual',
          )}
        </Text>
      </View>

      <View style={{ gap: 8 }}>
        <SectionLabel>
          {t(
            isShared
              ? 'deudas.create.step2.amountSharedLabel'
              : 'deudas.create.step2.amountLabel',
          )}
        </SectionLabel>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'baseline',
            gap: 4,
            paddingVertical: 10,
            borderBottomWidth: 2,
            borderBottomColor: theme.colors.borderDefault,
          }}
        >
          <Text color={theme.colors.textSecondary} style={{ fontSize: 22 }}>
            $
          </Text>
          <TextInput
            autoFocus
            keyboardType="numeric"
            inputMode="numeric"
            value={display}
            onChangeText={(v) => {
              const raw = v.replace(/\D/g, '').slice(0, 10);
              onAmountChange(raw === '' ? 0 : parseInt(raw, 10));
            }}
            placeholder="0"
            placeholderTextColor={theme.colors.textTertiary}
            style={{
              flex: 1,
              color: theme.colors.textPrimary,
              fontSize: 42,
              fontFamily: 'Geist_500Medium',
              letterSpacing: -1.05,
              padding: 0,
              fontVariant: ['tabular-nums'],
            }}
          />
        </View>
      </View>

      {direction === 'incoming' ? (
        <ExpenseToggle value={isExpense} onChange={onExpenseChange} />
      ) : null}

      {showCategory ? (
        <View style={{ gap: 8 }}>
          <SectionLabel>{t('deudas.create.step2.categoryLabel')}</SectionLabel>
          <CategoryPicker
            value={category}
            onChange={onCategoryChange}
            onSeeAll={() => setCatSheet(true)}
          />
        </View>
      ) : null}

      <View style={{ gap: 8 }}>
        <SectionLabel>{accountLabel}</SectionLabel>
        <FakeSelectRow
          icon="building-bank"
          iconColor="mint"
          value={account}
          onPress={() => setAcctSheet(true)}
        />
      </View>

      <View style={{ gap: 8 }}>
        <SectionLabel>{t('deudas.create.step2.dateLabel')}</SectionLabel>
        <FakeSelectRow
          icon="calendar-event"
          iconColor="neutral"
          value={date}
          onPress={() => setDateSheet(true)}
        />
      </View>

      <View style={{ gap: 8 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            paddingHorizontal: 4,
          }}
        >
          <Text
            variant="micro"
            uppercase
            color={theme.colors.textTertiary}
            style={{ fontFamily: 'Geist_500Medium' }}
          >
            {t('deudas.create.step2.dueLabel')}
          </Text>
          <Pill variant="neutral" uppercase style={{ paddingHorizontal: 7 }}>
            {t('deudas.create.step2.optional')}
          </Pill>
        </View>
        <FakeSelectRow
          icon="calendar-event"
          iconColor="neutral"
          value={dueDate ?? t('deudas.create.step2.dueNone')}
          placeholder={!dueDate}
          onPress={() => setDueSheet(true)}
          onClear={dueDate ? () => onDueDateChange(null) : undefined}
        />
      </View>

      <View style={{ gap: 8 }}>
        <SectionLabel>{t('deudas.create.step2.noteLabel')}</SectionLabel>
        <TextInput
          value={note}
          onChangeText={onNoteChange}
          placeholder={t('deudas.create.step2.notePlaceholder')}
          placeholderTextColor={theme.colors.textTertiary}
          multiline
          numberOfLines={2}
          style={{
            backgroundColor: theme.colors.bgSurface,
            borderWidth: 1,
            borderColor: theme.colors.borderSubtle,
            borderRadius: 12,
            paddingVertical: 11,
            paddingHorizontal: 14,
            fontSize: 13,
            color: theme.colors.textPrimary,
            fontFamily: 'Geist_400Regular',
            minHeight: 64,
            textAlignVertical: 'top',
          }}
        />
      </View>

      <SelectListSheet<string>
        visible={catSheet}
        title={t('deudas.create.step2.categorySheetTitle')}
        subtitle={t('deudas.create.step2.categorySheetSubtitle')}
        options={ALL_CATEGORIES}
        value={category ?? ''}
        searchable
        searchPlaceholder={t('categories.searchPlaceholder')}
        onSelect={(o: SelectOption<string>) => {
          onCategoryChange(o.value);
          setCatSheet(false);
        }}
        onClose={() => setCatSheet(false)}
      />
      <SelectListSheet<string>
        visible={acctSheet}
        title={t('deudas.create.step2.accountSheetTitle')}
        options={ACCOUNT_OPTIONS}
        value={account}
        onSelect={(o: SelectOption<string>) => {
          onAccountChange(o.value);
          setAcctSheet(false);
        }}
        onClose={() => setAcctSheet(false)}
      />
      <SelectListSheet<string>
        visible={dateSheet}
        title={t('deudas.create.step2.dateSheetTitle')}
        subtitle={t('deudas.create.step2.dateSheetSubtitle')}
        options={DATE_OPTIONS}
        value={date}
        onSelect={(o: SelectOption<string>) => {
          onDateChange(o.value);
          setDateSheet(false);
        }}
        onClose={() => setDateSheet(false)}
      />
      <SelectListSheet<string | null>
        visible={dueSheet}
        title={t('deudas.create.step2.dueSheetTitle')}
        subtitle={t('deudas.create.step2.dueSheetSubtitle')}
        options={DUE_OPTIONS}
        value={dueDate}
        onSelect={(o: SelectOption<string | null>) => {
          onDueDateChange(o.value);
          setDueSheet(false);
        }}
        onClose={() => setDueSheet(false)}
      />
    </View>
  );
}
