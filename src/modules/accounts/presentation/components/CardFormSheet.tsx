import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, TextInput } from 'react-native';

import type { CurrencyCode } from '@/shared/domain';
import {
  AmountSheet,
  SheetDangerAction,
  SheetFieldRow,
  SheetHeaderButton,
  Text,
} from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { withAlpha } from '@/shared/presentation/theme/tokens';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

import type { CreditCard } from '../../domain';

export type CardFormInput = {
  name: string;
  /** Minor units of the card's currency. */
  debt: number;
  limit: number;
  cutoffDay: number;
  dueDay: number | null;
};

type Props = {
  visible: boolean;
  card: CreditCard | null;
  currency: CurrencyCode;
  submitting?: boolean;
  deleting?: boolean;
  onClose: () => void;
  onSave: (input: CardFormInput) => void;
  onDelete: () => void;
};

/** Which number the pad is typing into. The sheet has four and there is one pad. */
type Slot = 'debt' | 'limit' | 'cutoff' | 'due';

const DAY_DIGITS = 2;

/**
 * A credit card — `CREAR` again, with four numbers instead of one.
 *
 * The design draws one big amount and a couple of rows, which is exactly right
 * for a cap and looks impossible for a card. The resolution is that **the hero
 * is whichever number you are editing**: tapping a row promotes it, the label
 * above changes to name it, and the pad types into it. The rows carry the rest.
 *
 * That is a better fit than four boxes, and not only visually. A card is read as
 * a relationship — this much owed against that much allowed, closing on that day
 * — so the sheet always shows one number large with the others beside it, which
 * is the shape of the question rather than the shape of a database row.
 *
 * The day fields ride the same pad with no currency symbol and a two-digit
 * ceiling. The pad is this app's one way of typing numbers, and a `$` in front
 * of "15" would be a lie.
 */
