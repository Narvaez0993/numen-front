import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useMovementCatalogs } from '@/modules/movements/presentation/hooks/useMovementCatalogs';
import { Card, IconBox, ProgressBar, Text } from '@/shared/presentation/components';
import { accentColorKey, useTheme } from '@/shared/presentation/theme';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

import type { TopCategory } from '../../domain/types/HomeOverview';

type Props = { categories: TopCategory[] };

/** Icon for the unclassified bucket and for a category no longer in the catalog. */
const FALLBACK_ICON = 'dots';

/**
 * Where the month's money went, by **share of the month's expenses** — a real
 * number, not progress against a budget that does not exist yet.
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
                    <Text variant="caption" muted>
                      {' '}
                      · {Math.round(c.share * 100)}%
                    </Text>
                  </Text>
                </View>
                <ProgressBar
                  pct={c.share}
                  height={5}
                  // Share of the month, not progress against a limit: the bar
                  // wears the category's own colour instead of a warning ramp.
                  color={theme.colors[accentColorKey(resolved?.color ?? 'mint', 'fg')]}
                />
              </View>
            </View>
          );
        })}
      </View>
    </Card>
  );
}
