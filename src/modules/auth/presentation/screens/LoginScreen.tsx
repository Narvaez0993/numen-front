import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { OnbHeader } from '@/modules/onboarding/presentation/components/OnbHeader';
import { OnbPage } from '@/modules/onboarding/presentation/components/OnbPage';
import { Wordmark } from '@/modules/onboarding/presentation/components/Wordmark';
import { useOnboardingStore } from '@/modules/onboarding/presentation/stores/useOnboardingStore';
import type { DomainError } from '@/shared/domain';
import { useTheme } from '@/shared/presentation/theme';

import { CredentialsForm } from '../components/CredentialsForm';
import { useLogin } from '../hooks/useLogin';

export function LoginScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [pendingEmail, setPendingEmail] = useState('');

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
      router.replace('/(onboarding)');
    }
  };

  const createAccount = () => {
    useOnboardingStore.getState().reset();
    router.replace('/(onboarding)');
  };

  return (
    <OnbPage paddingTop={14} paddingHorizontal={22} paddingBottom={24}>
      <OnbHeader onBack={goBack} />

      <View style={{ height: 22 }} />
      <View style={{ alignItems: 'center', marginBottom: 28 }}>
        <Wordmark size={22} />
      </View>

      <View style={{ alignItems: 'center', maxWidth: 320, alignSelf: 'center' }}>
        <Text
          style={{
            fontSize: 26,
            fontFamily: 'Geist_500Medium',
            color: theme.colors.textPrimary,
            letterSpacing: -0.52,
            marginBottom: 10,
            textAlign: 'center',
          }}
        >
          {t('auth.login.title')}
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: theme.colors.textSecondary,
            lineHeight: 20,
            textAlign: 'center',
            fontFamily: 'Geist_400Regular',
          }}
        >
          {t('auth.login.subtitle')}
        </Text>
      </View>

      <View style={{ height: 40 }} />

      <CredentialsForm
        onSubmit={(values) => {
          if (login.isError) login.reset();
          setPendingEmail(values.email.trim());
          login.mutate({ email: values.email.trim(), password: values.password });
        }}
        submitLabel={t('auth.login.submit')}
        submittingLabel={t('auth.login.submitting')}
        loading={login.isPending}
        passwordPlaceholder={t('auth.login.passwordPlaceholder')}
        passwordAutoComplete="current-password"
      />

      {errorMessage ? (
        <Text
          style={{
            fontSize: 12.5,
            color: theme.colors.accentCoral,
            fontFamily: 'Geist_400Regular',
            textAlign: 'center',
            marginTop: 12,
          }}
        >
          {errorMessage}
        </Text>
      ) : null}

      <View style={{ flex: 1 }} />

      <View style={styles.footer}>
        <Text
          style={{
            fontSize: 12.5,
            color: theme.colors.textSecondary,
            fontFamily: 'Geist_400Regular',
          }}
        >
          {t('auth.login.noAccount')}
        </Text>
        <Text
          onPress={createAccount}
          style={{
            fontSize: 12.5,
            color: theme.colors.accentMint,
            fontFamily: 'Geist_500Medium',
          }}
        >
          {t('auth.login.createAccount')}
        </Text>
      </View>
    </OnbPage>
  );
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    marginTop: 16,
    marginBottom: 12,
  },
});
