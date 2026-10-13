import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, TextInput, View } from 'react-native';

import type { CurrencyCode } from '@/shared/domain';
import {
  AmountSheet,
  SheetDangerAction,
  SheetHeaderButton,
  Text,
} from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

import type { Account, AccountKind } from '../../domain';

export type AccountFormInput = {
  kind: AccountKind;
  name: string;
  sub: string;
  /** Minor units of the account's currency. */
  balance: number;
};

type Props = {
  visible: boolean;
  account: Account | null;
  currency: CurrencyCode;
  submitting?: boolean;
  deleting?: boolean;
  onClose: () => void;
  onSave: (input: AccountFormInput) => void;
  onDelete: () => void;
  /** What a new account opens with — the onboarding's main account starts as
   *  the kind and name of the option just picked. Ignored when editing. */
  initial?: Partial<AccountFormInput>;
  /** The button's label, when the sheet is one step of something bigger. */
  saveLabel?: string;
};

const KINDS: AccountKind[] = ['debit', 'cash'];

/**
 * An account — `CREAR`, the sheet the design draws once for subscription,
 * account, category, goal and cap.
 *
 * It used to be a stacked form: three labelled inputs and a green button, which
 * is what a settings page looks like. The redesign has one answer for entering
 * money and this is it — **the balance at the top at 46px**, the details as
 * ordinary rows under it, the pad pinned to the bottom.
 *
 * That ordering is a claim about which field matters. The name is a label you
 * set once and read for years; the balance is the number that has to be true
 * today, and it is the only reason to open this sheet twice.
 *
 * Débito vs efectivo lives in the header as a switch, exactly where the manual
 * capture puts gasto/ingreso/traslado — and only while creating. What an account
 * IS does not change, and offering to change it would be offering to turn a bank
 * account into cash.
 */
export function AccountFormSheet({
  visible,
  account,
  currency,
  submitting = false,
  onClose,
  onSave,
  onDelete,
  initial,
  saveLabel,
}: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const editing = account != null;

  const [kind, setKind] = useState<AccountKind>('debit');
  const [name, setName] = useState('');
  const [sub, setSub] = useState('');
  const [digits, setDigits] = useState('');

  // Read when the sheet opens, not on every render: a parent that re-renders
  // while it is open must not wipe what is being typed.
  const initialRef = useRef(initial);
  initialRef.current = initial;

  useEffect(() => {
    if (!visible) return;
    const start = initialRef.current;
    setKind(account?.kind ?? start?.kind ?? 'debit');
    setName(account?.name ?? start?.name ?? '');
    setSub(account?.sub ?? start?.sub ?? '');
    setDigits(
      account
        ? String(Math.max(0, account.balance))
        : start?.balance
          ? String(start.balance)
          : '',
    );
  }, [visible, account]);

  const valid = name.trim().length >= 2;

  return (
    <AmountSheet
      visible={visible}
      onClose={onClose}
      digits={digits}
      onDigits={setDigits}
      currency={currency}
      keyboard="system"
      label={t('accounts.form.balance')}
      help={t('accounts.form.balanceHelp')}
      primaryLabel={saveLabel ?? t('accounts.form.save')}
      primaryDisabled={!valid || submitting}
      onPrimary={() =>
        onSave({
          kind,
          name: name.trim(),
          sub: sub.trim(),
          balance: Number(digits || '0'),
        })
      }
      header={
        <>
          <SheetHeaderButton icon="x" label={t('common.close')} onPress={onClose} />
          {editing ? (
            <>
              <Text
                numberOfLines={1}
                style={{ flex: 1, fontSize: 16, fontWeight: '500' }}
              >
                {t('accounts.form.editAccount')}
              </Text>
              <SheetDangerAction
                label={t('accounts.form.delete')}
                confirmLabel={t('accounts.form.deleteConfirm')}
                onConfirm={onDelete}
              />
            </>
          ) : (
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
              {KINDS.map((option) => {
                const active = option === kind;
                return (
                  <Pressable
                    key={option}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    onPress={() => setKind(option)}
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
                      {t(`accounts.form.kind.${option}`)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </>
      }
    >
      <TextRow
        label={t('accounts.form.name')}
        value={name}
        placeholder={t('accounts.form.namePlaceholder')}
        onChangeText={setName}
      />
      <TextRow
        label={t('accounts.form.sub')}
        value={sub}
        placeholder={t('accounts.form.subPlaceholder')}
        onChangeText={setSub}
      />
    </AmountSheet>
  );
}

/** A row that types. Always a live field — with the system keyboard there is no
 *  reason to make someone tap twice to start writing a name. */
function TextRow({
  label,
  value,
  placeholder,
  onChangeText,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChangeText: (next: string) => void;
}) {
  const { theme } = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        minHeight: 44,
        paddingHorizontal: 16,
        paddingVertical: 13,
        borderRadius: 16,
        backgroundColor: theme.colors.bgSurface,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
      }}
    >
      <Text color={theme.colors.textTertiary} style={{ fontSize: 13.5 }}>
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
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
    </View>
  );
}
