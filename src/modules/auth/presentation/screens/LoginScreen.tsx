import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { useOnboardingStore } from '@/modules/onboarding/presentation/stores/useOnboardingStore';
import type { DomainError } from '@/shared/domain';
import { Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

import { LoginForm } from '../components/LoginForm';
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

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.bgBase,
          padding: theme.spacing.xl,
          gap: theme.spacing.lg,
        },
      ]}
    >
      <View style={{ gap: theme.spacing.xs }}>
        <Text variant="h1">{t('auth.login.title')}</Text>
        <Text variant="body" muted>
          {t('auth.login.subtitle')}
        </Text>
      </View>

      <LoginForm
        onSubmit={(values) => {
          if (login.isError) login.reset();
          setPendingEmail(values.email.trim());
          login.mutate({ email: values.email.trim(), password: values.password });
        }}
        loading={login.isPending}
      />

      {errorMessage ? (
        <Text variant="caption" style={{ color: theme.colors.accentCoral }}>
          {errorMessage}
        </Text>
      ) : null}

      <View style={{ alignItems: 'center' }}>
        <Pressable
          onPress={() => {
            useOnboardingStore.getState().reset();
            router.replace('/(onboarding)');
          }}
          hitSlop={8}
        >
          <Text variant="caption" muted>
            {t('auth.login.noAccount')}{' '}
            <Text variant="caption" style={{ color: theme.colors.accentMint }}>
              {t('auth.login.createAccount')}
            </Text>
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
});
