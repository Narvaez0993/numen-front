import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  Card,
  IconBox,
  ProgressBar,
  SubScreenHeader,
  Text,
} from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { formatCOP } from '@/shared/presentation/utils/formatCOP';

import { goalPct } from '../../domain/types/Goal';
import { MOCK_GOALS } from '../constants/mockGoals';

export function GoalsScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.bgBase }}
      edges={['top']}
    >
      <SubScreenHeader title={t('goals.title')} onBack={() => router.back()} />
      <ScrollView
        contentContainerStyle={{
          paddingTop: 8,
          paddingBottom: 32,
          paddingHorizontal: 16,
          gap: 12,
        }}
        showsVerticalScrollIndicator={false}
      >
        {MOCK_GOALS.map((goal) => {
          const pct = goalPct(goal);
          return (
            <Card key={goal.id} padding={16}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  marginBottom: 12,
                }}
              >
                <IconBox
                  name={goal.iconName}
                  color={goal.color}
                  size={36}
                  iconSize={17}
                />
                <Text variant="bodyLarge" numberOfLines={1} style={{ flex: 1 }}>
                  {goal.name}
                </Text>
                <Text
                  variant="caption"
                  color={theme.colors.accentMint}
                  tabular
                  style={{ fontFamily: 'Geist_500Medium' }}
                >
                  {Math.round(pct * 100)}%
                </Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'baseline',
                  gap: 6,
                  marginBottom: 10,
                }}
              >
                <Text variant="h2" tabular>
                  {formatCOP(goal.saved)}
                </Text>
                <Text variant="caption" muted>
                  {t('goals.of')} {formatCOP(goal.target)}
                </Text>
              </View>
              <ProgressBar pct={pct} height={6} />
              <Text
                variant="caption"
                color={theme.colors.textTertiary}
                style={{ marginTop: 10 }}
              >
                {t('goals.projection', { month: goal.projectionMonth })}
              </Text>
            </Card>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
