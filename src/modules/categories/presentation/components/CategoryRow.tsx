import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Icon, Text } from '@/shared/presentation/components';
import { accentColorKey, useTheme } from '@/shared/presentation/theme';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

import type { CategoryWithSpend } from '../utils/joinCategorySpend';

type Props = {
  /** Carries the spend of the period being shown, joined by the screen. */
  category: CategoryWithSpend;
  last?: boolean;
  /** When provided the row is tappable (custom categories); omit for read-only. */
  onPress?: () => void;
};

export function CategoryRow({ category, last = false, onPress }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const inactive = category.count === 0;

  const tone = category.color;
  const iconBg =
    tone === 'neutral'
      ? 'rgba(168, 178, 200, 0.12)'
      : theme.colors[accentColorKey(tone, 'bg')];
  const iconFg =
    tone === 'neutral'
      ? theme.colors.textSecondary
      : theme.colors[accentColorKey(tone, 'fg')];

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: theme.colors.borderSubtle,
        opacity: pressed && onPress ? 0.7 : inactive ? 0.6 : 1,
      })}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 11,
          backgroundColor: iconBg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name={category.icon} size={17} stroke={1.8} color={iconFg} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text variant="bodyLarge" numberOfLines={1} style={{ fontSize: 13.5 }}>
          {category.name}
        </Text>
        <Text
          variant="caption"
          muted
          style={{ fontSize: 11, marginTop: 2 }}
          numberOfLines={1}
        >
          {category.count === 0
            ? t('categories.row.noMovements')
            : t('categories.row.movements', { count: category.count })}
        </Text>
      </View>
      {category.spent > 0 ? (
        <Text variant="label" tabular style={{ fontSize: 13 }}>
          {formatMoney(category.spent)}
        </Text>
      ) : (
        <Text variant="caption" muted style={{ fontSize: 11 }}>
          —
        </Text>
      )}
      {onPress ? (
        <View style={{ marginLeft: 4 }}>
          <Icon name="chevron-right" size={15} color={theme.colors.textTertiary} />
        </View>
      ) : null}
    </Pressable>
  );
}
