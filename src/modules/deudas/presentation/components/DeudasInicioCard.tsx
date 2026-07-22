import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Card, Icon, IconBox, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

import { totalsByDirection } from '../../domain/types/Deuda';
import { useDeudasStore } from '../stores/useDeudasStore';

type Props = { onPress: () => void };

export function DeudasInicioCard({ onPress }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const today = useDeudasStore((s) => s.today);
  const allDebts = useDeudasStore((s) => s.debts);

  const totals = useMemo(() => totalsByDirection(allDebts, today), [allDebts, today]);
  if (totals.incoming === 0 && totals.outgoing === 0) return null;

  const showSep = totals.incoming > 0 && totals.outgoing > 0;

  return (
    <Card padding={14} onPress={onPress}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <IconBox name="users" color="purple" size={36} iconSize={17} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text
            variant="bodyLarge"
            style={{ fontSize: 13.5, letterSpacing: -0.135, marginBottom: 4 }}
          >
            {t('deudas.inicioCard.title')}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              alignItems: 'baseline',
              gap: 6,
            }}
          >
            {totals.incoming > 0 ? (
              <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                <Text
                  variant="caption"
                  color={theme.colors.accentMint}
                  tabular
                  style={{ fontSize: 11.5, fontFamily: 'Geist_500Medium' }}
                >
                  {formatMoney(totals.incoming)}
                </Text>
                <Text
                  variant="caption"
                  color={theme.colors.textTertiary}
                  style={{ fontSize: 11.5 }}
                >
                  {' '}
                  {t('deudas.inicioCard.owedToMe')}
                </Text>
              </View>
            ) : null}
            {showSep ? (
              <Text
                variant="caption"
                color={theme.colors.textTertiary}
                style={{ fontSize: 11.5 }}
              >
                ·
              </Text>
            ) : null}
            {totals.outgoing > 0 ? (
              <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                <Text
                  variant="caption"
                  color={theme.colors.accentAmber}
                  tabular
                  style={{ fontSize: 11.5, fontFamily: 'Geist_500Medium' }}
                >
                  {formatMoney(totals.outgoing)}
                </Text>
                <Text
                  variant="caption"
                  color={theme.colors.textTertiary}
                  style={{ fontSize: 11.5 }}
                >
                  {' '}
                  {t('deudas.inicioCard.iOwe')}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
        <Icon name="chevron-right" size={16} color={theme.colors.textTertiary} />
      </View>
    </Card>
  );
}
