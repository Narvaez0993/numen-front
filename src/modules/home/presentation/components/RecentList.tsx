import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import {
  Card,
  IconBox,
  Pill,
  SectionLabel,
  Text,
} from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { formatCOP } from '@/shared/presentation/utils/formatCOP';

import type { RecentExpense } from '../../domain/types/HomeOverview';

type Props = { items: RecentExpense[]; onItemPress?: () => void };

export function RecentList({ items, onItemPress }: Props) {
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
        }}
      >
        <SectionLabel>{t('home.recent.title')}</SectionLabel>
        <Pressable hitSlop={6}>
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
        {items.map((r, i) => {
          const isTransfer = r.tag === 'transfer';
          const lineColor = isTransfer
            ? theme.colors.textTertiary
            : theme.colors.textPrimary;
          const subtitle = isTransfer
            ? t('home.recent.transferTag')
            : `${r.category} · ${r.time}`;
          return (
            <Pressable
              key={r.id}
              onPress={onItemPress}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                paddingHorizontal: 12,
                paddingVertical: 11,
                borderBottomWidth: i === items.length - 1 ? 0 : 1,
                borderBottomColor: theme.colors.borderSubtle,
                opacity: isTransfer ? 0.55 : pressed ? 0.85 : 1,
              })}
            >
              {isTransfer ? (
                <View
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    backgroundColor: 'rgba(168,178,200,0.10)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <IconBox
                    name={r.iconName}
                    color="mint"
                    size={34}
                    iconSize={16}
                    radius={10}
                    style={{ backgroundColor: 'transparent' }}
                  />
                </View>
              ) : (
                <IconBox
                  name={r.iconName}
                  color={r.color}
                  size={34}
                  iconSize={16}
                  radius={10}
                />
              )}
              <View style={{ flex: 1, minWidth: 0 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text
                    variant="bodyLarge"
                    color={lineColor}
                    numberOfLines={1}
                    style={{ flexShrink: 1 }}
                  >
                    {r.description}
                  </Text>
                  {r.tag === 'recurrente' ? (
                    <Pill variant="amber">recurrente</Pill>
                  ) : null}
                </View>
                <Text variant="caption" muted style={{ marginTop: 2 }}>
                  {subtitle}
                </Text>
              </View>
              <Text variant="bodyLarge" tabular color={lineColor}>
                {formatCOP(r.amount)}
              </Text>
            </Pressable>
          );
        })}
      </Card>
    </View>
  );
}
