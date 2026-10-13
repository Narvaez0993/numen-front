import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { DashedButton, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

type Props = {
  onCreate: () => void;
};

/**
 * Presupuesto before there is one.
 *
 * It was the last screen in the app still wearing the old skin — a dashed card
 * with a 64px mint target inside it and a filled green button. It survived the
 * redesign by being invisible: it only renders on an account with no cap at all,
 * and no testing session ever got back to that state.
 *
 * Now it says the same thing in the shape the rest of the app uses: the sentence
 * left-aligned with everything else, and the dashed button doing the asking. The
 * illustration is gone on purpose — a target icon says nothing that the two lines
 * under it do not already say better.
 */
export function EmptyState({ onCreate }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={{ paddingTop: 12 }}>
      <Text
        style={{
          fontSize: 19,
          fontWeight: '300',
          letterSpacing: -0.4,
          marginBottom: 8,
        }}
      >
        {t('budgets.emptyA.title')}
      </Text>
      <Text
        color={theme.colors.textTertiary}
        style={{ fontSize: 12.5, lineHeight: 20, marginBottom: 22 }}
      >
        {t('budgets.emptyA.body')}
      </Text>
      <DashedButton label={t('budgets.emptyA.cta')} onPress={onCreate} />
    </View>
  );
}
