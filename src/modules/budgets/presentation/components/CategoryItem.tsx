import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Icon, IconBox, ProgressBar, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

import type { WatchedCategory } from '../hooks/useWatchedCategories';

import { MerchantList } from './MerchantList';

type Props = {
  category: WatchedCategory;
  expanded: boolean;
  onToggle: () => void;
  onEdit?: () => void;
  onViewAll?: () => void;
};

/** Every figure comes measured from the server: this row divides nothing. */
export function CategoryItem({ category, expanded, onToggle, onEdit, onViewAll }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const pctLabel = Math.round(category.used * 100);

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
        <IconBox name={category.icon} color={category.color} size={36} iconSize={17} />
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
              {formatMoney(category.spent)}
              <Text variant="body" muted style={{ fontSize: 12.5 }}>
                {' '}
                / {formatMoney(category.target)}
              </Text>
            </Text>
          </View>
          <ProgressBar pct={category.used} height={6} />
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
              {category.remaining >= 0
                ? t('budgets.remaining', { amount: formatMoney(category.remaining) })
                : t('budgets.over', {
                    amount: formatMoney(Math.abs(category.remaining)),
                  })}
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
          <View
            style={{
              borderTopWidth: 1,
              borderTopColor: theme.colors.borderSubtle,
              paddingTop: 12,
            }}
          >
            <MerchantList merchants={category.topMerchants} color={category.color} />
            {(onEdit || onViewAll) && (
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                {onEdit && (
                  <Pressable
                    onPress={onEdit}
                    style={({ pressed }) => ({
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 10,
                      backgroundColor: theme.colors.accentMintBg,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                      opacity: pressed ? 0.85 : 1,
                    })}
                  >
                    <Icon
                      name="pencil"
                      size={11}
                      color={theme.colors.accentMint}
                      stroke={2}
                    />
                    <Text
                      variant="label"
                      color={theme.colors.accentMint}
                      style={{ fontSize: 11.5 }}
                    >
                      {t('budgets.editTope')}
                    </Text>
                  </Pressable>
                )}
                {onViewAll && (
                  <Pressable
                    onPress={onViewAll}
                    style={({ pressed }) => ({
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 10,
                      backgroundColor: theme.colors.bgFloat,
                      borderWidth: 1,
                      borderColor: theme.colors.borderSubtle,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
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
                    <Icon
                      name="chevron-right"
                      size={11}
                      color={theme.colors.textSecondary}
                    />
                  </Pressable>
                )}
              </View>
            )}
          </View>
        </View>
      ) : null}
    </View>
  );
}
