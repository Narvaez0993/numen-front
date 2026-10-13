import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, useWindowDimensions, View } from 'react-native';
import { useReducedMotion, useSharedValue } from 'react-native-reanimated';

import { InkButton, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

import { OnbFrame } from '../components/OnbFrame';
import { TypedGreeting } from '../components/TypedGreeting';
import { WelcomeDemo } from '../components/WelcomeDemo';
import { WelcomeOrb } from '../components/WelcomeOrb';

type Props = {
  onStart: () => void;
  onHaveAccount: () => void;
};

/**
 * «Hola. Soy Deshka.» — and then it shows what it does, instead of saying it.
 *
 * The orb speaks: the greeting types itself out, and a phrase arrives word by
 * word and becomes the movement it records, over and over — a purchase, a
 * salary, a loan. The first screen used to be a still orb over empty space
 * explaining the idea in a paragraph.
 *
 * It has to run on the cheapest phone that installs the app, so the work is
 * split by cost. Everything that moves all the time is the orb's, on the UI
 * thread, composited from cached layers (see `WelcomeOrb`). React state lives
 * in two small pieces — the greeting's letters and the demo's steps — and this
 * screen renders twice: on mount and when the greeting hands over to the demo.
 *
 * The design's button starts a first expense right here, before any account.
 * Deshka creates the account first (HU-01), so this one starts that, and the
 * first real expense comes at the end of the setup, where it can be saved.
 */
export function WelcomeScreen({ onStart, onHaveAccount }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { height } = useWindowDimensions();
  const still = useReducedMotion();
  // Short screens — most low-cost Androids, an iPhone SE or mini — get the
  // compact sizes, so the whole welcome fits without scrolling.
  const compact = height < 820;

  const talk = useSharedValue(0);
  const burst = useSharedValue(1);
  const [demoStarted, setDemoStarted] = useState(false);
  const startDemo = useCallback(() => setDemoStarted(true), []);

  return (
    <OnbFrame>
      <View style={{ height: compact ? 4 : 36 }} />
      <WelcomeOrb talk={talk} burst={burst} compact={compact} still={still} />

      <View style={{ paddingHorizontal: 30, paddingTop: compact ? 14 : 26 }}>
        <TypedGreeting
          i18nKey="onboarding.welcome.title"
          size={compact ? 30 : 33}
          onDone={startDemo}
          still={still}
        />
        <Text
          color={theme.colors.textSecondary}
          style={{
            fontSize: compact ? 14 : 15,
            lineHeight: compact ? 22 : 24,
            marginTop: compact ? 8 : 12,
          }}
        >
          {t('onboarding.welcome.body')}
        </Text>
      </View>

      {/* Allowed to shrink, and clipped if it must: on the shortest screen the
          demo loses its bottom edge before the button loses its place. */}
      <View
        style={{
          paddingHorizontal: 30,
          paddingTop: compact ? 18 : 26,
          flexShrink: 1,
          overflow: 'hidden',
        }}
      >
        <WelcomeDemo
          start={demoStarted}
          talk={talk}
          burst={burst}
          compact={compact}
          still={still}
        />
      </View>

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
