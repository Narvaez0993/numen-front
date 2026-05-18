import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Icon, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { formatCOP } from '@/shared/presentation/utils/formatCOP';

import type { BudgetProjection } from '../../domain/types/Budget';

type Props = { projection: BudgetProjection };

export function ProjectionCallout({ projection }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <View
      style={{
        flexDirection: 'row',
        gap: 12,
        backgroundColor: theme.colors.accentAmberBg,
        borderColor: 'rgba(255, 181, 71, 0.18)',
        borderWidth: 1,
        borderRadius: 16,
        padding: 14,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: theme.colors.accentAmber,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name="alert-triangle" size={18} color={theme.colors.bgBase} stroke={1.9} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text variant="label" style={{ fontSize: 12.5, marginBottom: 2 }}>
          {t('budgets.projection.willEnd')}{' '}
          <Text
            variant="label"
            color={theme.colors.accentAmber}
            tabular
            style={{ fontSize: 12.5 }}
          >
            {formatCOP(projection.willEnd)}
          </Text>
        </Text>
        <Text
          variant="caption"
          color={theme.colors.textSecondary}
          style={{ fontSize: 11.5 }}
        >
          <Text variant="caption" tabular style={{ fontWeight: '500', fontSize: 11.5 }}>
            {formatCOP(projection.over)}
          </Text>{' '}
          {t('budgets.projection.over')}
        </Text>
      </View>
    </View>
  );
}
