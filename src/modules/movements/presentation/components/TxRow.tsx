import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Icon, Pill, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { withAlpha } from '@/shared/presentation/theme/tokens';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

import type { Movement } from '../../domain';
import type { ResolvedCategory, ResolvedSource } from '../hooks/useMovementCatalogs';

type Props = {
  movement: Movement;
  category: ResolvedCategory | undefined;
  source: ResolvedSource | undefined;
  /** Where a transfer left from; `source` is where it landed. */
  from?: ResolvedSource;
  last: boolean;
  onPress?: () => void;
};

/** Fallback for a reference the catalogs could not resolve (deleted source). */
const UNKNOWN_ICON = 'dots';

/** The real minus sign, not a hyphen — it lines up with digits in a tabular font. */
const MINUS = '−';

/**
 * One movement, wherever it shows up: Home, the month, a source's history.
 *
 * Two things changed with the redesign, and both are about restraint.
 *
 * The well is **monochrome**. It used to wear the category's own colour, which
 * turned a list into a row of confetti and made the eye read the icon before the
 * amount. One accent for every row means the list is scanned by its numbers,
 * which is what a list of movements is for.
 *
 * And **an expense is not red.** Spending is the normal case here; colouring it
 * as a warning would make an ordinary month look alarming. The minus sign carries
 * the direction, and colour is saved for money coming IN, which is the rarer and
 * genuinely good news.
 */
export function TxRow({ movement, category, source, from, last, onPress }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const isTransfer = movement.type === 'transfer';
  const isIncome = movement.type === 'income';

  const icon = isTransfer ? 'transfer' : (category?.icon ?? source?.icon ?? UNKNOWN_ICON);
  // A transfer is named by its route, as the design writes it: «Bancolombia →
  // Nequi» says what happened; the description usually just repeats it.
  const title =
    isTransfer && from && source ? `${from.name} → ${source.name}` : movement.description;
  const subtitle = isTransfer
    ? t('movements.transferNote')
    : [category?.name, source?.name].filter(Boolean).join(' · ');
  // A transfer moved no money in or out, so it sits back — in the secondary ink,
  // the way the design draws it, instead of fading the whole row.
  const ink = isTransfer ? theme.colors.textSecondary : theme.colors.textPrimary;

  return (
    <Pressable
      accessibilityRole="button"
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
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <View
        style={{
          width: 38,
          height: 38,
          borderRadius: 13,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isTransfer
            ? withAlpha(theme.colors.textPrimary, 0.07)
            : withAlpha(theme.palette.acc, 0.14),
        }}
      >
        <Icon
          name={icon}
          size={18}
          stroke={1.8}
          color={isTransfer ? theme.colors.textTertiary : theme.palette.acc2}
        />
      </View>

      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text numberOfLines={1} color={ink} style={{ fontSize: 14, flexShrink: 1 }}>
            {title}
          </Text>
          {isTransfer ? (
            <View
              style={{
                paddingHorizontal: 7,
                paddingVertical: 2,
                borderRadius: 6,
                backgroundColor: withAlpha(theme.colors.textPrimary, 0.09),
              }}
            >
              <Text
                uppercase
                color={theme.colors.textSecondary}
                style={{ fontSize: 9.5, letterSpacing: 0.6 }}
              >
                {t('expenses.sheet.manualEntry.type.transfer')}
              </Text>
            </View>
          ) : null}
          {/* Derived from the subscription link: no `tag` field that could disagree. */}
          {movement.subscriptionId !== null ? (
            <Pill variant="neutral">{t('common.recurring')}</Pill>
          ) : null}
        </View>
        {subtitle ? (
          <Text
            numberOfLines={1}
            color={theme.colors.textTertiary}
            style={{ fontSize: 11, marginTop: 2 }}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>

      <Text
        tabular
        color={isIncome ? theme.colors.accentMint : ink}
        style={{ fontSize: 15, fontWeight: isTransfer ? '400' : '500' }}
      >
        {isIncome ? '+' : isTransfer ? '' : MINUS}
        {formatMoney(movement.amount, movement.currency)}
      </Text>
    </Pressable>
  );
}
