import { router } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PanResponder, View } from 'react-native';

import { Text } from '@/shared/presentation/components';

import { CircleHero } from '../components/CircleHero';
import { DotsIndicator } from '../components/DotsIndicator';
import { OnbCTA } from '../components/OnbCTA';
import { OnbPage } from '../components/OnbPage';
import { OnbTextLink } from '../components/OnbTextLink';
import { OrbitalHero } from '../components/OrbitalHero';
import { SkipLink } from '../components/SkipLink';
import { Wordmark } from '../components/Wordmark';
import type { OnboardingScreen } from '../hooks/flowTransitions';

type Props = {
  idx: 0 | 1 | 2;
  onAdvance: (next: OnboardingScreen) => void;
};

export function WelcomeScreen({ idx, onAdvance }: Props) {
  const { t } = useTranslation();

  const titleKey = `onboarding.welcome.title${idx + 1}` as const;
  const subtitleKey = `onboarding.welcome.subtitle${idx + 1}` as const;

  const next = (): OnboardingScreen => {
    if (idx === 0) return 'welcome2';
    if (idx === 1) return 'welcome3';
    return 'name';
  };
  const prev = (): OnboardingScreen | null => {
    if (idx === 0) return null;
    if (idx === 1) return 'welcome1';
    return 'welcome2';
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          Math.abs(gesture.dx) > 18 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
        onPanResponderRelease: (_, gesture) => {
          if (Math.abs(gesture.dx) < 40) return;
          if (gesture.dx < 0) onAdvance(next());
          else {
            const back = prev();
            if (back) onAdvance(back);
          }
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [idx, onAdvance],
  );

  return (
    <OnbPage paddingTop={16} paddingHorizontal={20} paddingBottom={24}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: 2,
        }}
      >
        <Wordmark size={17} />
        <SkipLink onPress={() => onAdvance('name')} label={t('onboarding.skip')} />
      </View>

      <View
        {...panResponder.panHandlers}
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 8,
          paddingVertical: 20,
        }}
      >
        <View style={{ marginBottom: 38 }}>
          {idx === 0 ? (
            <OrbitalHero />
          ) : idx === 1 ? (
            <CircleHero icon="microphone" color="mint" />
          ) : (
            <CircleHero icon="sparkles" color="purple" />
          )}
        </View>
        <Text
          variant="display"
          style={{
            fontSize: 30,
            lineHeight: 35,
            letterSpacing: -0.9,
            textAlign: 'center',
            marginBottom: 14,
          }}
        >
          {t(titleKey)}
        </Text>
        <Text
          variant="body"
          muted
          style={{
            fontSize: 14.5,
            lineHeight: 22,
            textAlign: 'center',
            maxWidth: 280,
          }}
        >
          {t(subtitleKey)}
        </Text>
        <View style={{ marginTop: 28 }}>
          <DotsIndicator total={3} current={idx} />
        </View>
      </View>

      <View>
        <OnbCTA onPress={() => onAdvance(next())}>{t('onboarding.welcome.start')}</OnbCTA>
        <OnbTextLink
          onPress={() => router.push('/(auth)/login')}
          style={{ marginTop: 6 }}
        >
          {t('onboarding.welcome.haveAccount')}
        </OnbTextLink>
      </View>
    </OnbPage>
  );
}
