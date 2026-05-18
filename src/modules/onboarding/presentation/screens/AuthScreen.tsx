import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

import { useTheme } from '@/shared/presentation/theme';

import { AuthButton, type AuthButtonVariant } from '../components/AuthButton';
import { OnbHeader } from '../components/OnbHeader';
import { OnbPage } from '../components/OnbPage';
import { Wordmark } from '../components/Wordmark';
import type { AuthMode } from '../hooks/flowTransitions';

type Method = 'apple' | 'google' | 'email';

type Props = {
  mode: AuthMode;
  onBack: () => void;
  onAuthSuccess: () => void;
  onModeChange: (mode: AuthMode) => void;
};

export function AuthScreen({ mode, onBack, onAuthSuccess, onModeChange }: Props) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [loading, setLoading] = useState<Method | null>(null);

  const handleAuth = async (method: Method) => {
    setLoading(method);
    await new Promise((r) => setTimeout(r, 900));
    setLoading(null);
    onAuthSuccess();
  };

  const isSignup = mode === 'signup';

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
          {t(isSignup ? 'onboarding.auth.signup.title' : 'onboarding.auth.login.title')}
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
          {t(
            isSignup
              ? 'onboarding.auth.signup.subtitle'
              : 'onboarding.auth.login.subtitle',
          )}
        </Text>
      </View>

      <View style={{ height: 36 }} />

      <View style={{ gap: 10 }}>
        <AuthButton
          icon="brand-apple"
          iconFilled
          label={t('onboarding.auth.apple')}
          loading={loading === 'apple'}
          disabled={loading !== null && loading !== 'apple'}
          variant="apple"
          onPress={() => void handleAuth('apple')}
        />
        <AuthButton
          icon="brand-google"
          label={t('onboarding.auth.google')}
          loading={loading === 'google'}
          disabled={loading !== null && loading !== 'google'}
          variant="surface"
          onPress={() => void handleAuth('google')}
        />
        <AuthButton
          icon="mail"
          label={t('onboarding.auth.email')}
          loading={loading === 'email'}
          disabled={loading !== null && loading !== 'email'}
          variant={'ghost' satisfies AuthButtonVariant}
          onPress={() => void handleAuth('email')}
        />
      </View>

      <View style={{ flex: 1 }} />

      <View style={{ alignItems: 'center', marginTop: 16, marginBottom: 12 }}>
        <Text
          style={{
            fontSize: 12.5,
            color: theme.colors.textSecondary,
            fontFamily: 'Geist_400Regular',
          }}
        >
          {t(isSignup ? 'onboarding.auth.signupHint' : 'onboarding.auth.loginHint')}{' '}
          <Pressable onPress={() => onModeChange(isSignup ? 'login' : 'signup')}>
            <Text
              style={{
                fontSize: 12.5,
                color: theme.colors.accentMint,
                fontFamily: 'Geist_500Medium',
              }}
            >
              {t(isSignup ? 'onboarding.auth.signupLink' : 'onboarding.auth.loginLink')}
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
    </OnbPage>
  );
}
