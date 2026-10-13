import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';

import type { CurrencyCode } from '@/shared/domain';
import { Icon, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { withAlpha } from '@/shared/presentation/theme/tokens';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

import type { CandidateCategory } from '../../hooks/useWatchedCategories';

type Props = {
  /** Already filtered to what is not watched yet, most expensive first. */
  candidates: CandidateCategory[];
  currency: CurrencyCode;
  onPick: (category: CandidateCategory) => void;
};

/**
 * Which category to cap — the first step of `CapSheet`, drawn inside it.
 *
 * The rows are the design's category rows: the icon in the accent's well, the
 * name, and what it has cost this month on the right, which is the number the
 * choice turns on. The sheet's header already says what is being picked, so
 * there is no second title here, and no «Agregar» pill on every row: the whole
 * row is the button.
 */
export function AddVigilanceBody({ candidates, currency, onPick }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  if (candidates.length === 0) {
    return (
      <View style={{ paddingHorizontal: 26, paddingTop: 22 }}>
        <Text style={{ fontSize: 17, fontWeight: '300', letterSpacing: -0.3 }}>
          {t('budgets.addVigilance.allWatchedTitle')}
        </Text>
        <Text
          color={theme.colors.textTertiary}
          style={{ fontSize: 12.5, lineHeight: 19, marginTop: 8 }}
        >
          {t('budgets.addVigilance.allWatchedHint')}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 26, paddingTop: 22, paddingBottom: 32 }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          marginBottom: 6,
        }}
      >
        <Text
          variant="micro"
          uppercase
          color={theme.colors.textTertiary}
          style={{ letterSpacing: 2.2 }}
        >
          {t('budgets.addVigilance.listLabel')}
        </Text>
        <Text color={theme.colors.textTertiary} style={{ fontSize: 11 }}>
          {t('budgets.addVigilance.spentLabel')}
        </Text>
      </View>

      {candidates.map((category, index) => (
        <Pressable
          key={category.id}
          accessibilityRole="button"
          onPress={() => onPick(category)}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            minHeight: 44,
            paddingVertical: 12,
            borderBottomWidth: index === candidates.length - 1 ? 0 : 1,
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
              backgroundColor: withAlpha(theme.palette.acc, 0.14),
            }}
          >
            <Icon
              name={category.icon}
              size={16}
              stroke={1.8}
              color={theme.palette.acc2}
            />
          </View>
          <Text numberOfLines={1} style={{ flex: 1, fontSize: 14 }}>
            {category.name}
          </Text>
          <Text
            tabular
            color={
              category.spent > 0 ? theme.colors.textPrimary : theme.colors.textTertiary
            }
            style={{ fontSize: 14.5 }}
          >
            {formatMoney(category.spent, currency)}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}
