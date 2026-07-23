import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Pill } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

import type { BillingPeriod } from '../../domain';

import { PeriodTab } from './PeriodTab';

type Props = {
  value: BillingPeriod;
  onChange: (period: BillingPeriod) => void;
};

export function PeriodToggle({ value, onChange }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: theme.colors.bgSurface,
        borderColor: theme.colors.borderSubtle,
        borderWidth: 1,
        borderRadius: 12,
        padding: 4,
        marginBottom: 18,
      }}
    >
      <PeriodTab
        label={t('plan.period.mensual')}
        active={value === 'mensual'}
        onPress={() => onChange('mensual')}
      />
      <PeriodTab
        label={t('plan.period.anual')}
        active={value === 'anual'}
        onPress={() => onChange('anual')}
        extra={
          <Pill variant="mint" style={{ paddingHorizontal: 6, paddingVertical: 2 }}>
            {t('plan.period.savings')}
          </Pill>
        }
      />
    </View>
  );
}
