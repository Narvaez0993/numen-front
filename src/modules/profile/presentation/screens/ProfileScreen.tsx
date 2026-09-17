import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAccounts } from '@/modules/accounts/presentation/hooks/useAccounts';
import { useAssistantUsage } from '@/modules/assistant/presentation/hooks/useAssistantUsage';
import {
  useAuthStore,
  useLogout,
  useMe,
  useUpdatePreferences,
} from '@/modules/auth/presentation';
import { useCategories } from '@/modules/categories/presentation/hooks/useCategories';
import { useDeudas } from '@/modules/deudas/presentation/hooks/useDeudas';
import { useGoals } from '@/modules/goals/presentation/hooks/useGoals';
import { useOnboardingStore } from '@/modules/onboarding/presentation/stores/useOnboardingStore';
import { useTier } from '@/modules/plan/presentation/hooks/useTier';
import { useSubscriptions } from '@/modules/subscriptions/presentation/hooks/useSubscriptions';
import { CurrencyChangeBlockedError } from '@/modules/auth/domain';
import type { Objective } from '@/shared/domain';
import { useCurrencyStore } from '@/shared/presentation/currency/useCurrencyStore';
import {
  Aurora,
  CurrencyPickerSheet,
  Icon,
  Text,
  Toast,
} from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { monthName, toIsoDate } from '@/shared/presentation/utils/dates';

import { AppearanceModes, AppearancePalette } from '../components/AppearanceSection';
import { EditNameSheet } from '../components/EditNameSheet';
import { GroupLabel } from '../components/GroupLabel';
import { IdentityBlock } from '../components/IdentityBlock';
import { ObjectivePickerSheet } from '../components/ObjectivePickerSheet';
import { PlanBanner } from '../components/PlanBanner';
import { ProfileRow } from '../components/ProfileRow';

