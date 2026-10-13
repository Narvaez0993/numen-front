import { zodResolver } from '@hookform/resolvers/zod';
import { useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Pressable, TextInput, View } from 'react-native';
import { z } from 'zod';

import { OnbField } from '@/modules/onboarding/presentation/components/OnbField';
import { InkButton, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export type CredentialsValues = z.infer<typeof schema>;

type Props = {
  onSubmit: (values: CredentialsValues) => void;
  submitLabel: string;
  loading?: boolean;
  /** Under the email field — «Este correo ya está registrado». */
  serverError?: string;
  /** Over the button: a failure no field caused. */
  formError?: string | null;
  passwordPlaceholder?: string;
  passwordAutoComplete?: 'new-password' | 'current-password';
  /** Between the fields and the button: the «o» and the platform's sign-in. */
  between?: React.ReactNode;
  /** Under the button. */
  footnote?: React.ReactNode;
};

/**
 * Email and password, for creating an account and for coming back to one.
 *
 * It fills the screen below the title: the fields at the top, the button pinned
 * at the bottom where the thumb is, as the design lays out every entry screen.
 * The submit lives here because the validation does.
 */
export function CredentialsForm({
  onSubmit,
  submitLabel,
  loading = false,
  serverError,
  formError,
  passwordPlaceholder,
  passwordAutoComplete = 'new-password',
  between,
  footnote,
}: Props) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [visible, setVisible] = useState(false);
  const passwordRef = useRef<TextInput>(null);
  const { control, handleSubmit, formState } = useForm<CredentialsValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });
  const submit = handleSubmit(onSubmit);

  return (
    <View style={{ flex: 1 }}>
      <View style={{ paddingHorizontal: 24, paddingTop: 26, gap: 12 }}>
        <Controller
          control={control}
          name="email"
          render={({ field }) => (
            <OnbField
              icon="mail"
              placeholder={t('auth.login.emailPlaceholder')}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              // An address is not a word: no red underline under «ana».
              autoCorrect={false}
              spellCheck={false}
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              value={field.value}
              onChangeText={field.onChange}
              error={
                formState.errors.email ? t('auth.login.errors.invalidEmail') : serverError
              }
            />
          )}
        />
        <Controller
          control={control}
          name="password"
          render={({ field }) => (
            <OnbField
              ref={passwordRef}
              icon="lock"
              placeholder={passwordPlaceholder ?? t('auth.register.passwordPlaceholder')}
              secureTextEntry={!visible}
              autoCapitalize="none"
              autoComplete={passwordAutoComplete}
              textContentType={
                passwordAutoComplete === 'new-password' ? 'newPassword' : 'password'
              }
              returnKeyType="go"
              onSubmitEditing={() => void submit()}
              value={field.value}
              onChangeText={field.onChange}
              error={
                formState.errors.password
                  ? t('auth.login.errors.passwordTooShort')
                  : undefined
              }
              right={
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setVisible((v) => !v)}
                  hitSlop={10}
                >
                  <Text
                    color={theme.palette.acc3}
                    style={{ fontSize: 12.5, fontWeight: '500' }}
                  >
                    {t(visible ? 'auth.register.hide' : 'auth.register.show')}
                  </Text>
                </Pressable>
              }
            />
          )}
        />
        {between}
      </View>

      <View style={{ flex: 1, minHeight: 28 }} />

      <View style={{ paddingHorizontal: 22, paddingBottom: 12 }}>
        {formError ? (
          <Text
            color={theme.colors.accentCoral}
            style={{ fontSize: 12.5, textAlign: 'center', marginBottom: 12 }}
          >
            {formError}
          </Text>
        ) : null}
        <InkButton
          label={submitLabel}
          loading={loading}
          onPress={() => void submit()}
          height={56}
        />
        {footnote}
      </View>
    </View>
  );
}
