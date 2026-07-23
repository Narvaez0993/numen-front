import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TextInput, View } from 'react-native';

import { Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

import { OnbCTA } from '../components/OnbCTA';
import { OnbHeader } from '../components/OnbHeader';
import { OnbPage } from '../components/OnbPage';
import { SegmentProgress } from '../components/SegmentProgress';
import { StepIndicator } from '../components/StepIndicator';

type Props = {
  initialValue: string;
  onBack: () => void;
  onContinue: (name: string) => void;
};

export function PersoNameScreen({ initialValue, onBack, onContinue }: Props) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [name, setName] = useState(initialValue);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const tid = setTimeout(() => inputRef.current?.focus(), 200);
    return () => clearTimeout(tid);
  }, []);

  const valid = name.trim().length >= 2;
  const handleNext = () => {
    if (!valid) return;
    onContinue(name.trim());
  };

  return (
    <OnbPage paddingTop={14} paddingHorizontal={20} paddingBottom={24}>
      <OnbHeader
        onBack={onBack}
        center={<StepIndicator>{t('onboarding.perso.step1')}</StepIndicator>}
      />
      <View style={{ marginTop: 14 }}>
        <SegmentProgress total={2} current={0} />
      </View>

      <View style={{ height: 36 }} />

      <Text
        style={{
          fontSize: 26,
          fontFamily: 'Geist_500Medium',
          color: theme.colors.textPrimary,
          letterSpacing: -0.52,
          marginBottom: 8,
        }}
      >
        {t('onboarding.perso.name.title')}
      </Text>
      <Text variant="body" muted style={{ fontSize: 14, lineHeight: 20 }}>
        {t('onboarding.perso.name.subtitle')}
      </Text>

      <View style={{ height: 32 }} />

      <TextInput
        ref={inputRef}
        value={name}
        onChangeText={setName}
        onSubmitEditing={handleNext}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={t('onboarding.perso.name.placeholder')}
        placeholderTextColor={theme.colors.textTertiary}
        autoCapitalize="words"
        returnKeyType="done"
        style={{
          width: '100%',
          backgroundColor: theme.colors.bgSurface,
          color: theme.colors.textPrimary,
          borderWidth: 1,
          borderColor: focused ? theme.colors.accentMint : theme.colors.borderSubtle,
          borderRadius: 14,
          paddingHorizontal: 16,
          paddingVertical: 16,
          fontSize: 17,
          fontFamily: 'Geist_400Regular',
        }}
      />

      <View style={{ flex: 1 }} />

      <OnbCTA disabled={!valid} onPress={handleNext}>
        {t('onboarding.perso.continue')}
      </OnbCTA>
    </OnbPage>
  );
}
