import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { CredentialsForm, useRegister } from '@/modules/auth/presentation';
import type { DomainError } from '@/shared/domain';
import { useTheme } from '@/shared/presentation/theme';

import { OnbHeader } from '../components/OnbHeader';
import { OnbPage } from '../components/OnbPage';
import { Wordmark } from '../components/Wordmark';

type Props = {
  onBack: () => void;
  onRegistered: (email: string) => void;
};

export function EmailSignupScreen({ onBack, onRegistered }: Props) {
  const { t } = useTranslation();
  const { theme } = useTheme();

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
    register.mutate({ email: email.trim(), password });
  };

  return (
    <OnbPage paddingTop={14} paddingHorizontal={22} paddingBottom={24}>
      <OnbHeader onBack={onBack} />

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
          {t('auth.register.emailSubtitle')}
        </Text>
      </View>

      <View style={{ height: 40 }} />

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
            marginTop: 12,
          }}
        >
          {genericError}
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
          {t('onboarding.auth.signupHint')}
        </Text>
        <Text
          onPress={() => router.push('/(auth)/login')}
          style={{
            fontSize: 12.5,
            color: theme.colors.accentMint,
            fontFamily: 'Geist_500Medium',
          }}
        >
          {t('onboarding.auth.signupLink')}
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
