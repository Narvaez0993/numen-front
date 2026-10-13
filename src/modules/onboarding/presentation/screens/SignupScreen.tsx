import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { CredentialsForm, useRegister } from '@/modules/auth/presentation';
import type { DomainError } from '@/shared/domain';
import { Text, Toast } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

import { OnbFrame } from '../components/OnbFrame';
import { OnbHeadline } from '../components/OnbHeadline';
import { OnbTopBar } from '../components/OnbTopBar';
import { SocialSignIn } from '../components/SocialSignIn';

type Props = {
  onBack: () => void;
  onRegistered: (email: string) => void;
};

/**
 * Creating the account, in the shape the design gives to «Guardemos esto»: a
 * title that talks, the fields, the platform's sign-in under an «o», and the
 * button at the bottom.
 *
 * It used to be two screens — pick a method, then fill a form — for what is one
 * decision. The method picker only ever led to the form: the other two buttons
 * said «pronto».
 *
 * The design asks for an email alone and sends a code. Deshka keeps the
 * password (HU-01, RF-01 and RF-53), so the footnote no longer promises «sin
 * contraseñas».
 */
export function SignupScreen({ onBack, onRegistered }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [soon, setSoon] = useState(false);
  const register = useRegister({ onSuccess: ({ email }) => onRegistered(email) });

  const errorCode = (register.error as DomainError | null)?.code;
  const emailError =
    errorCode === 'auth.user_already_exists'
      ? t('auth.register.errors.emailExists')
      : undefined;
  const formError =
    register.isError && !emailError ? t('auth.register.errors.generic') : null;

  return (
    <OnbFrame scroll>
      <OnbTopBar onBack={onBack} label={t('auth.register.label')} />
      <OnbHeadline i18nKey="auth.register.title" body={t('auth.register.body')} />

      <CredentialsForm
        onSubmit={({ email, password }) => {
          if (register.isError) register.reset();
          register.mutate({ email: email.trim(), password });
        }}
        submitLabel={t('auth.register.submit')}
        loading={register.isPending}
        serverError={emailError}
        formError={formError}
        passwordAutoComplete="new-password"
        between={<SocialSignIn onPress={() => setSoon(true)} />}
        footnote={
          <Text
            color={theme.colors.textTertiary}
            style={{ fontSize: 11, lineHeight: 18, textAlign: 'center', marginTop: 14 }}
          >
            {t('auth.register.footnote')}
          </Text>
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
