import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import type { CurrencyCode } from '@/shared/domain';
import { Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

type Props = {
  monthName: string;
  /** The standing ceiling, or `null` when none is set yet. */
  target: number | null;
  currency: CurrencyCode;
  onEditCeiling: () => void;
};

/**
 * The month, and the ceiling it is measured against.
 *
 * The screen's own name shrinks to a label and the MONTH becomes the title —
 * the same move Movimientos makes, for the same reason: "Presupuesto" never
 * varies and does not deserve the largest type on the page.
 *
 * The ceiling sits opposite it as a second, smaller figure, and it is tappable.
 * That placement is a claim: the ceiling is context for the month, not a setting
 * buried elsewhere, so changing it costs one tap from the only screen where you
 * can see whether it is the right number.
 */
export function BudgetsHeader({ monthName, target, currency, onEditCeiling }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: 12,
      }}
    >
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          variant="micro"
          uppercase
          color={theme.colors.textTertiary}
          style={{ letterSpacing: 2.2, marginBottom: 7 }}
        >
          {t('budgets.title')}
        </Text>
        <Text
          numberOfLines={1}
          style={{ fontSize: 29, fontWeight: '300', letterSpacing: -1 }}
        >
          {monthName}
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('budgets.hero.ceiling')}
        onPress={onEditCeiling}
        style={({ pressed }) => ({
          alignItems: 'flex-end',
          minHeight: 44,
          justifyContent: 'flex-end',
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Text
          variant="micro"
          uppercase
          color={theme.colors.textTertiary}
          style={{ letterSpacing: 1.6, marginBottom: 5 }}
        >
          {t('budgets.hero.ceiling')}
        </Text>
        <Text
          tabular
          color={theme.colors.textSecondary}
          style={{ fontSize: 15, fontWeight: '500' }}
        >
          {target === null ? t('budgets.hero.noCeiling') : formatMoney(target, currency)}
        </Text>
      </Pressable>
    </View>
  );
}
