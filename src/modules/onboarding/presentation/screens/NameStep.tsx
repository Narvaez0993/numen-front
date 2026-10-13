import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TextInput, View } from 'react-native';

import { InkButton } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { withAlpha } from '@/shared/presentation/theme/tokens';

import { OnbFrame } from '../components/OnbFrame';
import { OnbHeadline } from '../components/OnbHeadline';
import { OnbTopBar } from '../components/OnbTopBar';

type Props = {
  initialValue: string;
  onContinue: (name: string) => void;
};

/**
 * «Ahora sí: ¿cómo te llamas?» — the first thing asked once the account
 * exists, as the design draws it: the name typed big and light in its own glass
 * box, and «Mucho gusto» to answer it.
 *
 * No way back from here: the account behind it is already made.
 */
export function NameStep({ initialValue, onContinue }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [name, setName] = useState(initialValue);
  const valid = name.trim().length >= 2;

  const submit = () => {
    if (valid) onContinue(name.trim());
  };

  return (
    <OnbFrame>
      <OnbTopBar label={t('onboarding.setup.step', { step: 1 })} />
      <OnbHeadline
        size={31}
        paddingTop={38}
        i18nKey="onboarding.setup.name.title"
        body={t('onboarding.setup.name.body')}
      />

      <View style={{ paddingHorizontal: 24, paddingTop: 30 }}>
        <TextInput
          value={name}
          onChangeText={setName}
          onSubmitEditing={submit}
          autoFocus
          autoCapitalize="words"
          autoComplete="given-name"
          textContentType="givenName"
          returnKeyType="done"
          maxLength={40}
          placeholder={t('onboarding.setup.name.placeholder')}
          placeholderTextColor={theme.colors.textTertiary}
          selectionColor={theme.palette.acc2}
          accessibilityLabel={t('onboarding.setup.name.placeholder')}
          style={{
            minHeight: 68,
            paddingHorizontal: 18,
            paddingVertical: 16,
            borderRadius: 20,
            backgroundColor: theme.colors.bgSurface,
            borderWidth: 1,
            borderColor: withAlpha(theme.palette.acc, 0.34),
            fontSize: 22,
            fontFamily: 'Geist_300Light',
            color: theme.colors.textPrimary,
          }}
        />
      </View>

      <View style={{ flex: 1, minHeight: 24 }} />

      <View style={{ paddingHorizontal: 22, paddingBottom: 12 }}>
        <InkButton
          label={t('onboarding.setup.name.submit')}
          onPress={submit}
          disabled={!valid}
          height={56}
        />
      </View>
    </OnbFrame>
  );
}
