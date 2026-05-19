import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  SectionLabel,
  SettingsGroup,
  SettingsRow,
  SubScreenHeader,
} from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { formatCOP } from '@/shared/presentation/utils/formatCOP';

import { AddDashedButton } from '../components/AddDashedButton';
import { CreditCardItem } from '../components/CreditCardItem';
import { NetBalanceCard } from '../components/NetBalanceCard';
import { useAccounts } from '../hooks/useAccounts';

export function AccountsScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { data, isLoading } = useAccounts();

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
          accountsCount={data.accountsCount}
          creditCardsCount={data.creditCardsCount}
        />

        <SettingsGroup label={t('accounts.groups.debit')}>
          {data.accounts.map((account, i) => (
            <SettingsRow
              key={account.id}
              icon={account.icon}
              iconColor={account.color}
              title={account.name}
              subtitle={account.sub}
              value={formatCOP(account.balance)}
              last={i === data.accounts.length - 1}
              onPress={() => undefined}
            />
          ))}
        </SettingsGroup>

        <SectionLabel style={{ marginBottom: 10 }}>
          {t('accounts.groups.credit')}
        </SectionLabel>
        <View style={{ gap: 10, marginBottom: 16 }}>
          {data.creditCards.map((card) => (
            <CreditCardItem key={card.id} card={card} />
          ))}
        </View>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <AddDashedButton icon="plus" label={t('accounts.add.account')} />
          <AddDashedButton icon="plus" label={t('accounts.add.card')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
