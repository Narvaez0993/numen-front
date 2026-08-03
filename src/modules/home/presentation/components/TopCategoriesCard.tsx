import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useMovementCatalogs } from '@/modules/movements/presentation/hooks/useMovementCatalogs';
import { Card, IconBox, ProgressBar, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

import type { TopCategory } from '../../domain/types/HomeOverview';

type Props = { categories: TopCategory[] };

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
export function TopCategoriesCard({ categories }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const catalogs = useMovementCatalogs();

  if (categories.length === 0) return null;

  return (
    <Card padding={16}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 14,
          gap: 12,
        }}
      >
        <Text variant="h2">{t('home.categories.title')}</Text>
        <Text variant="caption" muted>
          {t('home.categories.thisMonth')}
        </Text>
      </View>
      <View style={{ gap: 14 }}>
        {categories.map((c) => {
          const resolved = c.categoryId ? catalogs.categoryById[c.categoryId] : undefined;
          return (
            <View
              key={c.categoryId ?? 'unclassified'}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
            >
              <IconBox
                name={resolved?.icon ?? FALLBACK_ICON}
                color={resolved?.color ?? 'mint'}
                size={34}
                iconSize={16}
              />
              <View style={{ flex: 1, minWidth: 0 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'baseline',
                    justifyContent: 'space-between',
                    marginBottom: 6,
                    gap: 8,
                  }}
                >
                  <Text
                    variant="body"
                    numberOfLines={1}
                    style={{ fontWeight: '500', flex: 1 }}
                  >
                    {resolved?.name ?? t('home.categories.unclassified')}
                  </Text>
                  <Text
                    variant="body"
                    tabular
                    color={theme.colors.textSecondary}
                    style={{ fontWeight: '500', fontSize: 12.5 }}
                  >
                    {formatMoney(c.spent)}
                    {c.cap ? (
                      <Text variant="body" muted style={{ fontSize: 12.5 }}>
                        {' '}
                        / {formatMoney(c.cap.target)}
                      </Text>
                    ) : null}
                  </Text>
                </View>
                {c.cap ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    {/* The default ramp, mint → amber → coral, and the overflow past
                        the cap: the same bar the budgets screen draws for this cap. */}
                    <ProgressBar pct={c.cap.used} height={5} style={{ flex: 1 }} />
                    <Text variant="caption" muted tabular style={{ fontSize: 11 }}>
                      {Math.round(c.cap.used * 100)}%
                    </Text>
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
    </Card>
  );
}
