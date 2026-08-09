import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { useMovementCatalogs } from '@/modules/movements/presentation/hooks/useMovementCatalogs';
import { Icon, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { withAlpha } from '@/shared/presentation/theme/tokens';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

import type { TopCategory } from '../../domain/types/HomeOverview';

type Props = { categories: TopCategory[]; onSeeCaps?: () => void };

/** Icon for the unclassified bucket and for a category no longer in the catalog. */
const FALLBACK_ICON = 'dots';

/**
 * Where the month's money went — each category against the best yardstick it has.
 *
 * A category with a cap gets the same bar the budgets screen draws: `spent / target`
 * with the warning ramp. One without a cap gets **no bar at all**, only its share of
 * the month as text.
 *
 * That split is the whole point. This card used to draw the share as a bar, and a
 * category that took every peso of the month therefore showed a *full* bar while its
 * own cap sat at 40% spent — the same category read as blown here and as fine one
 * screen over. In this app a filled bar means "you reached a limit you set", and it
 * cannot mean anything else on any screen.
 *
 * Names and icons come from the catalog the client already caches: the API sends
 * only references, so a rename shows up here without touching the history.
 */
export function TopCategoriesCard({ categories, onSeeCaps }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const catalogs = useMovementCatalogs();

  if (categories.length === 0) return null;

  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          marginBottom: 6,
          gap: 12,
        }}
      >
        <Text
          variant="micro"
          uppercase
          color={theme.colors.textTertiary}
          style={{ letterSpacing: 2.2 }}
        >
          {t('home.categories.title')}
        </Text>
        {onSeeCaps ? (
          <Pressable accessibilityRole="button" onPress={onSeeCaps} hitSlop={8}>
            <Text color={theme.palette.acc} style={{ fontSize: 11.5 }}>
              {t('home.categories.seeCaps')}
            </Text>
          </Pressable>
        ) : null}
      </View>
      <View>
        {categories.map((c) => {
          const resolved = c.categoryId ? catalogs.categoryById[c.categoryId] : undefined;
          return (
            <View
              key={c.categoryId ?? 'unclassified'}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 11,
                paddingVertical: 9,
              }}
            >
              <View
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 10,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: withAlpha(theme.palette.acc, 0.14),
                }}
              >
                <Icon
                  name={resolved?.icon ?? FALLBACK_ICON}
                  size={15}
                  stroke={1.8}
                  color={theme.palette.acc2}
                />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'baseline',
                    justifyContent: 'space-between',
                    marginBottom: 7,
                    gap: 8,
                  }}
                >
                  <Text numberOfLines={1} style={{ fontSize: 13.5, flex: 1 }}>
                    {resolved?.name ?? t('home.categories.unclassified')}
                  </Text>
                  <Text
                    tabular
                    color={
                      c.cap && c.cap.used >= 1
                        ? theme.colors.accentCoral
                        : theme.colors.textPrimary
                    }
                    style={{ fontSize: 13, fontWeight: '500' }}
                  >
                    {formatMoney(c.spent)}
                  </Text>
                </View>
                {c.cap ? (
                  <View
                    style={{
                      height: 3,
                      borderRadius: theme.radius.bar,
                      backgroundColor: theme.colors.bgElevated,
                      overflow: 'hidden',
                    }}
                  >
                    <View
                      style={{
                        width: `${Math.min(c.cap.used, 1) * 100}%`,
                        height: '100%',
                        backgroundColor:
                          c.cap.used >= 1 ? theme.colors.accentCoral : theme.palette.acc,
                      }}
                    />
                  </View>
                ) : (
                  <Text variant="caption" muted tabular style={{ fontSize: 11 }}>
                    {t('home.categories.noCapShare', {
                      pct: Math.round(c.share * 100),
                    })}
                  </Text>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
