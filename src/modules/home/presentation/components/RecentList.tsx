import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import type { Movement } from '@/modules/movements/domain';
import { TxRow } from '@/modules/movements/presentation/components/TxRow';
import {
  displaySource,
  useMovementCatalogs,
} from '@/modules/movements/presentation/hooks/useMovementCatalogs';
import { Card, SectionLabel, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

type Props = {
  items: Movement[];
  onSeeAll?: () => void;
};

/**
 * The last movements, rendered by the very same row the movements list uses: a
 * movement looks identical wherever it shows up, and there is one place to change
 * how it looks.
 */
export function RecentList({ items, onSeeAll }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const catalogs = useMovementCatalogs();

  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          paddingHorizontal: 4,
          marginBottom: 10,
        }}
      >
        <SectionLabel>{t('home.recent.title')}</SectionLabel>
        <Pressable hitSlop={6} onPress={onSeeAll} disabled={!onSeeAll}>
          <Text
            variant="label"
            color={theme.colors.accentMint}
            style={{ fontSize: 11.5 }}
          >
            {t('home.recent.seeAll')}
          </Text>
        </Pressable>
      </View>
      <Card padding={4}>
        {items.length === 0 ? (
          <View style={{ paddingHorizontal: 12, paddingVertical: 26 }}>
            <Text variant="body" muted style={{ fontSize: 13, textAlign: 'center' }}>
              {t('home.recent.empty')}
            </Text>
          </View>
        ) : (
          items.map((movement, i) => (
            <TxRow
              key={movement.id}
              movement={movement}
              category={
                movement.categoryId
                  ? catalogs.categoryById[movement.categoryId]
                  : undefined
              }
              source={displaySource(catalogs, movement.source, movement.destination)}
              last={i === items.length - 1}
              onPress={onSeeAll}
            />
          ))
        )}
      </Card>
    </View>
  );
}
