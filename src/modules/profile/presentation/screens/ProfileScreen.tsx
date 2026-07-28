import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
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
import { useDeudas } from '@/modules/deudas/presentation/hooks/useDeudas';
import { useSubscriptions } from '@/modules/subscriptions/presentation/hooks/useSubscriptions';
import { usePlanStore } from '@/modules/plan/presentation/stores/usePlanStore';
import { CurrencyChangeBlockedError } from '@/modules/auth/domain';
import type { Objective } from '@/shared/domain';
import { useCurrencyStore } from '@/shared/presentation/currency/useCurrencyStore';
import {
  CurrencyPickerSheet,
  SettingsGroup,
  SettingsRow,
  SubScreenHeader,
  Text,
  Toast,
} from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { toIsoDate } from '@/shared/presentation/utils/dates';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

import { AppearanceRow } from '../components/AppearanceRow';
import { ObjectivePickerSheet } from '../components/ObjectivePickerSheet';
import { EditNameSheet } from '../components/EditNameSheet';
import type { UserProfile } from '../../domain/types/UserProfile';

import { ProfileBlock } from '../components/ProfileBlock';

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
  const session = useAuthStore((s) => s.session);
  const logout = useLogout();
  const updatePreferences = useUpdatePreferences();
  const tier = usePlanStore((s) => s.tier);
  // Real subtitles: these two rows used to carry hardcoded figures ("4 activas ·
  // saldo neto $5.245.000") over data that has been real for a while.
  const accounts = useAccounts();
  const categories = useCategories();
  // Same query keys the subscriptions and deudas screens use — usually cache hits.
  const today = useMemo(() => toIsoDate(new Date()), []);
  const subscriptions = useSubscriptions(today);
  const debts = useDeudas(today);
  const onboardingName = useOnboardingStore((s) => s.profile?.name);
  const currency = useCurrencyStore((s) => s.currency);
  const [editOpen, setEditOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [objectiveOpen, setObjectiveOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Who you are comes from the session; the version from the build. The old
  // in-memory repo answered "Sebastián Mejía · sebas@gastos.app" to everyone.
  const profile = useMemo<UserProfile>(() => {
    const name = onboardingName?.trim() || session?.displayName?.trim() || '';
    return {
      id: session?.userId ?? '',
      displayName: name,
      email: session?.email ?? '',
      initials: initialsOf(name || session?.email || ''),
      version: `v${Constants.expoConfig?.version ?? '0.0.0'}`,
    };
  }, [session, onboardingName]);

  const cycleLanguage = () => {
    void i18n.changeLanguage(i18n.language.startsWith('en') ? 'es' : 'en');
  };

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
        <ProfileBlock profile={profile} onEdit={() => setEditOpen(true)} />

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
            subtitle={
              // It said «Pronto» for a whole slice after the module shipped.
              subscriptions.data
                ? subscriptions.data.count === 0
                  ? t('profile.rows.subs.subtitleEmpty')
                  : t('profile.rows.subs.subtitle', {
                      count: subscriptions.data.count,
                      monthly: formatMoney(
                        subscriptions.data.monthly,
                        subscriptions.data.currency,
                      ),
                    })
                : undefined
            }
            onPress={() => router.push('/subscriptions')}
          />
          <SettingsRow
            icon="target"
            iconColor="coral"
            title={t('profile.rows.objective.title')}
            subtitle={
              session?.objective
                ? t(`profile.objective.options.${session.objective}`)
                : t('profile.objective.none')
            }
            onPress={() => setObjectiveOpen(true)}
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
            subtitle={
              debts.data
                ? (() => {
                    const open = debts.data.iOwe.count + debts.data.owedToMe.count;
                    return open === 0
                      ? t('profile.rows.deudas.subtitleEmpty')
                      : t('profile.rows.deudas.subtitle', { count: open });
                  })()
                : undefined
            }
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
            {profile.version} · Deshka
          </Text>
        </View>
      </ScrollView>

      <CurrencyPickerSheet
        visible={currencyOpen}
        onClose={() => setCurrencyOpen(false)}
        onChange={(code) =>
          updatePreferences.mutate(
            { currency: code },
            {
              // Not a failure to retry: the app is refusing to re-label money the
              // user already registered, and the copy has to say why.
              onError: (error) =>
                setToast(
                  error instanceof CurrencyChangeBlockedError
                    ? t('profile.currency.blocked')
                    : t('profile.currency.failed'),
                ),
            },
          )
        }
      />
      <ObjectivePickerSheet
        visible={objectiveOpen}
        selected={session?.objective ?? null}
        onClose={() => setObjectiveOpen(false)}
        onChange={(objective: Objective) => {
          setObjectiveOpen(false);
          updatePreferences.mutate(
            { objective },
            { onError: () => setToast(t('profile.objective.failed')) },
          );
        }}
      />

      <Toast
        visible={toast !== null}
        message={toast ?? ''}
        onDismiss={() => setToast(null)}
        durationMs={4000}
      />
      <EditNameSheet
        visible={editOpen}
        initialName={profile.displayName}
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
