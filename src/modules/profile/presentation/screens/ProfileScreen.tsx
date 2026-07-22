import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useOnboardingStore } from '@/modules/onboarding/presentation/stores/useOnboardingStore';
import { usePlanStore } from '@/modules/plan/presentation/stores/usePlanStore';
import {
  SUPPORTED_CURRENCIES,
  useCurrencyStore,
} from '@/shared/presentation/currency/useCurrencyStore';
import {
  SettingsGroup,
  SettingsRow,
  SubScreenHeader,
  Text,
} from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

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
  const tier = usePlanStore((s) => s.tier);
  const onboardingName = useOnboardingStore((s) => s.profile?.name);
  const currency = useCurrencyStore((s) => s.currency);
  const setCurrency = useCurrencyStore((s) => s.setCurrency);
  const [editOpen, setEditOpen] = useState(false);

  const cycleLanguage = () => {
    void i18n.changeLanguage(i18n.language.startsWith('en') ? 'es' : 'en');
  };

  const cycleCurrency = () => {
    const idx = SUPPORTED_CURRENCIES.indexOf(currency);
    const next = SUPPORTED_CURRENCIES[(idx + 1) % SUPPORTED_CURRENCIES.length];
    if (next) setCurrency(next);
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
            subtitle={t('profile.rows.accounts.subtitle')}
            onPress={() => router.push('/accounts')}
          />
          <SettingsRow
            icon="refresh"
            iconColor="amber"
            title={t('profile.rows.subs.title')}
            subtitle={t('profile.rows.subs.subtitle')}
            onPress={() => router.push('/subscriptions')}
          />
          <SettingsRow
            icon="tag"
            iconColor="purple"
            title={t('profile.rows.categories.title')}
            subtitle={t('profile.rows.categories.subtitle')}
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
            onPress={cycleCurrency}
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
                useOnboardingStore.getState().reset();
                router.replace('/(onboarding)');
              }}
            />
          </SettingsGroup>
        ) : null}

        <Pressable
          accessibilityRole="button"
          onPress={() => {
            useOnboardingStore.getState().reset();
            router.replace('/(onboarding)');
          }}
          style={({ pressed }) => ({
            backgroundColor: 'transparent',
            borderColor: theme.colors.borderSubtle,
            borderWidth: 1,
            borderRadius: 14,
            paddingVertical: 13,
            alignItems: 'center',
            marginTop: 8,
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <Text variant="label" color={theme.colors.accentCoral} style={{ fontSize: 13 }}>
            {t('profile.signOut')}
          </Text>
        </Pressable>

        <View style={{ alignItems: 'center', marginTop: 18 }}>
          <Text variant="micro" muted style={{ fontSize: 10.5, letterSpacing: 0.42 }}>
            {data.version} · Gastos by IM
          </Text>
        </View>
      </ScrollView>

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
