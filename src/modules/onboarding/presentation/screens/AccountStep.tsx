import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import type { Account } from '@/modules/accounts/domain';
import {
  AccountFormSheet,
  type AccountFormInput,
} from '@/modules/accounts/presentation/components/AccountFormSheet';
import { useCreateAccount } from '@/modules/accounts/presentation/hooks/useAccountMutations';
import { useAccounts } from '@/modules/accounts/presentation/hooks/useAccounts';
import { useUpdatePreferences } from '@/modules/auth/presentation';
import {
  CurrencyPickerSheet,
  Icon,
  InkButton,
  Text,
} from '@/shared/presentation/components';
import { useCurrencyStore } from '@/shared/presentation/currency/useCurrencyStore';
import { useTheme } from '@/shared/presentation/theme';

import { BANKS, type BankId } from '../../domain';
import { OnbFrame } from '../components/OnbFrame';
import { OnbHeadline } from '../components/OnbHeadline';
import { OnbOption } from '../components/OnbOption';
import { OnbTopBar } from '../components/OnbTopBar';

type Props = {
  onBack: () => void;
  /** The account exists — on the server, not just on this screen. */
  onCreated: (account: Account, bankId: BankId | null) => void;
  /** «Lo hago después»: no account, and so no first expense to save. */
  onSkip: () => void;
};

/**
 * «¿Dónde tienes la mayor parte de tu plata?» — step 3, the one the design
 * does not draw: its first expense lands on an account it assumes («Nequi»),
 * and Deshka asks instead of assuming (HU-03).
 *
 * Same shape as the two before it, and the balance goes in the sheet that
 * creates every account in the app (`CREAR`), opened with the kind and name of
 * the option picked. The account is created HERE, before the first expense,
 * because that expense has to land somewhere real.
 *
 * Coming back to a setup left halfway (HU-03), an account may already exist:
 * then this step is done, and it moves on instead of making a second one.
 */
export function AccountStep({ onBack, onCreated, onSkip }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const accounts = useAccounts();
  const createAccount = useCreateAccount();
  const updatePreferences = useUpdatePreferences();
  const currency = useCurrencyStore((s) => s.currency);

  const [selected, setSelected] = useState<BankId | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);

  const existing = accounts.data?.accounts[0] ?? null;
  const resumed = useRef(false);
  useEffect(() => {
    if (existing && !resumed.current) {
      resumed.current = true;
      onCreated(existing, null);
    }
  }, [existing, onCreated]);

  const initial = useMemo<Partial<AccountFormInput> | undefined>(
    () =>
      selected === null
        ? undefined
        : selected === 'efectivo'
          ? { kind: 'cash', name: t('onboarding.setup.account.cashName') }
          : // A bank or a wallet has a name only the user knows: an empty field
            // asks for «Bancolombia», where a filled-in «Banco» had to be
            // erased first.
            { kind: 'debit', name: '' },
    [selected, t],
  );

  const save = (input: AccountFormInput) => {
    createAccount.mutate(
      {
        kind: input.kind,
        name: input.name,
        sub: input.sub,
        icon: input.kind === 'cash' ? 'cash' : 'building-bank',
        color: 'purple',
        balance: input.balance,
      },
      {
        onSuccess: (account) => {
          setSheetOpen(false);
          onCreated(account, selected);
        },
      },
    );
  };

  return (
    <OnbFrame scroll>
      <OnbTopBar onBack={onBack} label={t('onboarding.setup.step', { step: 3 })} />
      <OnbHeadline
        i18nKey="onboarding.setup.account.title"
        body={t('onboarding.setup.account.body')}
        bodyGap={12}
      />

      <View style={{ paddingHorizontal: 22, paddingTop: 24, gap: 9 }}>
        {BANKS.map((bank) => (
          <OnbOption
            key={bank.id}
            icon={bank.kind === 'icon' ? bank.icon : undefined}
            title={t(`onboarding.setup.account.options.${bank.id}.title`)}
            subtitle={t(`onboarding.setup.account.options.${bank.id}.sub`)}
            selected={selected === bank.id}
            onPress={() => setSelected(bank.id)}
          />
        ))}
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => setCurrencyOpen(true)}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          minHeight: 44,
          marginTop: 10,
          marginHorizontal: 22,
          paddingHorizontal: 16,
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Text color={theme.colors.textTertiary} style={{ fontSize: 12.5 }}>
          {t('onboarding.setup.account.currency')}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text color={theme.colors.textSecondary} style={{ fontSize: 12.5 }}>
            {currency} · {t(`currency.names.${currency}`)}
          </Text>
          <Icon name="chevron-right" size={13} color={theme.colors.textTertiary} />
        </View>
      </Pressable>

      <View style={{ flex: 1, minHeight: 24 }} />

      <View style={{ paddingHorizontal: 22, paddingBottom: 12 }}>
        {createAccount.isError ? (
          <Text
            color={theme.colors.accentCoral}
            style={{ fontSize: 12.5, textAlign: 'center', marginBottom: 12 }}
          >
            {t('onboarding.setup.account.error')}
          </Text>
        ) : null}
        <InkButton
          label={t('onboarding.setup.account.submit')}
          onPress={() => setSheetOpen(true)}
          disabled={selected === null}
          height={56}
        />
        <Pressable
          accessibilityRole="button"
          onPress={onSkip}
          style={({ pressed }) => ({
            minHeight: 48,
            marginTop: 4,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text color={theme.colors.textSecondary} style={{ fontSize: 13 }}>
            {t('onboarding.setup.account.later')}
          </Text>
        </Pressable>
      </View>

      <AccountFormSheet
        visible={sheetOpen}
        account={null}
        initial={initial}
        currency={currency}
        submitting={createAccount.isPending}
        onClose={() => setSheetOpen(false)}
        onSave={save}
        onDelete={() => undefined}
        saveLabel={t('onboarding.setup.account.save')}
      />
      <CurrencyPickerSheet
        visible={currencyOpen}
        onClose={() => setCurrencyOpen(false)}
        onChange={(code) => updatePreferences.mutate({ currency: code })}
      />
    </OnbFrame>
  );
}