export function CardFormSheet({
  visible,
  card,
  currency,
  submitting = false,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const editing = card != null;

  const [name, setName] = useState('');
  const [typingName, setTypingName] = useState(false);
  const [debtDigits, setDebtDigits] = useState('');
  const [limitDigits, setLimitDigits] = useState('');
  const [cutoff, setCutoff] = useState('');
  const [due, setDue] = useState('');
  const [slot, setSlot] = useState<Slot>('debt');

  useEffect(() => {
    if (!visible) return;
    setName(card?.name ?? '');
    setDebtDigits(card ? String(card.debt) : '');
    setLimitDigits(card ? String(card.limit) : '');
    setCutoff(card ? String(card.cutoffDay) : '');
    setDue(card?.dueDay ? String(card.dueDay) : '');
    setSlot('debt');
    setTypingName(false);
  }, [visible, card]);

  const debt = Number(debtDigits || '0');
  const limit = Number(limitDigits || '0');
  const cutoffDay = Number(cutoff || '0');
  const dueDay = due ? Number(due) : null;
  const debtExceedsLimit = limit > 0 && debt > limit;
  const dayInMonth = (day: number) => day >= 1 && day <= 31;
  // A stored payment day can be changed but not blanked (the API only sets it),
  // so the form requires it instead of accepting an edit that does nothing.
  const dueRequired = card?.dueDay != null;
  const valid =
    name.trim().length >= 2 &&
    limit > 0 &&
    !debtExceedsLimit &&
    dayInMonth(cutoffDay) &&
    (dueDay === null ? !dueRequired : dayInMonth(dueDay));

  const money = (digits: string) =>
    digits ? formatMoney(Number(digits), currency) : '—';
  const dayLabel = (value: string) => value || '—';

  const HERO: Record<Slot, { label: string; digits: string; set: (v: string) => void }> =
    {
      debt: { label: t('accounts.form.debt'), digits: debtDigits, set: setDebtDigits },
      limit: {
        label: t('accounts.form.limit'),
        digits: limitDigits,
        set: setLimitDigits,
      },
      cutoff: { label: t('accounts.form.cutoffDay'), digits: cutoff, set: setCutoff },
      due: { label: t('accounts.form.dueDay'), digits: due, set: setDue },
    };
  const hero = HERO[slot];
  const isDay = slot === 'cutoff' || slot === 'due';

  return (
    <AmountSheet
      visible={visible}
      onClose={onClose}
      digits={hero.digits}
      onDigits={hero.set}
      currency={currency}
      symbol={isDay ? '' : undefined}
      maxDigits={isDay ? DAY_DIGITS : undefined}
      label={hero.label}
      help={
        debtExceedsLimit
          ? t('accounts.form.debtExceedsLimit')
          : t('accounts.form.cardHelp')
      }
      amountColor={debtExceedsLimit ? theme.colors.accentCoral : undefined}
      primaryLabel={t('accounts.form.save')}
      primaryDisabled={!valid || submitting}
      onPrimary={() => onSave({ name: name.trim(), debt, limit, cutoffDay, dueDay })}
      header={
        <>
          <SheetHeaderButton icon="x" label={t('common.close')} onPress={onClose} />
          <Text numberOfLines={1} style={{ flex: 1, fontSize: 16, fontWeight: '500' }}>
            {editing ? t('accounts.form.editCard') : t('accounts.form.newCard')}
          </Text>
          {editing ? (
            <SheetDangerAction
              label={t('accounts.form.delete')}
              confirmLabel={t('accounts.form.deleteConfirm')}
              onConfirm={onDelete}
            />
          ) : null}
        </>
      }
    >
      <SheetFieldRow label={t('accounts.form.name')} onPress={() => setTypingName(true)}>
        {typingName ? (
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder={t('accounts.form.cardNamePlaceholder')}
            placeholderTextColor={theme.colors.textTertiary}
            autoFocus
            maxLength={40}
            onBlur={() => setTypingName(false)}
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
            color={name ? theme.colors.textPrimary : theme.colors.textTertiary}
            style={{ flex: 1, textAlign: 'right', fontSize: 13.5 }}
          >
            {name || t('accounts.form.cardNamePlaceholder')}
          </Text>
        )}
      </SheetFieldRow>

      <SlotRow
        label={t('accounts.form.debt')}
        value={money(debtDigits)}
        active={slot === 'debt'}
        onPress={() => setSlot('debt')}
      />
      <SlotRow
        label={t('accounts.form.limit')}
        value={money(limitDigits)}
        active={slot === 'limit'}
        onPress={() => setSlot('limit')}
      />
      <SlotRow
        label={t('accounts.form.cutoffDay')}
        value={dayLabel(cutoff)}
        active={slot === 'cutoff'}
        onPress={() => setSlot('cutoff')}
      />
      <SlotRow
        label={t('accounts.form.dueDay')}
        value={dayLabel(due)}
        active={slot === 'due'}
        onPress={() => setSlot('due')}
      />
    </AmountSheet>
  );
}

/** A number the pad can be pointed at. The active one is marked, because the
 *  hero above is otherwise the only clue about where the digits are landing. */
function SlotRow({
  label,
  value,
  active,
  onPress,
}: {
  label: string;
  value: string;
  active: boolean;
  onPress: () => void;
}) {
  const { theme } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        minHeight: 44,
        paddingHorizontal: 16,
        paddingVertical: 13,
        borderRadius: 16,
        backgroundColor: active
          ? withAlpha(theme.palette.acc, 0.15)
          : theme.colors.bgSurface,
        borderWidth: 1,
        borderColor: active
          ? withAlpha(theme.palette.acc, 0.3)
          : theme.colors.borderSubtle,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <Text
        color={active ? theme.palette.acc2 : theme.colors.textTertiary}
        style={{ flex: 1, fontSize: 13.5 }}
      >
        {label}
      </Text>
      <Text
        tabular
        color={active ? theme.palette.acc2 : theme.colors.textPrimary}
        style={{ fontSize: 13.5 }}
      >
        {value}
      </Text>
    </Pressable>
  );
}
