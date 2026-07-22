import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  SectionLabel,
  SettingsGroup,
  SettingsRow,
  SubScreenHeader,
} from '@/shared/presentation/components';
import type { AccentColor } from '@/shared/domain';
import { useTheme } from '@/shared/presentation/theme';
import { formatCOP } from '@/shared/presentation/utils/formatCOP';

import type { Account, CreditCard } from '../../domain';
import { AccountFormSheet, type AccountFormInput } from '../components/AccountFormSheet';
import { AddDashedButton } from '../components/AddDashedButton';
import { CardFormSheet, type CardFormInput } from '../components/CardFormSheet';
import { CreditCardItem } from '../components/CreditCardItem';
import { NetBalanceCard } from '../components/NetBalanceCard';
import { useAccounts } from '../hooks/useAccounts';
import { useAccountsStore } from '../stores/useAccountsStore';

const ACCOUNT_COLORS: readonly AccentColor[] = [
  'mint',
  'purple',
  'amber',
  'pink',
  'coral',
];

export function AccountsScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { data } = useAccounts();

  const initialized = useAccountsStore((s) => s.initialized);
  const init = useAccountsStore((s) => s.init);
  const accounts = useAccountsStore((s) => s.accounts);
  const creditCards = useAccountsStore((s) => s.creditCards);
  const addAccount = useAccountsStore((s) => s.addAccount);
  const updateAccount = useAccountsStore((s) => s.updateAccount);
  const removeAccount = useAccountsStore((s) => s.removeAccount);
  const addCard = useAccountsStore((s) => s.addCard);
  const updateCard = useAccountsStore((s) => s.updateCard);
  const removeCard = useAccountsStore((s) => s.removeCard);

  const [accountSheet, setAccountSheet] = useState<{
    open: boolean;
    account: Account | null;
  }>({ open: false, account: null });
  const [cardSheet, setCardSheet] = useState<{
    open: boolean;
    card: CreditCard | null;
  }>({ open: false, card: null });

  useEffect(() => {
    if (data && !initialized) init(data);
  }, [data, initialized, init]);

  if (!initialized) {
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

  const debitTotal = accounts.reduce((sum, a) => sum + a.balance, 0);
  const tcDebt = creditCards.reduce((sum, c) => sum + c.debt, 0);
  const netBalance = debitTotal - tcDebt;

  const closeAccountSheet = () => setAccountSheet({ open: false, account: null });
  const closeCardSheet = () => setCardSheet({ open: false, card: null });

  const handleSaveAccount = (input: AccountFormInput) => {
    const existing = accountSheet.account;
    if (existing) {
      updateAccount(existing.id, {
        name: input.name,
        sub: input.sub,
        balance: input.balance,
      });
    } else {
      const color = ACCOUNT_COLORS[accounts.length % ACCOUNT_COLORS.length] ?? 'mint';
      const base = {
        id: `acc-${Date.now()}`,
        name: input.name,
        sub: input.sub,
        color,
        balance: input.balance,
      };
      addAccount(
        input.kind === 'debit'
          ? { ...base, kind: 'debit', icon: 'building-bank' }
          : { ...base, kind: 'cash', icon: 'cash' },
      );
    }
    closeAccountSheet();
  };

  const handleDeleteAccount = () => {
    if (accountSheet.account) removeAccount(accountSheet.account.id);
    closeAccountSheet();
  };

  const handleSaveCard = (input: CardFormInput) => {
    const existing = cardSheet.card;
    if (existing) {
      updateCard(existing.id, input);
    } else {
      addCard({
        id: `card-${Date.now()}`,
        icon: 'credit-card',
        color: 'coral',
        dueLabel: '—',
        ...input,
      });
    }
    closeCardSheet();
  };

  const handleDeleteCard = () => {
    if (cardSheet.card) removeCard(cardSheet.card.id);
    closeCardSheet();
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
          netBalance={netBalance}
          accountsCount={accounts.length}
          creditCardsCount={creditCards.length}
        />

        <SettingsGroup label={t('accounts.groups.debit')}>
          {accounts.map((account, i) => (
            <SettingsRow
              key={account.id}
              icon={account.icon}
              iconColor={account.color}
              title={account.name}
              subtitle={account.sub}
              value={formatCOP(account.balance)}
              last={i === accounts.length - 1}
              onPress={() => setAccountSheet({ open: true, account })}
            />
          ))}
        </SettingsGroup>

        <SectionLabel style={{ marginBottom: 10 }}>
          {t('accounts.groups.credit')}
        </SectionLabel>
        <View style={{ gap: 10, marginBottom: 16 }}>
          {creditCards.map((card) => (
            <CreditCardItem
              key={card.id}
              card={card}
              onPress={() => setCardSheet({ open: true, card })}
            />
          ))}
        </View>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <AddDashedButton
            icon="plus"
            label={t('accounts.add.account')}
            onPress={() => setAccountSheet({ open: true, account: null })}
          />
          <AddDashedButton
            icon="plus"
            label={t('accounts.add.card')}
            onPress={() => setCardSheet({ open: true, card: null })}
          />
        </View>
      </ScrollView>

      <AccountFormSheet
        visible={accountSheet.open}
        account={accountSheet.account}
        onClose={closeAccountSheet}
        onSave={handleSaveAccount}
        onDelete={handleDeleteAccount}
      />
      <CardFormSheet
        visible={cardSheet.open}
        card={cardSheet.card}
        onClose={closeCardSheet}
        onSave={handleSaveCard}
        onDelete={handleDeleteCard}
      />
    </SafeAreaView>
  );
}
