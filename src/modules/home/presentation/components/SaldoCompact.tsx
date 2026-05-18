import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Card, Chip, IconBox, Text } from '@/shared/presentation/components';
import { formatCOP } from '@/shared/presentation/utils/formatCOP';

import type { Saldo } from '../../domain/types/HomeOverview';

type Props = { saldo: Saldo; onPress?: () => void };

export function SaldoCompact({ saldo, onPress }: Props) {
  const { t } = useTranslation();
  return (
    <Card padding={14} onPress={onPress}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <IconBox name="building-bank" color="purple" size={36} iconSize={17} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text variant="micro" muted uppercase style={{ marginBottom: 2 }}>
            {t('home.saldo.label')}
          </Text>
          <Text variant="h1" tabular style={{ fontSize: 17, letterSpacing: -0.17 }}>
            {formatCOP(saldo.net)}
          </Text>
        </View>
        <Chip>{t('home.saldo.viewAccounts')}</Chip>
      </View>
    </Card>
  );
}
