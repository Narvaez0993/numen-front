import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { z } from 'zod';

import { Button, Input } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  onSubmit: (values: FormValues) => void;
  loading?: boolean;
};

export function LoginForm({ onSubmit, loading }: Props) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { control, handleSubmit, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  return (
    <View style={[styles.container, { gap: theme.spacing.md }]}>
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
            value={field.value}
            onChangeText={field.onChange}
            error={
              formState.errors.email ? t('auth.login.errors.invalidEmail') : undefined
            }
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field }) => (
          <Input
            label={t('auth.login.passwordLabel')}
            placeholder={t('auth.login.passwordPlaceholder')}
            secureTextEntry
            value={field.value}
            onChangeText={field.onChange}
            error={
              formState.errors.password
                ? t('auth.login.errors.passwordTooShort')
                : undefined
            }
          />
        )}
      />
      <Button
        label={loading ? t('auth.login.submitting') : t('auth.login.submit')}
        loading={loading}
        onPress={handleSubmit(onSubmit)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});
