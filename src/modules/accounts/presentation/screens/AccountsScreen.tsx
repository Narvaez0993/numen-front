import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';

import { useTier } from '@/modules/plan/presentation/hooks/useTier';
import { useDeudas } from '@/modules/deudas/presentation/hooks/useDeudas';
import { GateSheet } from '@/modules/plan/presentation/components/GateSheet';
import type { AccentColor } from '@/shared/domain';
import {
  Aurora,
  DashedButton,
  Icon,
  RetryState,
  Text,
  Toast,
} from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { toIsoDate } from '@/shared/presentation/utils/dates';
import { amountDigits, formatMoney } from '@/shared/presentation/utils/formatMoney';

import {
  AccountLimitReachedError,
  type Account,
  type CreditCard,
  CreditCardLimitReachedError,
} from '../../domain';
import { AccountFormSheet, type AccountFormInput } from '../components/AccountFormSheet';
import { CardFormSheet, type CardFormInput } from '../components/CardFormSheet';
import { CardTile } from '../components/CardTile';
import { SourceRow } from '../components/SourceRow';
import { useAccounts } from '../hooks/useAccounts';
import {
  useCreateAccount,
  useDeleteAccount,
  useUpdateAccount,
} from '../hooks/useAccountMutations';
import { useCreateCard, useDeleteCard, useUpdateCard } from '../hooks/useCardMutations';

const ACCOUNT_COLORS: readonly AccentColor[] = [
  'mint',
  'purple',
  'amber',
  'pink',
  'coral',
];

/** Free plan capacity; the backend is the authority and answers 403 as a backstop. */
const FREE_ACCOUNTS = 2;
const FREE_CARDS = 1;

/**
 * Everywhere money sits, on one screen.
 *
 * The redesign turned it from a settings page into an answer. It used to open
 * with a "net balance" card and then a settings-style list; now it opens with
 * **what you have** at 41px — the sum of the accounts, not the net — and puts the
 * card debt in one quiet line under it. That ordering is the honest one: cash
 * you can spend and a card you owe are different facts, and folding them into a
 * single "net" number hides the one that decides what you can do today.
 *
 * Debts join the screen for the first time. They belong here rather than only in
 * Deudas because "how much do I have?" is not answerable without them, and until
 * now the two lived on screens that never mentioned each other.
 */
