import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

import { LoginForm } from '../components/LoginForm';
import { useLogin } from '../hooks/useLogin';

export function LoginScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const login = useLogin();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
          padding: theme.spacing.xl,
          gap: theme.spacing.lg,
        },
      ]}
    >
      <View style={{ gap: theme.spacing.xs }}>
        <Text variant="title">{t('auth.login.title')}</Text>
        <Text variant="body" muted>
          {t('auth.login.subtitle')}
        </Text>
      </View>
      <LoginForm onSubmit={(values) => login.mutate(values)} loading={login.isPending} />
      {login.isError ? (
        <Text variant="caption" style={{ color: theme.colors.danger }}>
          {t('auth.login.errors.invalidCredentials')}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
});
