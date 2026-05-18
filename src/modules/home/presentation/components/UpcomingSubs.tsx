import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';

import { IconBox, SectionLabel, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { formatCOP } from '@/shared/presentation/utils/formatCOP';

import type { UpcomingSub } from '../../domain/types/HomeOverview';

type Props = { items: UpcomingSub[] };

export function UpcomingSubs({ items }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          paddingHorizontal: 4,
          marginBottom: 10,
          gap: 12,
        }}
      >
        <SectionLabel>{t('home.upcoming.title')}</SectionLabel>
        <Text variant="micro" muted style={{ fontSize: 10.5, letterSpacing: 0.5 }}>
          {t('home.upcoming.window')}
        </Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 10, paddingHorizontal: 16 }}
        style={{ marginHorizontal: -16 }}
      >
        {items.map((s) => {
          const urgent = s.daysUntil < 3;
          const dotColor = urgent ? theme.colors.accentAmber : theme.colors.textTertiary;
          return (
            <View
              key={s.id}
              style={{
                width: 152,
                backgroundColor: theme.colors.bgSurface,
                borderColor: theme.colors.borderSubtle,
                borderWidth: 1,
                borderRadius: 14,
                padding: 12,
                gap: 10,
              }}
            >
              <IconBox
                name={s.iconName}
                color={s.color}
                size={32}
                iconSize={15}
                radius={10}
              />
              <View>
                <Text variant="body" style={{ fontWeight: '500' }} numberOfLines={1}>
                  {s.name}
                </Text>
                <Text
                  variant="caption"
                  color={theme.colors.textSecondary}
                  tabular
                  style={{ marginTop: 2 }}
                >
                  {formatCOP(s.amount)}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <View
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: 2.5,
                    backgroundColor: dotColor,
                  }}
                />
                <Text
                  variant="micro"
                  color={dotColor}
                  style={{ fontSize: 10.5, fontWeight: '500', letterSpacing: 0 }}
                >
                  {t('home.upcoming.inDays', { count: s.daysUntil })}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
