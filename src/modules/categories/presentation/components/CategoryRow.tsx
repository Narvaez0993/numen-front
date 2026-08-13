import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import type { CurrencyCode } from '@/shared/domain';
import { Icon, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { withAlpha } from '@/shared/presentation/theme/tokens';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

import type { CategoryWithSpend } from '../utils/joinCategorySpend';

type Props = {
  /** Carries the spend of the period being shown, joined by the screen. */
  category: CategoryWithSpend;
  /** The cap on this category, when it has one. */
  target?: number;
  /** Already past that cap. */
  over?: boolean;
  currency: CurrencyCode;
  last?: boolean;
  onPress?: () => void;
};

/**
 * One category: what it cost this month, and whether anything is watching it.
 *
 * The subtitle carries the only fact that changes what you would do about the
 * number beside it — a cap, that it has been passed, or that there is none. And
 * for a category nothing has touched, that it has not been used, which is why
 * the whole row steps back rather than showing a $0 that reads like a result.
 *
 * The well is monochrome like every other list in the app. It used to wear the
 * category's own colour, which turned a screen of twenty into a paint chart and
 * made the eye read the icon before the amount.
 */
export function CategoryRow({
  category,
  target,
  over = false,
  currency,
  last = false,
  onPress,
}: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const used = category.count > 0;

  const note = over
    ? { text: t('categories.row.over'), color: theme.colors.accentCoralSoft }
    : target !== undefined
      ? {
          text: t('categories.row.cap', { amount: formatMoney(target, currency) }),
          color: theme.colors.textTertiary,
        }
      : used
        ? { text: t('categories.row.noCap'), color: theme.colors.textTertiary }
        : { text: t('categories.row.unused'), color: theme.colors.textTertiary };

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 12,
        minHeight: 44,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: theme.colors.borderSubtle,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
          // An untouched category gets the neutral well: the accent marks what is
          // actually happening this month.
          backgroundColor: used
            ? withAlpha(theme.palette.acc, 0.14)
            : theme.colors.bgFloat,
        }}
      >
        <Icon
          name={category.icon}
          size={16}
          stroke={1.8}
          color={used ? theme.palette.acc2 : theme.colors.textTertiary}
        />
      </View>

      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          numberOfLines={1}
          color={used ? theme.colors.textPrimary : theme.colors.textSecondary}
          style={{ fontSize: 14 }}
        >
          {category.name}
        </Text>
        <Text numberOfLines={1} color={note.color} style={{ fontSize: 11, marginTop: 2 }}>
          {note.text}
        </Text>
      </View>

      <Text
        tabular
        color={used ? theme.colors.textPrimary : theme.colors.textTertiary}
        style={{ fontSize: 14.5 }}
      >
        {formatMoney(category.spent, currency)}
      </Text>
    </Pressable>
  );
}
