import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

import type { OnboardingExpense } from '../../domain/types/OnboardingContext';

import { ExampleCard } from '../components/ExampleCard';
import { MicHero, type MicState } from '../components/MicHero';
import { OnbHeader } from '../components/OnbHeader';
import { OnbPage } from '../components/OnbPage';
import { OnbTextLink } from '../components/OnbTextLink';
import { SegmentProgress } from '../components/SegmentProgress';
import { SkipLink } from '../components/SkipLink';
import { StepIndicator } from '../components/StepIndicator';

type Props = {
  onDetected: (params: { transcript: string; expense: OnboardingExpense }) => void;
  onSkip: () => void;
};

const DEFAULT_TRANSCRIPT = 'Café tres mil quinientos';
const DEFAULT_EXPENSE: OnboardingExpense = {
  desc: 'Café',
  cat: 'Café',
  icon: 'coffee',
  color: 'amber',
  amount: 3500,
};

export function MagicMomentScreen({ onDetected, onSkip }: Props) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [state, setState] = useState<MicState>('idle');
  const holdRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (state === 'processing') {
      const tid = setTimeout(() => {
        onDetected({ transcript: DEFAULT_TRANSCRIPT, expense: DEFAULT_EXPENSE });
      }, 1500);
      return () => clearTimeout(tid);
    }
  }, [state, onDetected]);

  const onMicPress = () => {
    if (state === 'idle') {
      setState('recording');
      holdRef.current = setTimeout(() => setState('processing'), 1600);
    } else if (state === 'recording') {
      if (holdRef.current) clearTimeout(holdRef.current);
      setState('processing');
    }
  };

  const recording = state === 'recording';
  const processing = state === 'processing';
  const interacting = recording || processing;

  return (
    <OnbPage paddingTop={14} paddingHorizontal={20} paddingBottom={20}>
      <OnbHeader
        center={<StepIndicator>{t('onboarding.magic.step')}</StepIndicator>}
        trailing={
          !interacting && <SkipLink onPress={onSkip} label={t('onboarding.skip')} />
        }
      />
      <View style={{ marginTop: 14 }}>
        <SegmentProgress total={5} current={4} />
      </View>

      <View style={{ height: 22 }} />

      <Text
        style={{
          fontSize: 24,
          fontFamily: 'Geist_500Medium',
          color: theme.colors.textPrimary,
          letterSpacing: -0.48,
          textAlign: 'center',
          marginBottom: 10,
        }}
      >
        {t('onboarding.magic.title')}
      </Text>
      <Text
        variant="body"
        muted
        style={{
          fontSize: 13.5,
          lineHeight: 20,
          textAlign: 'center',
          alignSelf: 'center',
          maxWidth: 280,
        }}
      >
        {t('onboarding.magic.subtitle')}
      </Text>

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ marginBottom: 12 }}>
          <MicHero state={state} onPress={onMicPress} />
        </View>

        <View style={{ minHeight: 18, marginTop: 4, marginBottom: 18 }}>
          <Text
            variant="caption"
            style={{
              fontSize: 12.5,
              fontFamily: 'Geist_500Medium',
              color: recording ? theme.colors.accentCoral : theme.colors.textTertiary,
            }}
          >
            {recording
              ? t('onboarding.magic.recording')
              : processing
                ? t('onboarding.magic.processing')
                : ''}
          </Text>
        </View>

        <View style={{ width: '100%', maxWidth: 320, alignSelf: 'center' }}>
          <ExampleCard
            label={t('onboarding.magic.exampleLabel')}
            example={t('onboarding.magic.example')}
            faded={interacting}
          />
        </View>
      </View>

      <OnbTextLink
        onPress={onSkip}
        style={{
          opacity: interacting ? 0.3 : 1,
        }}
      >
        {t('onboarding.magic.preferText')}
      </OnbTextLink>
    </OnbPage>
  );
}
