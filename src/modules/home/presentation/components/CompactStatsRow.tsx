import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Icon, type IconName, Text } from '@/shared/presentation/components';
import { formatCOP } from '@/shared/presentation/utils/formatCOP';
import type { AccentColor } from '@/shared/domain';
import { accentColorKey, useTheme } from '@/shared/presentation/theme';

import type { MonthProgress, Saldo } from '../../domain/types/HomeOverview';
import type { HeroVariant } from '../stores/useHeroVariantStore';

type CardProps = {
  icon: IconName;
  color: AccentColor;
  label: string;
  value: string;
  onPress?: () => void;
};

function CompactStatCard({ icon, color, label, value, onPress }: CardProps) {
  const { theme } = useTheme();
  const iconBg = theme.colors[accentColorKey(color, 'bg')];
  const iconFg = theme.colors[accentColorKey(color, 'fg')];

  const content = (
    <>
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 10,
          backgroundColor: iconBg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name={icon} size={15} color={iconFg} stroke={1.9} />
      </View>
      <View>
        <Text
          variant="micro"
          muted
          uppercase
          numberOfLines={1}
          style={{ fontSize: 10, letterSpacing: 0.8, marginBottom: 4 }}
        >
          {label}
        </Text>
        <Text
          variant="h1"
          tabular
          numberOfLines={1}
          style={{ fontSize: 15, letterSpacing: -0.15 }}
        >
          {value}
        </Text>
      </View>
    </>
  );

  const baseStyle = {
    backgroundColor: theme.colors.bgSurface,
    borderColor: theme.colors.borderSubtle,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    gap: 12,
  } as const;

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => ({ ...baseStyle, opacity: pressed ? 0.85 : 1 })}
      >
        {content}
      </Pressable>
    );
  }
  return <View style={baseStyle}>{content}</View>;
}

type Props = {
  saldo: Saldo;
  month: MonthProgress;
  heroVariant: HeroVariant;
  onOpenMovimientos?: () => void;
  onOpenAccounts?: () => void;
};

export function CompactStatsRow({
  saldo,
  month,
  heroVariant,
  onOpenMovimientos,
  onOpenAccounts,
}: Props) {
  const { t } = useTranslation();
  const showSaldo = heroVariant !== 'saldo';

  return (
    <View style={{ flexDirection: 'row', gap: 10 }}>
      {showSaldo ? (
        <View style={{ flex: 1, minWidth: 0 }}>
          <CompactStatCard
            icon="building-bank"
            color="purple"
            label={t('home.saldo.label')}
            value={formatCOP(saldo.net)}
            onPress={onOpenAccounts}
          />
        </View>
      ) : null}
      <View style={{ flex: 1, minWidth: 0 }}>
        <CompactStatCard
          icon="arrow-up-right"
          color="coral"
          label={t('home.gastado.short')}
          value={formatCOP(month.spent)}
          onPress={onOpenMovimientos}
        />
      </View>
    </View>
  );
}
