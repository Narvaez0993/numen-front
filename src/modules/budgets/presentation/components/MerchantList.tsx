import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Text } from '@/shared/presentation/components';
import { AccentColor, accentColorKey, useTheme } from '@/shared/presentation/theme';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

import type { Merchant } from '../../domain';

type Props = {
  merchants: Merchant[];
  color: AccentColor;
};

export function MerchantList({ merchants, color }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const dotColor = theme.colors[accentColorKey(color, 'fg')];

  return (
    <View>
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
            key={`${m.label}-${i}`}
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
              {m.label}
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
              {formatMoney(m.spent)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
