import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { z } from 'zod';

import { Button, Input, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export type CredentialsValues = z.infer<typeof schema>;

type Props = {
  onSubmit: (values: CredentialsValues) => void;
  submitLabel: string;
  submittingLabel: string;
  loading?: boolean;
  serverError?: string;
  passwordPlaceholder?: string;
  passwordAutoComplete?: 'new-password' | 'current-password';
};

/**
 * Email + password form used for account creation and login. Includes a
 * show/hide password toggle and a slot for a server-side error.
 */
export function CredentialsForm({
  onSubmit,
  submitLabel,
  submittingLabel,
  loading,
  serverError,
  passwordPlaceholder,
  passwordAutoComplete = 'new-password',
}: Props) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [visible, setVisible] = useState(false);
  const { control, handleSubmit, formState } = useForm<CredentialsValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  return (
    <View style={styles.container}>
      <View style={{ gap: 18 }}>
        <Controller
          control={control}
          name="email"
          render={({ field }) => (
            <Input
              label={t('auth.login.emailLabel')}
              placeholder={t('auth.login.emailPlaceholder')}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              // An address is not a word: no red underline under «ana».
              autoCorrect={false}
              spellCheck={false}
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
            <View>
              <Input
                label={t('auth.login.passwordLabel')}
                placeholder={
                  passwordPlaceholder ?? t('auth.register.passwordPlaceholder')
                }
                secureTextEntry={!visible}
                autoCapitalize="none"
                autoComplete={passwordAutoComplete}
                value={field.value}
                onChangeText={field.onChange}
                style={{ paddingRight: 74 }}
                error={
                  formState.errors.password
                    ? t('auth.login.errors.passwordTooShort')
                    : undefined
                }
              />
              <Pressable
                onPress={() => setVisible((v) => !v)}
                hitSlop={8}
                style={styles.toggle}
              >
                <Text variant="caption" style={{ color: theme.colors.accentMint }}>
                  {t(visible ? 'auth.register.hide' : 'auth.register.show')}
                </Text>
              </Pressable>
            </View>
          )}
        />
      </View>
      <View style={{ marginTop: 34 }}>
        <Button
          label={loading ? submittingLabel : submitLabel}
          loading={loading}
          full
          onPress={handleSubmit(onSubmit)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  toggle: {
    position: 'absolute',
    right: 14,
    top: 38,
  },
});
