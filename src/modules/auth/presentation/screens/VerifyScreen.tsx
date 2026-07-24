import { Trans, useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

import type { AuthSessionDTO } from '../../application';
import { VerifyCodeForm } from '../components/VerifyCodeForm';

type Props = {
  email: string;
  onVerified: (session: AuthSessionDTO) => void;
};

/** Standalone verify screen for the `(auth)/verify` route. */
export function VerifyScreen({ email, onVerified }: Props) {
  const { t } = useTranslation();
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.bgBase,
          padding: theme.spacing.xl,
          gap: theme.spacing.lg,
        },
      ]}
    >
      <View style={{ gap: theme.spacing.xs }}>
        <Text variant="h1">{t('auth.verify.title')}</Text>
        <Text variant="body" muted>
          <Trans
            i18nKey="auth.verify.subtitle"
            values={{ email }}
            components={{
              b: <Text variant="body" style={{ color: theme.colors.textPrimary }} />,
            }}
          />
        </Text>
      </View>
      <VerifyCodeForm email={email} onVerified={onVerified} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
});
