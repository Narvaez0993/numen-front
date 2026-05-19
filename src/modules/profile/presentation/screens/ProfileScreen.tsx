import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useOnboardingStore } from '@/modules/onboarding/presentation/stores/useOnboardingStore';
import {
  SettingsGroup,
  SettingsRow,
  SubScreenHeader,
  Text,
} from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

import { AppearanceRow } from '../components/AppearanceRow';
import { ProfileBlock } from '../components/ProfileBlock';
import { useProfile } from '../hooks/useProfile';

export function ProfileScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { data, isLoading } = useProfile();

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
        <ProfileBlock profile={data} />

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
            last
            onPress={() => router.push('/categories')}
          />
        </SettingsGroup>

        <SettingsGroup label={t('profile.groups.app')}>
          <SettingsRow icon="bell" title={t('profile.rows.notifications.title')} />
          <AppearanceRow />
          <SettingsRow
            icon="sparkles"
            iconColor="purple"
            title={t('profile.rows.assistant.title')}
            value={t('profile.rows.assistant.value')}
            last
          />
        </SettingsGroup>

        <SettingsGroup label={t('profile.groups.account')}>
          <SettingsRow icon="lock" title={t('profile.rows.security.title')} />
          <SettingsRow
            icon="star"
            title={t('profile.rows.plan.title')}
            value={t('profile.rows.plan.value')}
            onPress={() => router.push('/plan')}
          />
          <SettingsRow icon="download" title={t('profile.rows.export.title')} last />
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
    </SafeAreaView>
  );
}
