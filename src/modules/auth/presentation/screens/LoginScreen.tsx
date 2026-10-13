import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { OnbFrame } from '@/modules/onboarding/presentation/components/OnbFrame';
import { OnbHeadline } from '@/modules/onboarding/presentation/components/OnbHeadline';
import { OnbTopBar } from '@/modules/onboarding/presentation/components/OnbTopBar';
import { SocialSignIn } from '@/modules/onboarding/presentation/components/SocialSignIn';
import { useOnboardingStore } from '@/modules/onboarding/presentation/stores/useOnboardingStore';
import type { DomainError } from '@/shared/domain';
import { Text, Toast } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

import { CredentialsForm } from '../components/CredentialsForm';
import { useLogin } from '../hooks/useLogin';

/**
 * Coming back: «Qué gusto verte de nuevo». The design draws it as the same
 * screen as creating the account, told to someone it already knows — so it is
 * the same layout with its own title, and the way to an account at the bottom.
 */
export function LoginScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [pendingEmail, setPendingEmail] = useState('');
  const [soon, setSoon] = useState(false);

  const login = useLogin({
    onSuccess: (session) => {
      // Returning user: mark onboarding complete so the gate routes to tabs.
      useOnboardingStore.getState().markCompleted({
        name: session.displayName,
        goal: null,
        bankId: null,
        sourceName: null,
        balance: 0,
      });
    },
  });

  const error = login.error as DomainError | null;

  useEffect(() => {
    if (login.isError && error?.code === 'auth.email_not_verified' && pendingEmail) {
      router.push({ pathname: '/(auth)/verify', params: { email: pendingEmail } });
    }
  }, [login.isError, error, pendingEmail]);

  const errorMessage =
    login.isError && error?.code !== 'auth.email_not_verified'
      ? error?.code === 'auth.invalid_credentials'
        ? t('auth.login.errors.invalidCredentials')
        : t('auth.login.errors.generic')
      : null;

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(auth)/signup');
    }
  };

  const createAccount = () => {
    // Clear any prior setup so the new registration replays it (keeps
    // `introSeen`, so this lands on the register step, not the welcome hook).
    useOnboardingStore.getState().reset();
    router.replace('/(auth)/signup');
  };

  return (
    <OnbFrame scroll>
      <OnbTopBar onBack={goBack} label={t('auth.login.label')} />
      <OnbHeadline i18nKey="auth.login.title" body={t('auth.login.subtitle')} />

      <CredentialsForm
        onSubmit={(values) => {
          if (login.isError) login.reset();
          setPendingEmail(values.email.trim());
          login.mutate({ email: values.email.trim(), password: values.password });
        }}
        submitLabel={t('auth.login.submit')}
        loading={login.isPending}
        formError={errorMessage}
        passwordPlaceholder={t('auth.login.passwordPlaceholder')}
        passwordAutoComplete="current-password"
        between={<SocialSignIn onPress={() => setSoon(true)} />}
        footnote={
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 5,
              minHeight: 44,
              marginTop: 6,
            }}
          >
            <Text color={theme.colors.textTertiary} style={{ fontSize: 12.5 }}>
              {t('auth.login.noAccount')}
            </Text>
            <Pressable accessibilityRole="button" onPress={createAccount} hitSlop={10}>
              <Text
                color={theme.palette.acc3}
                style={{ fontSize: 12.5, fontWeight: '500' }}
              >
                {t('auth.login.createAccount')}
              </Text>
            </Pressable>
          </View>
        }
      />

      <Toast
        visible={soon}
        message={t('auth.social.comingSoon')}
        onDismiss={() => setSoon(false)}
        durationMs={2500}
      />
    </OnbFrame>
  );
}
