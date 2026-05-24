import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Card, Chip, IconBox, Text } from '@/shared/presentation/components';
import { formatCOP } from '@/shared/presentation/utils/formatCOP';

import type { MonthProgress } from '../../domain/types/HomeOverview';

type Props = { month: MonthProgress; onPress?: () => void };

export function MesGastadoCompact({ month, onPress }: Props) {
  const { t } = useTranslation();
  return (
    <Card padding={14} onPress={onPress}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <IconBox name="arrow-up-right" color="coral" size={36} iconSize={17} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text variant="micro" muted uppercase style={{ marginBottom: 2 }}>
            {t('home.gastado.label')}
          </Text>
          <Text variant="h1" tabular style={{ fontSize: 17, letterSpacing: -0.17 }}>
            {formatCOP(month.spent)}
          </Text>
        </View>
        <Chip>{t('home.gastado.viewExpenses')}</Chip>
      </View>
    </Card>
  );
}
