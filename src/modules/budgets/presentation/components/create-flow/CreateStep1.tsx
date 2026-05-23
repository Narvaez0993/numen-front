import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

import { BUDGET_TECHO_PRESETS } from '../../constants/presets';
import { BudgetInputHero } from '../BudgetInputHero';

type Props = {
  techo: number;
  onChange: (value: number) => void;
  monthName?: string;
};

export function CreateStep1({ techo, onChange, monthName = 'mayo' }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  return (
    <View style={{ gap: 14 }}>
      <Text
        variant="display"
        style={{ fontSize: 26, letterSpacing: -0.65, lineHeight: 32 }}
      >
        {t('budgets.create.step1.title', { month: monthName })}
      </Text>
      <Text
        variant="body"
        color={theme.colors.textSecondary}
        style={{ fontSize: 14, lineHeight: 21 }}
      >
        {t('budgets.create.step1.subtitle')}
      </Text>

      <View style={{ marginTop: 14 }}>
        <BudgetInputHero
          value={techo}
          onChange={onChange}
          presets={BUDGET_TECHO_PRESETS}
          size="large"
        />
      </View>

      <Text
        variant="caption"
        color={theme.colors.textTertiary}
        style={{ fontSize: 12, textAlign: 'center', marginTop: 4 }}
      >
        {t('budgets.create.step1.helper')}
      </Text>
    </View>
  );
}
