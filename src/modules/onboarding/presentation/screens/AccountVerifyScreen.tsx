import { Trans, useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { VerifyCodeForm } from '@/modules/auth/presentation';
import { Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

import { OnbHeader } from '../components/OnbHeader';
import { OnbPage } from '../components/OnbPage';
import { Wordmark } from '../components/Wordmark';

type Props = {
  email: string;
  onBack: () => void;
  onVerified: () => void;
};

export function AccountVerifyScreen({ email, onBack, onVerified }: Props) {
  const { t } = useTranslation();
  const { theme } = useTheme();

  return (
    <OnbPage paddingTop={14} paddingHorizontal={22} paddingBottom={24}>
      <OnbHeader onBack={onBack} />

      <View style={{ height: 18 }} />
      <View style={{ alignItems: 'center', marginBottom: 26 }}>
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
          {t('auth.verify.title')}
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
          <Trans
            i18nKey="auth.verify.subtitle"
            values={{ email }}
            components={{
              b: (
                <Text
                  style={{
                    color: theme.colors.textPrimary,
                    fontFamily: 'Geist_500Medium',
                  }}
                />
              ),
            }}
          />
        </Text>
      </View>

      <View style={{ height: 40 }} />

      <VerifyCodeForm email={email} onVerified={onVerified} />

      <View style={{ flex: 1 }} />
    </OnbPage>
  );
}
