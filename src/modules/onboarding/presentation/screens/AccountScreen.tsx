import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { Toast } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

import { AuthButton } from '../components/AuthButton';
import { OnbHeader } from '../components/OnbHeader';
import { OnbPage } from '../components/OnbPage';
import { Wordmark } from '../components/Wordmark';

type Props = {
  onBack: () => void;
  onEmailSignup: () => void;
};

export function AccountScreen({ onBack, onEmailSignup }: Props) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [comingSoon, setComingSoon] = useState(false);

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
          {t('auth.register.subtitle')}
        </Text>
      </View>

      <View style={{ height: 36 }} />

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

      <AuthButton
        icon="mail"
        label={t('onboarding.auth.emailSignup')}
        variant="surface"
        onPress={onEmailSignup}
      />

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

      <Toast
        visible={comingSoon}
        message={t('auth.social.comingSoon')}
        onDismiss={() => setComingSoon(false)}
        durationMs={2500}
      />
    </OnbPage>
  );
}

const styles = StyleSheet.create({
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 18,
  },
  line: {
    flex: 1,
    height: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    marginTop: 16,
    marginBottom: 12,
  },
});
