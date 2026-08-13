import { useTranslation } from 'react-i18next';
import { Pressable } from 'react-native';

import type { CurrencyCode } from '@/shared/domain';
import { Icon, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

type Props = {
  active: number;
  saved: number;
  currency: CurrencyCode;
  onPress: () => void;
};

/**
 * The way out to Metas, from the bottom of Presupuesto.
 *
 * It belongs here rather than in the tab bar because a goal is the other half of
 * the same question: a ceiling says what not to spend, a goal says what the not
 * spending is *for*. Reaching one from the other is the only place the pair
 * makes sense as a pair.
 *
 * It carries its two numbers so the link is worth reading even when it is not
 * tapped — "2 activas · $4.200.000 guardados" is often the whole answer.
 */
export function GoalsLink({ active, saved, currency, onPress }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 9,
        minHeight: 44,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Text color={theme.palette.acc3} style={{ fontSize: 12.5, fontWeight: '500' }}>
        {t('budgets.goalsLink.label')}
      </Text>
      <Text
        numberOfLines={1}
        color={theme.colors.textTertiary}
        style={{ flex: 1, fontSize: 11.5 }}
      >
        {t('budgets.goalsLink.summary', {
          count: active,
          amount: formatMoney(saved, currency),
        })}
      </Text>
      <Icon name="chevron-right" size={15} stroke={2} color={theme.colors.textTertiary} />
    </Pressable>
  );
}
