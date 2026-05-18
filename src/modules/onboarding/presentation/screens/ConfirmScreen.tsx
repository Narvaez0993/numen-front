import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, View } from 'react-native';

import { Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

import type { OnboardingExpense } from '../../domain/types/OnboardingContext';

import { ConfirmExpenseCard } from '../components/ConfirmExpenseCard';
import { DijisteCard } from '../components/DijisteCard';
import { OnbCTA } from '../components/OnbCTA';
import { OnbHeader } from '../components/OnbHeader';
import { OnbPage } from '../components/OnbPage';
import { OnbTextLink } from '../components/OnbTextLink';
import { RegisteredPill } from '../components/RegisteredPill';
import { SegmentProgress } from '../components/SegmentProgress';
import { StepIndicator } from '../components/StepIndicator';

type Props = {
  expense: OnboardingExpense;
  transcript: string;
  accountValue: string | null;
  onContinue: () => void;
};

function useStagger(delay: number) {
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const anim = Animated.timing(opacity, {
      toValue: 1,
      duration: 320,
      delay,
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
  }, [opacity, delay]);
  return opacity;
}

export function ConfirmScreen({ expense, transcript, accountValue, onContinue }: Props) {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const headlineOpacity = useStagger(80);
  const dijisteOpacity = useStagger(160);
  const expenseOpacity = useStagger(220);
  const footerOpacity = useStagger(380);

  const accountLabel = accountValue ?? t('onboarding.confirm.defaultAccount');

  return (
    <OnbPage paddingTop={14} paddingHorizontal={20} paddingBottom={24}>
      <OnbHeader center={<StepIndicator>{t('onboarding.magic.step')}</StepIndicator>} />
      <View style={{ marginTop: 14 }}>
        <SegmentProgress total={5} current={4} />
      </View>

      <View style={{ height: 22 }} />

      <RegisteredPill label={t('onboarding.confirm.pill')} />

      <View style={{ height: 16 }} />

      <Animated.View style={{ alignItems: 'center', opacity: headlineOpacity }}>
        <Text
          style={{
            fontSize: 24,
            fontFamily: 'Geist_500Medium',
            color: theme.colors.textPrimary,
            letterSpacing: -0.48,
            marginBottom: 8,
          }}
        >
          {t('onboarding.confirm.title')}
        </Text>
        <Text
          variant="body"
          muted
          style={{ fontSize: 13, lineHeight: 19, textAlign: 'center' }}
        >
          {t('onboarding.confirm.subtitle')}
        </Text>
      </Animated.View>

      <View style={{ height: 22 }} />

      <Animated.View style={{ opacity: dijisteOpacity, marginBottom: 12 }}>
        <DijisteCard label={t('onboarding.confirm.dijiste')} transcript={transcript} />
      </Animated.View>

      <Animated.View style={{ opacity: expenseOpacity }}>
        <ConfirmExpenseCard
          expense={expense}
          whenLabel={t('onboarding.confirm.when')}
          categoryLabel={t('onboarding.confirm.category')}
          accountLabel={t('onboarding.confirm.account')}
          accountValue={accountLabel}
        />
      </Animated.View>

      <View style={{ flex: 1 }} />

      <Animated.View style={{ opacity: footerOpacity }}>
        <OnbCTA onPress={onContinue}>{t('onboarding.confirm.continue')}</OnbCTA>
        <OnbTextLink onPress={onContinue} style={{ marginTop: 4 }}>
          {t('onboarding.confirm.edit')}
        </OnbTextLink>
      </Animated.View>
    </OnbPage>
  );
}
