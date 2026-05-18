import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Icon, IconBox, ProgressBar, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { formatCOP } from '@/shared/presentation/utils/formatCOP';

import type { CategoryBudget } from '../../domain/types/Budget';

import { MerchantList } from './MerchantList';

type Props = {
  category: CategoryBudget;
  expanded: boolean;
  onToggle: () => void;
};

export function CategoryItem({ category, expanded, onToggle }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const pct = category.spent / category.target;
  const pctLabel = Math.round(pct * 100);
  const remaining = category.target - category.spent;

  return (
    <View
      style={{
        backgroundColor: theme.colors.bgSurface,
        borderColor: theme.colors.borderSubtle,
        borderWidth: 1,
        borderRadius: 16,
        overflow: 'hidden',
      }}
    >
      <Pressable
        onPress={onToggle}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          padding: 14,
          opacity: pressed ? 0.92 : 1,
        })}
      >
        <IconBox
          name={category.iconName}
          color={category.color}
          size={36}
          iconSize={17}
        />
        <View style={{ flex: 1, minWidth: 0 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              gap: 8,
              marginBottom: 6,
            }}
          >
            <Text variant="bodyLarge" numberOfLines={1} style={{ flex: 1, minWidth: 0 }}>
              {category.name}
            </Text>
            <Text
              variant="body"
              color={theme.colors.textSecondary}
              tabular
              style={{ fontWeight: '500', fontSize: 12.5 }}
            >
              {formatCOP(category.spent)}
              <Text variant="body" muted style={{ fontSize: 12.5 }}>
                {' '}
                / {formatCOP(category.target)}
              </Text>
            </Text>
          </View>
          <ProgressBar pct={pct} height={6} />
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 6,
            }}
          >
            <Text variant="caption" muted tabular style={{ fontSize: 11 }}>
              {pctLabel}% {t('budgets.used')}
            </Text>
            <Text variant="caption" muted tabular style={{ fontSize: 11 }}>
              {remaining >= 0
                ? t('budgets.remaining', { amount: formatCOP(remaining) })
                : t('budgets.over', { amount: formatCOP(Math.abs(remaining)) })}
            </Text>
          </View>
        </View>
        <View
          style={{
            transform: [{ rotate: expanded ? '180deg' : '0deg' }],
          }}
        >
          <Icon name="chevron-down" size={16} color={theme.colors.textTertiary} />
        </View>
      </Pressable>

      {expanded ? (
        <View style={{ paddingHorizontal: 14, paddingBottom: 14 }}>
          <MerchantList merchants={category.topMerchants} color={category.color} />
        </View>
      ) : null}
    </View>
  );
}
