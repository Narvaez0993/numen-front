import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '@/modules/auth/presentation';
import { GateSheet } from '@/modules/plan/presentation/components/GateSheet';
import type { AccentColor } from '@/shared/domain';
import {
  RetryState,
  SectionLabel,
  SettingsGroup,
  SettingsRow,
  SubScreenHeader,
  Text,
  Toast,
} from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

import {
  AccountLimitReachedError,
  type Account,
  type CreditCard,
  CreditCardLimitReachedError,
} from '../../domain';
import { AccountFormSheet, type AccountFormInput } from '../components/AccountFormSheet';
import { AddDashedButton } from '../components/AddDashedButton';
import { CardFormSheet, type CardFormInput } from '../components/CardFormSheet';
import { CreditCardItem } from '../components/CreditCardItem';
import { NetBalanceCard } from '../components/NetBalanceCard';
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

export function AccountsScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch } = useAccounts();

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

  const tier = useAuthStore((s) => s.session?.tier);
  const isPlus = tier === 'plus';

  /** This source's movements — the question a tap on a source is actually
   * asking. Its own stack route, not the Movements tab: a tab has nothing to
   * pop back to, and arriving here should always leave a way home. */
  const goToMovements = (sourceId: string) => router.push(`/source/${sourceId}`);

  if (isError) {
    return (
      <SafeAreaView
        edges={['top']}
        style={{ flex: 1, backgroundColor: theme.colors.bgBase }}
      >
        <SubScreenHeader title={t('accounts.title')} onBack={() => router.back()} />
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
        <ActivityIndicator color={theme.colors.accentMint} />
      </SafeAreaView>
    );
  }

  const { accounts, creditCards, currency } = data;
  const atAccountLimit = !isPlus && accounts.length >= FREE_ACCOUNTS;
  const atCardLimit = !isPlus && creditCards.length >= FREE_CARDS;

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
    <SafeAreaView
      edges={['top']}
      style={{ flex: 1, backgroundColor: theme.colors.bgBase }}
    >
      <SubScreenHeader title={t('accounts.title')} onBack={() => router.back()} />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 32,
        }}
        showsVerticalScrollIndicator={false}
      >
        <NetBalanceCard
          netBalance={data.netBalance}
          currency={currency}
          accountsCount={data.accountsCount}
          creditCardsCount={data.creditCardsCount}
        />

        {accounts.length > 0 ? (
          <SettingsGroup label={t('accounts.groups.debit')}>
            {accounts.map((account, i) => (
              <SettingsRow
                key={account.id}
                icon={account.icon}
                iconColor={account.color}
                title={account.name}
                subtitle={account.sub || undefined}
                value={formatMoney(account.balance, currency)}
                last={i === accounts.length - 1}
                // Tapping a source asks "what have I done with this account?",
                // not "let me rename it" — the balance is already on the row,
                // its movements are the part you cannot see from here.
                onPress={() => goToMovements(account.id)}
                onEdit={() => setAccountSheet({ open: true, account })}
                editLabel={t('accounts.edit', { name: account.name })}
              />
            ))}
          </SettingsGroup>
        ) : (
          <View
            style={{
              backgroundColor: theme.colors.bgSurface,
              borderColor: theme.colors.borderSubtle,
              borderWidth: 1,
              borderRadius: 16,
              padding: 18,
              marginBottom: 18,
              gap: 6,
            }}
          >
            <Text variant="bodyLarge" style={{ fontSize: 14 }}>
              {t('accounts.empty.title')}
            </Text>
            <Text variant="caption" muted style={{ fontSize: 12.5, lineHeight: 18 }}>
              {t('accounts.empty.body')}
            </Text>
          </View>
        )}

        {creditCards.length > 0 ? (
          <>
            <SectionLabel style={{ marginBottom: 10 }}>
              {t('accounts.groups.credit')}
            </SectionLabel>
            <View style={{ gap: 10, marginBottom: 16 }}>
              {creditCards.map((card) => (
                <CreditCardItem
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

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <AddDashedButton
            icon="plus"
            label={t('accounts.add.account')}
            onPress={() =>
              atAccountLimit
                ? setGate('account')
                : setAccountSheet({ open: true, account: null })
            }
          />
          <AddDashedButton
            icon="plus"
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
    </SafeAreaView>
  );
}
