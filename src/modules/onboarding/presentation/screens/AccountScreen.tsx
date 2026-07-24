import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Pressable, Text, View } from 'react-native';

import { CredentialsForm, useRegister } from '@/modules/auth/presentation';
import type { DomainError } from '@/shared/domain';
import { Toast } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

import { AuthButton } from '../components/AuthButton';
import { OnbHeader } from '../components/OnbHeader';
import { OnbPage } from '../components/OnbPage';
import { Wordmark } from '../components/Wordmark';

type Props = {
  name: string;
  onBack: () => void;
  onRegistered: (email: string) => void;
};

export function AccountScreen({ name, onBack, onRegistered }: Props) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [comingSoon, setComingSoon] = useState(false);

  const register = useRegister({ onSuccess: ({ email }) => onRegistered(email) });

  const errorCode = (register.error as DomainError | null)?.code;
  const emailError =
    errorCode === 'auth.user_already_exists'
      ? t('auth.register.errors.emailExists')
      : undefined;
  const genericError =
    register.isError && !emailError ? t('auth.register.errors.generic') : undefined;

  const submit = ({ email, password }: { email: string; password: string }) => {
    if (register.isError) register.reset();
    register.mutate({ name, email: email.trim(), password });
  };

  return (
    <OnbPage paddingTop={14} paddingHorizontal={22} paddingBottom={24}>
      <OnbHeader onBack={onBack} />

      <View style={{ height: 18 }} />
      <View style={{ alignItems: 'center', marginBottom: 22 }}>
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
          {t('auth.register.title')}
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
          {t('auth.register.subtitle')}
        </Text>
      </View>

      <View style={{ height: 24 }} />

      <View style={{ gap: 10 }}>
        {Platform.OS === 'ios' ? (
          <AuthButton
            icon="brand-apple"
            iconFilled
            label={t('onboarding.auth.apple')}
            variant="apple"
            onPress={() => setComingSoon(true)}
          />
        ) : null}
        <AuthButton
          icon="brand-google"
          label={t('onboarding.auth.google')}
          variant="surface"
          onPress={() => setComingSoon(true)}
        />
      </View>

      <View style={styles.divider}>
        <View style={[styles.line, { backgroundColor: theme.colors.borderSubtle }]} />
        <Text
          style={{
            fontSize: 12,
            color: theme.colors.textTertiary,
            fontFamily: 'Geist_400Regular',
          }}
        >
          {t('auth.register.or')}
        </Text>
        <View style={[styles.line, { backgroundColor: theme.colors.borderSubtle }]} />
      </View>

      <CredentialsForm
        onSubmit={submit}
        submitLabel={t('auth.register.submit')}
        submittingLabel={t('auth.register.submitting')}
        loading={register.isPending}
        serverError={emailError}
      />

      {genericError ? (
        <Text
          style={{
            fontSize: 12.5,
            color: theme.colors.accentCoral,
            fontFamily: 'Geist_400Regular',
            textAlign: 'center',
            marginTop: 10,
          }}
        >
          {genericError}
        </Text>
      ) : null}

      <View style={{ flex: 1, minHeight: 16 }} />

      <View style={{ alignItems: 'center', marginTop: 12, marginBottom: 10 }}>
        <Text
          style={{
            fontSize: 12.5,
            color: theme.colors.textSecondary,
            fontFamily: 'Geist_400Regular',
          }}
        >
          {t('onboarding.auth.signupHint')}{' '}
          <Pressable onPress={() => router.push('/(auth)/login')}>
            <Text
              style={{
                fontSize: 12.5,
                color: theme.colors.accentMint,
                fontFamily: 'Geist_500Medium',
              }}
            >
              {t('onboarding.auth.signupLink')}
            </Text>
          </Pressable>
        </Text>
      </View>

      <Text
        style={{
          fontSize: 11,
          color: theme.colors.textTertiary,
          lineHeight: 16,
          textAlign: 'center',
          paddingHorizontal: 12,
          fontFamily: 'Geist_400Regular',
        }}
      >
        {t('onboarding.auth.terms')}
      </Text>

      <Toast
        visible={comingSoon}
        message={t('auth.social.comingSoon')}
        onDismiss={() => setComingSoon(false)}
        durationMs={2500}
      />
    </OnbPage>
  );
}

const styles = {
  divider: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    marginVertical: 18,
  },
  line: {
    flex: 1,
    height: 1,
  },
};
