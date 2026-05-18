import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Card, IconBox, ProgressBar, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { formatCOP } from '@/shared/presentation/utils/formatCOP';

import type { CategoryProgress } from '../../domain/types/HomeOverview';

type Props = { categories: CategoryProgress[] };

export function TopCategoriesCard({ categories }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
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
          const pct = c.spent / c.target;
          return (
            <View
              key={c.id}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
            >
              <IconBox name={c.iconName} color={c.color} size={34} iconSize={16} />
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
                    {c.name}
                  </Text>
                  <Text
                    variant="body"
                    tabular
                    color={theme.colors.textSecondary}
                    style={{ fontWeight: '500', fontSize: 12.5 }}
                  >
                    {formatCOP(c.spent)}
                    <Text variant="caption" muted>
                      {' '}
                      · {Math.round(pct * 100)}%
                    </Text>
                  </Text>
                </View>
                <ProgressBar pct={pct} height={5} />
              </View>
            </View>
          );
        })}
      </View>
    </Card>
  );
}
