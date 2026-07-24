import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import type { DomainError } from '@/shared/domain';
import { Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

import type { AuthSessionDTO } from '../../application';
import { useResendCode } from '../hooks/useResendCode';
import { useVerifyEmail } from '../hooks/useVerifyEmail';

import { OtpInput } from './OtpInput';

const CODE_LENGTH = 6;
const RESEND_SECONDS = 30;

const ERROR_KEY: Record<string, string> = {
  'auth.verification_code_invalid': 'auth.verify.errors.invalid',
  'auth.verification_code_expired': 'auth.verify.errors.expired',
  'auth.verification_attempts_exceeded': 'auth.verify.errors.tooManyAttempts',
  'auth.resend_cooldown': 'auth.verify.errors.cooldown',
};

type Props = {
  email: string;
  onVerified: (session: AuthSessionDTO) => void;
};

export function VerifyCodeForm({ email, onVerified }: Props) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [code, setCode] = useState('');
  const [remaining, setRemaining] = useState(RESEND_SECONDS);

  const verify = useVerifyEmail({ onSuccess: onVerified });
  const resend = useResendCode({
    onSuccess: () => {
      setRemaining(RESEND_SECONDS);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });

  useEffect(() => {
    if (remaining <= 0) return;
    const id = setInterval(() => setRemaining((r) => (r <= 1 ? 0 : r - 1)), 1000);
    return () => clearInterval(id);
  }, [remaining]);

  useEffect(() => {
    if (!verify.isError) return;
    const id = setTimeout(() => setCode(''), 550);
    return () => clearTimeout(id);
  }, [verify.isError]);

  const handleChange = (value: string) => {
    setCode(value);
    if (verify.isError) verify.reset();
    if (resend.isError) resend.reset();
  };

  const activeError = (verify.error ?? resend.error) as DomainError | null;
  const errorMessage = activeError
    ? t(ERROR_KEY[activeError.code] ?? 'auth.verify.errors.generic')
    : null;

  const canResend = remaining <= 0 && !resend.isPending;

  return (
    <View style={styles.container}>
      <OtpInput
        value={code}
        onChange={handleChange}
        onComplete={(value) => verify.mutate({ email, code: value })}
        length={CODE_LENGTH}
        error={verify.isError}
        disabled={verify.isPending}
      />

      <View style={styles.status}>
        {verify.isPending ? (
          <Text variant="caption" muted>
            {t('auth.verify.verifying')}
          </Text>
        ) : errorMessage ? (
          <Text variant="caption" style={{ color: theme.colors.accentCoral }}>
            {errorMessage}
          </Text>
        ) : null}
      </View>

      <View style={styles.resend}>
        {canResend ? (
          <Pressable onPress={() => resend.mutate({ email })} hitSlop={8}>
            <Text variant="label" style={{ color: theme.colors.accentMint }}>
              {t('auth.verify.resend')}
            </Text>
          </Pressable>
        ) : (
          <Text variant="caption" muted>
            {resend.isPending
              ? t('auth.verify.resending')
              : t('auth.verify.resendIn', { seconds: remaining })}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 18,
  },
  status: {
    minHeight: 18,
    alignItems: 'center',
  },
  resend: {
    alignItems: 'center',
  },
});
