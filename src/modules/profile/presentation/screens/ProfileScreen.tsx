import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAccounts } from '@/modules/accounts/presentation/hooks/useAccounts';
import {
  useAuthStore,
  useLogout,
  useUpdatePreferences,
} from '@/modules/auth/presentation';
import { useCategories } from '@/modules/categories/presentation/hooks/useCategories';
import { useOnboardingStore } from '@/modules/onboarding/presentation/stores/useOnboardingStore';
import { usePlanStore } from '@/modules/plan/presentation/stores/usePlanStore';
import { useCurrencyStore } from '@/shared/presentation/currency/useCurrencyStore';
import {
  CurrencyPickerSheet,
  SettingsGroup,
  SettingsRow,
  SubScreenHeader,
  Text,
} from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

import { AppearanceRow } from '../components/AppearanceRow';
import { EditNameSheet } from '../components/EditNameSheet';
import { ProfileBlock } from '../components/ProfileBlock';
import { useProfile } from '../hooks/useProfile';

function initialsOf(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function ProfileScreen() {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const { data, isLoading } = useProfile();
  const logout = useLogout();
  const updatePreferences = useUpdatePreferences();
  const tier = usePlanStore((s) => s.tier);
  // Real subtitles: these two rows used to carry hardcoded figures ("4 activas ·
  // saldo neto $5.245.000") over data that has been real for a while.
  const accounts = useAccounts();
  const categories = useCategories();
  const onboardingName = useOnboardingStore((s) => s.profile?.name);
  const currency = useCurrencyStore((s) => s.currency);
  const [editOpen, setEditOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);

  const cycleLanguage = () => {
    void i18n.changeLanguage(i18n.language.startsWith('en') ? 'es' : 'en');
  };

  if (isLoading || !data) {
    return (
      <SafeAreaView
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
      style={{ flex: 1, backgroundColor: theme.colors.bgBase }}
      edges={['top']}
    >
      <SubScreenHeader title={t('profile.title')} onBack={() => router.back()} />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 32,
        }}
        showsVerticalScrollIndicator={false}
      >
        <ProfileBlock
          profile={
            onboardingName?.trim()
              ? {
                  ...data,
                  displayName: onboardingName,
                  initials: initialsOf(onboardingName),
                }
              : data
          }
          onEdit={() => setEditOpen(true)}
        />

        <SettingsGroup label={t('profile.groups.myData')}>
          <SettingsRow
            icon="credit-card"
            iconColor="mint"
            title={t('profile.rows.accounts.title')}
            subtitle={
              accounts.data
                ? t('profile.rows.accounts.subtitle', {
                    count: accounts.data.accountsCount + accounts.data.creditCardsCount,
                    net: formatMoney(accounts.data.netBalance, accounts.data.currency),
                  })
                : undefined
            }
            onPress={() => router.push('/accounts')}
          />
          <SettingsRow
            icon="refresh"
            iconColor="amber"
            title={t('profile.rows.subs.title')}
            value={t('profile.soon')}
            onPress={() => router.push('/subscriptions')}
          />
          <SettingsRow
            icon="tag"
            iconColor="purple"
            title={t('profile.rows.categories.title')}
            subtitle={
              categories.data
                ? t('profile.rows.categories.subtitle', {
                    standard: categories.data.filter((c) => c.isStandard).length,
                    custom: categories.data.filter((c) => !c.isStandard).length,
                  })
                : undefined
            }
            onPress={() => router.push('/categories')}
          />
          <SettingsRow
            icon="users"
            iconColor="pink"
            title={t('profile.rows.deudas.title')}
            subtitle={t('profile.rows.deudas.subtitleEmpty')}
            last
            onPress={() => router.push('/deudas')}
          />
        </SettingsGroup>

        <SettingsGroup label={t('profile.groups.app')}>
          <SettingsRow
            icon="bell"
            title={t('profile.rows.notifications.title')}
            value={t('profile.soon')}
            chevron={false}
          />
          <AppearanceRow />
          <SettingsRow
            icon="notebook"
            iconColor="purple"
            title={t('profile.rows.language.title')}
            value={i18n.language.startsWith('en') ? 'English' : 'Español'}
            onPress={cycleLanguage}
          />
          <SettingsRow
            icon="cash"
            iconColor="amber"
            title={t('profile.rows.currency.title')}
            value={currency}
            onPress={() => setCurrencyOpen(true)}
          />
          <SettingsRow
            icon="sparkles"
            iconColor="purple"
            title={t('profile.rows.assistant.title')}
            value={t('profile.rows.assistant.value')}
            chevron={false}
            last
          />
        </SettingsGroup>

        <SettingsGroup label={t('profile.groups.account')}>
          <SettingsRow
            icon="star"
            iconColor="amber"
            title={t('profile.rows.plan.title')}
            value={tier === 'plus' ? 'Plus' : 'Free'}
            onPress={() => router.push('/plan')}
          />
          <SettingsRow
            icon="download"
            iconColor="mint"
            title={t('profile.rows.export.title')}
            value={t('profile.soon')}
            chevron={false}
            last
          />
        </SettingsGroup>

        {__DEV__ ? (
          <SettingsGroup label={t('profile.groups.developer')}>
            <SettingsRow
              icon="refresh"
              iconColor="coral"
              title={t('profile.rows.resetOnboarding.title')}
              subtitle={t('profile.rows.resetOnboarding.subtitle')}
              chevron={false}
              last
              onPress={() => {
                // Full replay: clear both flags and the session so the gate
                // sends us back to the welcome hook.
                useOnboardingStore.getState().hardReset();
                useAuthStore.getState().clear();
                router.replace('/(auth)/signup');
              }}
            />
          </SettingsGroup>
        ) : null}

        <Pressable
          accessibilityRole="button"
          disabled={logout.isPending}
          onPress={() => logout.mutate()}
          style={({ pressed }) => ({
            backgroundColor: 'transparent',
            borderColor: theme.colors.borderSubtle,
            borderWidth: 1,
            borderRadius: 14,
            paddingVertical: 13,
            alignItems: 'center',
            marginTop: 8,
            opacity: logout.isPending ? 0.6 : pressed ? 0.8 : 1,
          })}
        >
          {logout.isPending ? (
            <ActivityIndicator color={theme.colors.accentCoral} />
          ) : (
            <Text
              variant="label"
              color={theme.colors.accentCoral}
              style={{ fontSize: 13 }}
            >
              {t('profile.signOut')}
            </Text>
          )}
        </Pressable>

        <View style={{ alignItems: 'center', marginTop: 18 }}>
          <Text variant="micro" muted style={{ fontSize: 10.5, letterSpacing: 0.42 }}>
            {data.version} · Deshka
          </Text>
        </View>
      </ScrollView>

      <CurrencyPickerSheet
        visible={currencyOpen}
        onClose={() => setCurrencyOpen(false)}
        onChange={(code) => updatePreferences.mutate({ currency: code })}
      />
      <EditNameSheet
        visible={editOpen}
        initialName={onboardingName ?? data.displayName}
        onClose={() => setEditOpen(false)}
        onSave={(name) => {
          const store = useOnboardingStore.getState();
          if (store.profile) {
            store.updateName(name);
          } else {
            store.markCompleted({
              name,
              goal: null,
              bankId: null,
              sourceName: null,
              balance: 0,
            });
          }
          setEditOpen(false);
        }}
      />
    </SafeAreaView>
  );
}