export function AccountsScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const today = useMemo(() => toIsoDate(new Date()), []);
  const { data, isLoading, isError, refetch } = useAccounts();
  const debts = useDeudas(today);

  const createAccount = useCreateAccount();
  const updateAccount = useUpdateAccount();
  const deleteAccount = useDeleteAccount();
  const createCard = useCreateCard();
  const updateCard = useUpdateCard();
  const deleteCard = useDeleteCard();

  const [accountSheet, setAccountSheet] = useState<{
    open: boolean;
    account: Account | null;
  }>({ open: false, account: null });
  const [cardSheet, setCardSheet] = useState<{
    open: boolean;
    card: CreditCard | null;
  }>({ open: false, card: null });
  const [gate, setGate] = useState<'account' | 'card' | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const isPlus = useTier() === 'plus';

  /** This source's movements — the question a tap on a source is actually asking.
   * Its own stack route, not the Movements tab: a tab has nothing to pop back to,
   * and arriving here should always leave a way home. */
  const goToMovements = (sourceId: string) => router.push(`/source/${sourceId}`);

  if (isError) {
    return (
      <SafeAreaView
        edges={['top']}
        style={{ flex: 1, backgroundColor: theme.colors.bgBase }}
      >
        <RetryState
          titleKey="accounts.error.title"
          retryKey="accounts.error.retry"
          onRetry={() => void refetch()}
        />
      </SafeAreaView>
    );
  }

  if (isLoading || !data) {
    return (
      <SafeAreaView
        edges={['top']}
        style={{
          flex: 1,
          backgroundColor: theme.colors.bgBase,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator color={theme.palette.acc} />
      </SafeAreaView>
    );
  }

  const { accounts, creditCards, currency } = data;
  const cash = data.debitTotal + data.cashTotal;
  const atAccountLimit = !isPlus && accounts.length >= FREE_ACCOUNTS;
  const atCardLimit = !isPlus && creditCards.length >= FREE_CARDS;

  const owedToMe = debts.data?.owedToMe;
  const iOwe = debts.data?.iOwe;
  const hasPeople = (owedToMe?.count ?? 0) + (iOwe?.count ?? 0) > 0;

  const closeAccountSheet = () => setAccountSheet({ open: false, account: null });
  const closeCardSheet = () => setCardSheet({ open: false, card: null });

  /** Capacity errors open the gate; anything else surfaces as a toast. */
  const handleMutationError = (error: Error) => {
    if (error instanceof AccountLimitReachedError) {
      closeAccountSheet();
      setGate('account');
      return;
    }
    if (error instanceof CreditCardLimitReachedError) {
      closeCardSheet();
      setGate('card');
      return;
    }
    setToast(t('accounts.errors.saveFailed'));
  };

  const handleSaveAccount = (input: AccountFormInput) => {
    const existing = accountSheet.account;
    if (existing) {
      updateAccount.mutate(
        {
          id: existing.id,
          patch: { name: input.name, sub: input.sub, balance: input.balance },
        },
        { onSuccess: closeAccountSheet, onError: handleMutationError },
      );
      return;
    }
    const color = ACCOUNT_COLORS[accounts.length % ACCOUNT_COLORS.length] ?? 'mint';
    createAccount.mutate(
      {
        kind: input.kind,
        name: input.name,
        sub: input.sub,
        icon: input.kind === 'debit' ? 'building-bank' : 'cash',
        color,
        balance: input.balance,
      },
      { onSuccess: closeAccountSheet, onError: handleMutationError },
    );
  };

  const handleDeleteAccount = () => {
    const existing = accountSheet.account;
    if (!existing) return;
    deleteAccount.mutate(existing.id, {
      onSuccess: closeAccountSheet,
      onError: () => setToast(t('accounts.errors.deleteFailed')),
    });
  };

  const handleSaveCard = (input: CardFormInput) => {
    const existing = cardSheet.card;
    if (existing) {
      updateCard.mutate(
        // `dueDay: null` means "not provided" on the wire; the form guarantees a
        // stored day is never blanked, so nothing is silently dropped here.
        { id: existing.id, patch: { ...input, dueDay: input.dueDay ?? undefined } },
        { onSuccess: closeCardSheet, onError: handleMutationError },
      );
      return;
    }
    createCard.mutate(
      { ...input, icon: 'credit-card', color: 'coral' },
      { onSuccess: closeCardSheet, onError: handleMutationError },
    );
  };

  const handleDeleteCard = () => {
    const existing = cardSheet.card;
    if (!existing) return;
    deleteCard.mutate(existing.id, {
      onSuccess: closeCardSheet,
      onError: () => setToast(t('accounts.errors.deleteFailed')),
    });
  };

  return (
    <Aurora>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 26,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            paddingHorizontal: 22,
          }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('common.back')}
            onPress={() => router.back()}
            style={({ pressed }) => ({
              width: 44,
              height: 44,
              borderRadius: 22,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme.colors.bgFloat,
              borderWidth: 1,
              borderColor: theme.colors.borderSubtle,
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Icon
              name="arrow-left"
              size={16}
              stroke={2}
              color={theme.colors.textSecondary}
            />
          </Pressable>
          <Text style={{ fontSize: 16, fontWeight: '500' }}>{t('accounts.title')}</Text>
        </View>

        <View style={{ paddingHorizontal: 26, paddingTop: 24 }}>
          <Text
            variant="micro"
            uppercase
            color={theme.colors.textTertiary}
            style={{ letterSpacing: 2.2, marginBottom: 8 }}
          >
            {t('accounts.have')}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 3 }}>
            <Text
              color={theme.colors.textTertiary}
              style={{ fontSize: 19, fontWeight: '300' }}
            >
              $
            </Text>
            <Text
              tabular
              style={{
                fontSize: 41,
                fontWeight: '500',
                letterSpacing: -2,
              }}
            >
              {amountDigits(cash, currency)}
            </Text>
          </View>
          {/* Only when there is a card. Without one the line would be arithmetic
              about nothing. */}
          {data.tcDebt > 0 ? (
            <Text
              color={theme.colors.textTertiary}
              style={{ fontSize: 12.5, marginTop: 9 }}
            >
              {t('accounts.minusCard')}{' '}
              <Text tabular style={{ fontSize: 12.5 }}>
                {formatMoney(data.netBalance, currency)}
              </Text>
            </Text>
          ) : null}
        </View>

        <View style={{ paddingHorizontal: 26, paddingTop: 24 }}>
          <Text
            variant="micro"
            uppercase
            color={theme.colors.textTertiary}
            style={{ letterSpacing: 2.2, marginBottom: 6 }}
          >
            {t('accounts.groups.accounts')}
          </Text>

          {accounts.length > 0 ? (
            accounts.map((account, index) => (
              <SourceRow
                key={account.id}
                name={account.name}
                sub={account.sub || undefined}
                icon={account.icon}
                amount={account.balance}
                currency={currency}
                last={index === accounts.length - 1}
                onPress={() => goToMovements(account.id)}
                onEdit={() => setAccountSheet({ open: true, account })}
                editLabel={t('accounts.edit', { name: account.name })}
              />
            ))
          ) : (
            <Text
              color={theme.colors.textTertiary}
              style={{ fontSize: 12.5, lineHeight: 18, paddingVertical: 12 }}
            >
              {t('accounts.empty.body')}
            </Text>
          )}

          {hasPeople ? (
            <>
              <Text
                variant="micro"
                uppercase
                color={theme.colors.textTertiary}
                style={{ letterSpacing: 2.2, marginTop: 20, marginBottom: 10 }}
              >
                {t('accounts.groups.people')}
              </Text>
              {(owedToMe?.count ?? 0) > 0 ? (
                <SourceRow
                  name={t('accounts.people.owedToMe')}
                  sub={t('accounts.people.count', { count: owedToMe?.count ?? 0 })}
                  icon="users"
                  amount={owedToMe?.total ?? 0}
                  currency={currency}
                  tint={theme.colors.accentMint}
                  last={(iOwe?.count ?? 0) === 0}
                  onPress={() => router.push('/deudas')}
                />
              ) : null}
              {(iOwe?.count ?? 0) > 0 ? (
                <SourceRow
                  name={t('accounts.people.iOwe')}
                  sub={t('accounts.people.count', { count: iOwe?.count ?? 0 })}
                  icon="users"
                  amount={iOwe?.total ?? 0}
                  currency={currency}
                  tint={theme.colors.accentCoral}
                  last
                  onPress={() => router.push('/deudas')}
                />
              ) : null}
            </>
          ) : null}

          {creditCards.length > 0 ? (
            <>
              <Text
                variant="micro"
                uppercase
                color={theme.colors.textTertiary}
                style={{ letterSpacing: 2.2, marginTop: 20, marginBottom: 10 }}
              >
                {t('accounts.groups.credit')}
              </Text>
              <View style={{ gap: 10 }}>
                {creditCards.map((card) => (
                  <CardTile
                    key={card.id}
                    card={card}
                    onPress={() => goToMovements(card.id)}
                    onEdit={() => setCardSheet({ open: true, card })}
                    editLabel={t('accounts.edit', { name: card.name })}
                  />
                ))}
              </View>
            </>
          ) : null}
        </View>

        <View style={{ paddingHorizontal: 24, paddingTop: 20, gap: 8 }}>
          <DashedButton
            label={t('accounts.add.account')}
            onPress={() =>
              atAccountLimit
                ? setGate('account')
                : setAccountSheet({ open: true, account: null })
            }
          />
          {/* The bundle draws one adder because its mockup already has a card.
              Two are needed for the screen to be usable from empty — and a
              chooser in front of them would be a menu asking a question the
              buttons already answer. */}
          <DashedButton
            label={t('accounts.add.card')}
            onPress={() =>
              atCardLimit ? setGate('card') : setCardSheet({ open: true, card: null })
            }
          />
        </View>
      </ScrollView>

      <AccountFormSheet
        visible={accountSheet.open}
        account={accountSheet.account}
        currency={currency}
        submitting={createAccount.isPending || updateAccount.isPending}
        deleting={deleteAccount.isPending}
        onClose={closeAccountSheet}
        onSave={handleSaveAccount}
        onDelete={handleDeleteAccount}
      />
      <CardFormSheet
        visible={cardSheet.open}
        card={cardSheet.card}
        currency={currency}
        submitting={createCard.isPending || updateCard.isPending}
        deleting={deleteCard.isPending}
        onClose={closeCardSheet}
        onSave={handleSaveCard}
        onDelete={handleDeleteCard}
      />
      <GateSheet
        visible={gate !== null}
        title={t(
          gate === 'card' ? 'accounts.gate.cardTitle' : 'accounts.gate.accountTitle',
        )}
        body={t('accounts.gate.body')}
        onClose={() => setGate(null)}
      />
      <Toast
        visible={toast !== null}
        message={toast ?? ''}
        onDismiss={() => setToast(null)}
      />
    </Aurora>
  );
}
