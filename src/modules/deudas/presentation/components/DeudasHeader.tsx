import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Icon, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

import { totalsByDirection } from '../../domain/types/Deuda';
import { useDeudasStore } from '../stores/useDeudasStore';

type Props = {
  onBack?: () => void;
  onProfile?: () => void;
  initials?: string;
};

export function DeudasHeader({ onBack, onProfile, initials = 'SM' }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const today = useDeudasStore((s) => s.today);
  const allDebts = useDeudasStore((s) => s.debts);

  const totals = useMemo(() => totalsByDirection(allDebts, today), [allDebts, today]);

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        paddingHorizontal: 4,
        paddingTop: 4,
        gap: 10,
      }}
    >
      {onBack ? (
        <Pressable
          onPress={onBack}
          hitSlop={6}
          style={({ pressed }) => ({
            width: 38,
            height: 38,
            borderRadius: 12,
            backgroundColor: theme.colors.bgSurface,
            borderWidth: 1,
            borderColor: theme.colors.borderSubtle,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 6,
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <Icon
            name="arrow-left"
            size={17}
            stroke={1.9}
            color={theme.colors.textSecondary}
          />
        </Pressable>
      ) : null}

      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontSize: 26, fontWeight: '500', letterSpacing: -0.65 }}>
          {t('deudas.title')}
        </Text>
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'baseline',
            marginTop: 6,
            gap: 6,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
            <Text
              tabular
              color={theme.colors.accentMint}
              style={{ fontSize: 12.5, fontFamily: 'Geist_500Medium' }}
            >
              {formatMoney(totals.incoming)}
            </Text>
            <Text color={theme.colors.textSecondary} style={{ fontSize: 12.5 }}>
              {' '}
              {t('deudas.summary.owedToMe')}
            </Text>
          </View>
          <Text color={theme.colors.textTertiary} style={{ fontSize: 12.5 }}>
            ·
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
            <Text
              tabular
              color={theme.colors.accentAmber}
              style={{ fontSize: 12.5, fontFamily: 'Geist_500Medium' }}
            >
              {formatMoney(totals.outgoing)}
            </Text>
            <Text color={theme.colors.textSecondary} style={{ fontSize: 12.5 }}>
              {' '}
              {t('deudas.summary.iOwe')}
            </Text>
          </View>
        </View>
      </View>

      {onProfile ? (
        <Pressable
          onPress={onProfile}
          style={({ pressed }) => ({
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: theme.colors.accentMintBg,
            borderColor: theme.colors.borderSubtle,
            borderWidth: 1,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 4,
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <Text
            variant="label"
            color={theme.colors.accentMint}
            style={{ fontSize: 12.5 }}
          >
            {initials}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
