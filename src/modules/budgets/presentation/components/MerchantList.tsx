import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Icon, Text } from '@/shared/presentation/components';
import { AccentColor, accentColorKey, useTheme } from '@/shared/presentation/theme';
import { formatCOP } from '@/shared/presentation/utils/formatCOP';

import type { MerchantStat } from '../../domain/types/Budget';

type Props = {
  merchants: MerchantStat[];
  color: AccentColor;
};

export function MerchantList({ merchants, color }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const dotColor = theme.colors[accentColorKey(color, 'fg')];

  return (
    <View
      style={{
        borderTopColor: theme.colors.borderSubtle,
        borderTopWidth: 1,
        paddingTop: 12,
      }}
    >
      <Text
        variant="micro"
        muted
        uppercase
        style={{ marginBottom: 10, letterSpacing: 1.05 }}
      >
        {t('budgets.topMerchants')}
      </Text>
      <View style={{ gap: 8 }}>
        {merchants.map((m, i) => (
          <View
            key={`${m.description}-${i}`}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              paddingVertical: 6,
            }}
          >
            <View
              style={{
                width: 4,
                height: 4,
                borderRadius: 2,
                backgroundColor: dotColor,
              }}
            />
            <Text
              variant="label"
              style={{ flex: 1, minWidth: 0, fontSize: 12.5 }}
              numberOfLines={1}
            >
              {m.description}
            </Text>
            <Text variant="caption" muted tabular style={{ fontSize: 11 }}>
              {m.count}×
            </Text>
            <Text
              variant="label"
              color={theme.colors.textSecondary}
              tabular
              style={{ fontSize: 12.5, minWidth: 70, textAlign: 'right' }}
            >
              {formatCOP(m.amount)}
            </Text>
          </View>
        ))}
      </View>

      <Pressable
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          alignSelf: 'flex-start',
          marginTop: 10,
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 10,
          backgroundColor: theme.colors.bgFloat,
          borderColor: theme.colors.borderSubtle,
          borderWidth: 1,
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <Text
          variant="label"
          color={theme.colors.textSecondary}
          style={{ fontSize: 11.5 }}
        >
          {t('budgets.viewAll')}
        </Text>
        <Icon name="chevron-right" size={11} color={theme.colors.textSecondary} />
      </Pressable>
    </View>
  );
}
