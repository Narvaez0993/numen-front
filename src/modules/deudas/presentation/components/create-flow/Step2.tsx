import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, TextInput, View } from 'react-native';

import {
  DatePickerSheet,
  Icon,
  Pill,
  SectionLabel,
  Text,
} from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { shortDate } from '@/shared/presentation/utils/dates';

import type { DebtDirection } from '../../../domain';
import { useDebtsContext } from '../../context/DebtsContext';
import { AccountPicker } from '../AccountPicker';

type Props = {
  direction: DebtDirection;
  isShared: boolean;
  amount: number;
  onAmountChange: (v: number) => void;
  accountId: string | null;
  onAccountChange: (v: string | null) => void;
  dueOn: string | null;
  onDueOnChange: (v: string | null) => void;
  note: string;
  onNoteChange: (v: string) => void;
};

const formatThousands = (n: number) =>
  n > 0 ? n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '';

/**
 * How much, which account the cash crossed, when it is due, and a note.
 *
 * The account is back — but not as the prototype's hardcoded fake. It is here because
 * lending really moves money: it leaves your account as a transfer into the debt, so
 * the balance drops while the month's expenses do not. Saying "no movió plata" is a
 * real answer, and the honest one for a bill you already registered as an expense.
 *
 * A shared event never asks: the dinner left as one expense before anyone split it,
 * so there is no second movement to record.
 */
export function Step2({
  direction,
  isShared,
  amount,
  onAmountChange,
  accountId,
  onAccountChange,
  dueOn,
  onDueOnChange,
  note,
  onNoteChange,
}: Props) {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const { today } = useDebtsContext();
  const [dueSheet, setDueSheet] = useState(false);

  const display = formatThousands(amount);

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

      {isShared ? null : (
        <View style={{ gap: 8 }}>
          <SectionLabel>
            {t(
              direction === 'incoming'
                ? 'deudas.create.step2.accountOutLabel'
                : 'deudas.create.step2.accountInLabel',
            )}
          </SectionLabel>
          <AccountPicker
            selected={accountId}
            onSelect={onAccountChange}
            allowNone
            noneLabel={t('deudas.create.step2.accountNone')}
          />
          <Text
            variant="caption"
            muted
            style={{ fontSize: 11.5, lineHeight: 16, paddingHorizontal: 4 }}
          >
            {t(
              direction === 'incoming'
                ? 'deudas.create.step2.accountHintOut'
                : 'deudas.create.step2.accountHintIn',
            )}
          </Text>
        </View>
      )}

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
        <Pressable
          onPress={() => setDueSheet(true)}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            paddingVertical: 12,
            paddingHorizontal: 14,
            backgroundColor: theme.colors.bgSurface,
            borderWidth: 1,
            borderColor: theme.colors.borderSubtle,
            borderRadius: 12,
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <Icon
            name="calendar-event"
            size={15}
            stroke={1.9}
            color={theme.colors.textSecondary}
          />
          <Text
            style={{ flex: 1, fontSize: 13.5 }}
            color={dueOn ? theme.colors.textPrimary : theme.colors.textTertiary}
          >
            {dueOn ? shortDate(dueOn, i18n.language) : t('deudas.create.step2.dueNone')}
          </Text>
          {dueOn ? (
            <Pressable
              hitSlop={8}
              onPress={() => onDueOnChange(null)}
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <Icon name="x" size={13} stroke={2.2} color={theme.colors.textTertiary} />
            </Pressable>
          ) : (
            <Icon name="chevron-down" size={14} color={theme.colors.textTertiary} />
          )}
        </Pressable>
      </View>

      <View style={{ gap: 8 }}>
        <SectionLabel>
          {t(
            isShared
              ? 'deudas.create.step2.noteSharedLabel'
              : 'deudas.create.step2.noteLabel',
          )}
        </SectionLabel>
        <TextInput
          value={note}
          onChangeText={onNoteChange}
          placeholder={t(
            isShared
              ? 'deudas.create.step2.noteSharedPlaceholder'
              : 'deudas.create.step2.notePlaceholder',
          )}
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

      <DatePickerSheet
        visible={dueSheet}
        value={dueOn ?? today}
        today={today}
        // A due date is usually ahead — that is the point of one.
        allowFuture
        title={t('deudas.create.step2.dueSheetTitle')}
        language={i18n.language}
        onClose={() => setDueSheet(false)}
        onSelect={(iso) => {
          onDueOnChange(iso);
          setDueSheet(false);
        }}
      />
    </View>
  );
}
