import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import type { Movement } from '@/modules/movements/domain';
import { TxRow } from '@/modules/movements/presentation/components/TxRow';
import {
  displaySource,
  useMovementCatalogs,
} from '@/modules/movements/presentation/hooks/useMovementCatalogs';
import { Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

type Props = {
  items: Movement[];
  /** `YYYY-MM-DD`. The block is "Hoy", so it shows today and nothing else —
   *  yesterday's coffee under a heading that says today would be a small lie. */
  today: string;
  onSeeAll?: () => void;
};

/**
 * The last movements, rendered by the very same row the movements list uses: a
 * movement looks identical wherever it shows up, and there is one place to change
 * how it looks.
 */
export function RecentList({ items, today, onSeeAll }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const catalogs = useMovementCatalogs();
  const todays = items.filter((movement) => movement.occurredOn === today);

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
        <Text
          variant="micro"
          uppercase
          color={theme.colors.textTertiary}
          style={{ letterSpacing: 2.2 }}
        >
          {t('home.recent.title')}
        </Text>
        <Pressable hitSlop={6} onPress={onSeeAll} disabled={!onSeeAll}>
          <Text variant="label" color={theme.palette.acc} style={{ fontSize: 11.5 }}>
            {t('home.recent.seeAll')}
          </Text>
        </Pressable>
      </View>
      <View>
        {todays.length === 0 ? (
          <View style={{ paddingHorizontal: 12, paddingVertical: 26 }}>
            <Text variant="body" muted style={{ fontSize: 13, textAlign: 'center' }}>
              {t('home.recent.emptyToday')}
            </Text>
          </View>
        ) : (
          todays.map((movement, i) => (
            <TxRow
              key={movement.id}
              movement={movement}
              category={
                movement.categoryId
                  ? catalogs.categoryById[movement.categoryId]
                  : undefined
              }
              source={displaySource(catalogs, movement.source, movement.destination)}
              from={catalogs.sourceById[movement.source.id]}
              last={i === todays.length - 1}
              onPress={onSeeAll}
            />
          ))
        )}
      </View>
    </View>
  );
}
