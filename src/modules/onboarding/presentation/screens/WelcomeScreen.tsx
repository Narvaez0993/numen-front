import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { InkButton, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

import { OnbFrame } from '../components/OnbFrame';
import { OnbHeadline } from '../components/OnbHeadline';
import { WelcomeOrb } from '../components/WelcomeOrb';

type Props = {
  onStart: () => void;
  onHaveAccount: () => void;
};

/**
 * «Hola. Soy Deshka.» — one screen, where there used to be a three-slide
 * carousel selling features.
 *
 * The design opens on the orb because the orb is the product: the same sphere
 * is the button that records every movement. It also opens with a voice rather
 * than a pitch — the app introduces itself and says what it will do, in one
 * line, and the button does the rest.
 *
 * The design's button starts a first expense right here, before any account.
 * Deshka creates the account first (HU-01), so this one starts that, and the
 * first expense comes at the end of the setup, where it can really be saved.
 */
export function WelcomeScreen({ onStart, onHaveAccount }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <OnbFrame>
      <View style={{ height: 52 }} />
      <WelcomeOrb />

      <OnbHeadline
        size={33}
        paddingTop={40}
        i18nKey="onboarding.welcome.title"
        body={t('onboarding.welcome.body')}
      />

      <View style={{ flex: 1 }} />

      <View style={{ paddingHorizontal: 22, paddingBottom: 8 }}>
        <InkButton label={t('onboarding.welcome.start')} onPress={onStart} height={56} />
        <Pressable
          accessibilityRole="button"
          onPress={onHaveAccount}
          style={({ pressed }) => ({
            minHeight: 48,
            marginTop: 4,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text color={theme.colors.textSecondary} style={{ fontSize: 13 }}>
            {t('onboarding.welcome.haveAccount')}
          </Text>
        </Pressable>
      </View>
    </OnbFrame>
  );
}
