import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { CodeBoxes } from '@/modules/onboarding/presentation/components/CodeBoxes';
import { OnbFrame } from '@/modules/onboarding/presentation/components/OnbFrame';
import { OnbHeadline } from '@/modules/onboarding/presentation/components/OnbHeadline';
import { OnbTopBar } from '@/modules/onboarding/presentation/components/OnbTopBar';
import type { DomainError } from '@/shared/domain';
import { AmountKeypad, InkButton, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

import type { AuthSessionDTO } from '../../application';
import { useResendCode } from '../hooks/useResendCode';
import { useVerifyEmail } from '../hooks/useVerifyEmail';

const CODE_LENGTH = 6;
const RESEND_SECONDS = 30;
/** How long a wrong code stays on screen before the boxes empty. */
const CLEAR_AFTER_MS = 550;

const ERROR_KEY: Record<string, string> = {
  'auth.verification_code_invalid': 'auth.verify.errors.invalid',
  'auth.verification_code_expired': 'auth.verify.errors.expired',
  'auth.verification_attempts_exceeded': 'auth.verify.errors.tooManyAttempts',
  'auth.resend_cooldown': 'auth.verify.errors.cooldown',
};

type Props = {
  email: string;
  onBack?: () => void;
  onVerified: (session: AuthSessionDTO) => void;
};

/**
 * «Te mandé seis números.» — the one screen that checks the email, after
 * signing up and after a login the server answered with «not verified».
 *
 * As the design draws it: six boxes, the app's own keypad pinned under them and
 * «Entrar» at the bottom. With the system keyboard the screen jumped as it came
 * up, and the code went in on the sixth digit with no chance to look at it — a
 * wrong last digit burned an attempt. Now the button sends it.
 */
export function VerifyScreen({ email, onBack, onVerified }: Props) {
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

  // A wrong code stays up long enough to be read, then clears for the next try.
  useEffect(() => {
    if (!verify.isError) return;
    const id = setTimeout(() => setCode(''), CLEAR_AFTER_MS);
    return () => clearTimeout(id);
  }, [verify.isError]);

  const press = (key: string) => {
    if (verify.isPending) return;
    if (verify.isError) verify.reset();
    if (resend.isError) resend.reset();
    // Not the amount pad's rules: a code may start with zero.
    setCode((current) =>
      key === 'back'
        ? current.slice(0, -1)
        : current.length >= CODE_LENGTH
          ? current
          : `${current}${key}`,
    );
  };

  const submit = () => {
    if (code.length === CODE_LENGTH && !verify.isPending) {
      verify.mutate({ email, code });
    }
  };

  const activeError = (verify.error ?? resend.error) as DomainError | null;
  const errorMessage = activeError
    ? t(ERROR_KEY[activeError.code] ?? 'auth.verify.errors.generic')
    : null;
  const time = `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')}`;

  return (
    <OnbFrame>
      <OnbTopBar variant="circle" onBack={onBack} />
      <OnbHeadline
        i18nKey="auth.verify.title"
        body={t('auth.verify.subtitle', { email })}
      />

      <View style={{ paddingTop: 34 }}>
        <CodeBoxes value={code} length={CODE_LENGTH} error={verify.isError} />
      </View>

      <View style={{ paddingHorizontal: 26, paddingTop: 12, gap: 4 }}>
        {errorMessage ? (
          <Text color={theme.colors.accentCoral} style={{ fontSize: 12.5 }}>
            {errorMessage}
          </Text>
        ) : null}
        {remaining > 0 || resend.isPending ? (
          <Text color={theme.palette.acc} style={{ fontSize: 12.5, paddingVertical: 8 }}>
            {resend.isPending
              ? t('auth.verify.resending')
              : t('auth.verify.resendIn', { time })}
          </Text>
        ) : (
          <Pressable
            accessibilityRole="button"
            onPress={() => resend.mutate({ email })}
            hitSlop={8}
            style={({ pressed }) => ({ paddingVertical: 8, opacity: pressed ? 0.7 : 1 })}
          >
            <Text color={theme.palette.acc} style={{ fontSize: 12.5, fontWeight: '500' }}>
              {t('auth.verify.resend')}
            </Text>
          </Pressable>
        )}
      </View>

      <View style={{ flex: 1, minHeight: 16 }} />

      <View style={{ paddingHorizontal: 20 }}>
        <AmountKeypad triple={false} onKey={press} />
      </View>
      <View style={{ paddingHorizontal: 22, paddingTop: 16, paddingBottom: 8 }}>
        <InkButton
          label={t('auth.verify.submit')}
          disabled={code.length < CODE_LENGTH}
          loading={verify.isPending}
          onPress={submit}
        />
      </View>
    </OnbFrame>
  );
}