function initialsOf(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/**
 * Tu cuenta.
 *
 * The screen the redesign left half-migrated on purpose: Apariencia arrived
 * early, in stage 6a, because five stages were about to be built on two axes
 * nobody could reach. The rest stayed on the old settings list, which made this
 * the one place in the app where both design systems were visible at once — and
 * the reason it goes first now.
 *
 * Three things changed beyond the paint:
 *
 * - **The rows lost their colours.** Every one of them used to carry an accent
 *   well of its own, which turned a list of settings into the loudest surface in
 *   a monochrome app. One chip colour now, and the only accent left is the plan
 *   card — the one row that is actually selling something.
 * - **The right-hand side is a count, not a sentence.** «12» answers what «8
 *   estándar · 4 personalizadas» was trying to say, and it does not wrap.
 * - **Sign out is a row.** It was a bordered button the width of the screen,
 *   which gave the least-used action on the screen the most weight.
 *
 * What is NOT here is deliberate: the bundle draws switches for the nightly
 * reminder and the PIN, and a CSV export. Those are features, not skin — they
 * keep their place with a «Pronto» so the shape of the screen is already final
 * when they land.
 */
export function ProfileScreen() {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();

  const session = useAuthStore((s) => s.session);
  const me = useMe();
  const logout = useLogout();
  const updatePreferences = useUpdatePreferences();
  const tier = useTier();

  const today = useMemo(() => toIsoDate(new Date()), []);
  // The same query keys their own screens use — usually cache hits. Each one
  // feeds the count on its row.
  const accounts = useAccounts();
  const categories = useCategories();
  const subscriptions = useSubscriptions(today);
  const debts = useDeudas(today);
  const goals = useGoals(today);
  const usage = useAssistantUsage(today);

  const onboardingName = useOnboardingStore((s) => s.profile?.name);
  const currency = useCurrencyStore((s) => s.currency);

  const [editOpen, setEditOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [objectiveOpen, setObjectiveOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const name = onboardingName?.trim() || session?.displayName?.trim() || '';
  const version = `v${Constants.expoConfig?.version ?? '0.0.0'}`;

  // "Contigo desde marzo" — the year only when it is not this one, because
  // "desde marzo" about a March two years ago is a smaller number than the truth.
  const since = useMemo(() => {
    const createdAt = me.data?.user.createdAt;
    if (!createdAt) return null;
    const language = i18n.language.startsWith('en') ? 'en' : 'es';
    const month = monthName(toIsoDate(createdAt), language);
    return createdAt.getFullYear() === new Date().getFullYear()
      ? t('profile.identity.since', { month })
      : t('profile.identity.sinceYear', { month, year: createdAt.getFullYear() });
  }, [me.data, i18n.language, t]);

  const messagesLeft = usage.data
    ? Math.max(usage.data.messages.limit - usage.data.messages.used, 0)
    : null;

  const openCount =
    debts.data === undefined
      ? undefined
      : debts.data.iOwe.count + debts.data.owedToMe.count;

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
          <Text style={{ fontSize: 16, fontFamily: 'Geist_500Medium' }}>
            {t('profile.title')}
          </Text>
        </View>

        <View style={{ paddingHorizontal: 26, paddingTop: 22 }}>
          <IdentityBlock
            name={name || t('profile.identity.noName')}
            initials={initialsOf(name || session?.email || '')}
            since={since}
            onPress={() => setEditOpen(true)}
          />
        </View>

        <View style={{ paddingHorizontal: 22, paddingTop: 20 }}>
          <PlanBanner
            title={t(tier === 'plus' ? 'profile.plan.plus' : 'profile.plan.free')}
            subtitle={
              tier === 'plus'
                ? t('profile.plan.plusSub')
                : messagesLeft === null
                  ? t('profile.plan.freeSubUnknown')
                  : t('profile.plan.freeSub', { count: messagesLeft })
            }
            cta={t(tier === 'plus' ? 'profile.plan.ctaPlus' : 'profile.plan.ctaFree')}
            onPress={() => router.push('/plan')}
          />
        </View>

        <View style={{ paddingHorizontal: 26, paddingTop: 22 }}>
          <AppearanceModes />

          <GroupLabel style={{ marginBottom: 4 }}>
            {t('profile.groups.myMoney')}
          </GroupLabel>
          <ProfileRow
            icon="layout-grid"
            title={t('profile.rows.categories.title')}
            value={categories.data ? String(categories.data.length) : undefined}
            onPress={() => router.push('/categories')}
          />
          <ProfileRow
            icon="building-bank"
            title={t('profile.rows.accounts.title')}
            value={
              accounts.data
                ? String(accounts.data.accountsCount + accounts.data.creditCardsCount)
                : undefined
            }
            onPress={() => router.push('/accounts')}
          />
          <ProfileRow
            icon="users"
            title={t('profile.rows.deudas.title')}
            value={openCount === undefined ? undefined : String(openCount)}
            onPress={() => router.push('/deudas')}
          />
          <ProfileRow
            icon="target"
            title={t('profile.rows.goals.title')}
            value={
              goals.data
                ? String(goals.data.goals.filter((g) => !g.archived).length)
                : undefined
            }
            onPress={() => router.push('/goals')}
          />
          <ProfileRow
            icon="switch-horizontal"
            title={t('profile.rows.subs.title')}
            value={subscriptions.data ? String(subscriptions.data.count) : undefined}
            last
            onPress={() => router.push('/subscriptions')}
          />

          <View style={{ height: 20 }} />
          <AppearancePalette />

          <View style={{ height: 8 }} />
          <GroupLabel style={{ marginBottom: 4 }}>
            {t('profile.groups.settings')}
          </GroupLabel>
          {/* Three rows the bundle does not draw and the app cannot lose: the
              objective decides what Home leads with, and language and currency
              are the two settings a wrong guess at signup gets wrong. */}
          <ProfileRow
            icon="target"
            title={t('profile.rows.objective.title')}
            value={
              session?.objective
                ? t(`profile.objective.options.${session.objective}`)
                : t('profile.objective.none')
            }
            chevron={false}
            onPress={() => setObjectiveOpen(true)}
          />
          <ProfileRow
            icon="notebook"
            title={t('profile.rows.language.title')}
            value={i18n.language.startsWith('en') ? 'English' : 'Español'}
            chevron={false}
            onPress={() =>
              void i18n.changeLanguage(i18n.language.startsWith('en') ? 'es' : 'en')
            }
          />
          <ProfileRow
            icon="cash"
            title={t('profile.rows.currency.title')}
            value={currency}
            chevron={false}
            onPress={() => setCurrencyOpen(true)}
          />
          <ProfileRow
            icon="bell"
            title={t('profile.rows.reminder.title')}
            subtitle={t('profile.rows.reminder.subtitle')}
            value={t('common.soon')}
            chevron={false}
          />
          <ProfileRow
            icon="lock"
            title={t('profile.rows.pin.title')}
            subtitle={t('profile.rows.pin.subtitle')}
            value={t('common.soon')}
            chevron={false}
          />
          <ProfileRow
            icon="download"
            title={t('profile.rows.export.title')}
            value={t('common.soon')}
            chevron={false}
            last={!__DEV__}
          />
          {__DEV__ ? (
            <ProfileRow
              icon="rotate"
              title={t('profile.rows.resetOnboarding.title')}
              subtitle={t('profile.rows.resetOnboarding.subtitle')}
              last
              onPress={() => {
                // Full replay: clear both flags and the session so the gate
                // sends us back to the welcome hook.
                useOnboardingStore.getState().hardReset();
                useAuthStore.getState().clear();
                router.replace('/(auth)/signup');
              }}
            />
          ) : null}

          <View style={{ height: 6 }} />
          <ProfileRow
            icon="logout"
            title={t('profile.signOut')}
            danger
            last
            chevron={false}
            onPress={() => logout.mutate()}
          />

          <View style={{ alignItems: 'center', marginTop: 14 }}>
            <Text variant="micro" color={theme.colors.textTertiary}>
              {version} · Deshka
            </Text>
          </View>
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
      <EditNameSheet
        visible={editOpen}
        initialName={name}
        onClose={() => setEditOpen(false)}
        onSave={(next) => {
          const store = useOnboardingStore.getState();
          if (store.profile) {
            store.updateName(next);
          } else {
            store.markCompleted({
              name: next,
              goal: null,
              bankId: null,
              sourceName: null,
              balance: 0,
            });
          }
          setEditOpen(false);
        }}
      />

      <Toast
        visible={toast !== null}
        message={toast ?? ''}
        onDismiss={() => setToast(null)}
        durationMs={4000}
      />
    </Aurora>
  );
}
