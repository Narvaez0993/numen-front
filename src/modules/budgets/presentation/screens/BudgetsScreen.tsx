import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon, SectionLabel, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

import { BudgetsHeader } from '../components/BudgetsHeader';
import { CategoryItem } from '../components/CategoryItem';
import { MonthHero } from '../components/MonthHero';
import { ProjectionCallout } from '../components/ProjectionCallout';
import { useBudgets } from '../hooks/useBudgets';

export function BudgetsScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { data, isLoading } = useBudgets();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const sorted = useMemo(() => {
    if (!data) return [];
    return [...data.categories].sort((a, b) => b.spent / b.target - a.spent / a.target);
  }, [data]);

  if (isLoading || !data) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: theme.colors.bgBase,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator color={theme.colors.accentMint} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.bgBase }}
      edges={['top']}
    >
      <ScrollView
        contentContainerStyle={{
          paddingTop: 14,
          paddingBottom: 32,
          paddingHorizontal: 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ gap: 16 }}>
          <BudgetsHeader onAvatarPress={() => router.push('/profile')} />
          <MonthHero month={data.month} />
          <ProjectionCallout projection={data.projection} />

          <View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                paddingHorizontal: 4,
                marginBottom: 10,
                gap: 12,
              }}
            >
              <SectionLabel>{t('budgets.byCategory')}</SectionLabel>
              <Text variant="micro" muted style={{ fontSize: 10.5, letterSpacing: 0.5 }}>
                {t('budgets.urgencyOrder')}
              </Text>
            </View>
            <View style={{ gap: 10 }}>
              {sorted.map((c) => (
                <CategoryItem
                  key={c.id}
                  category={c}
                  expanded={expandedId === c.id}
                  onToggle={() => setExpandedId((id) => (id === c.id ? null : c.id))}
                />
              ))}
            </View>
          </View>

          <Pressable
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              paddingVertical: 14,
              borderRadius: 14,
              borderColor: theme.colors.borderDefault,
              borderWidth: 1,
              borderStyle: 'dashed',
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <Icon name="plus" size={15} color={theme.colors.textSecondary} />
            <Text variant="label" muted style={{ fontSize: 13 }}>
              {t('budgets.addCategory')}
            </Text>
          </Pressable>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              paddingHorizontal: 12,
              paddingVertical: 10,
              borderRadius: 12,
              backgroundColor: theme.colors.accentPurpleBg,
            }}
          >
            <Icon name="sparkles" size={14} color={theme.colors.accentPurple} />
            <Text
              variant="caption"
              color={theme.colors.textSecondary}
              style={{ flex: 1, minWidth: 0, fontSize: 11.5 }}
            >
              {t('budgets.plusUpsell.text')}{' '}
              <Text
                variant="caption"
                color={theme.colors.accentPurple}
                style={{ fontWeight: '500', fontSize: 11.5 }}
              >
                {t('budgets.plusUpsell.label')}
              </Text>
            </Text>
            <Pressable hitSlop={6}>
              <Text
                variant="label"
                color={theme.colors.accentPurple}
                style={{ fontSize: 11.5 }}
              >
                {t('budgets.plusUpsell.cta')}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
