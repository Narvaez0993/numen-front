import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  Icon,
  Pill,
  RetryState,
  SubScreenHeader,
  Text,
} from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

import type { AgentOutput } from '../../domain/types/AgentFeed';
import { corteTitle } from '../components/corte/CorteFlatView';
import { useCortes } from '../hooks/useCortes';

/**
 * «Tus Cortes» — the archive. Every month the agent ever told, replayable;
 * dismissing one from the feed never removes it from here.
 */
export function CortesShelfScreen() {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const cortes = useCortes();

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.bgBase }}
      edges={['top']}
    >
      <SubScreenHeader
        title={t('assistant.corte.shelfTitle')}
        onBack={() => router.back()}
      />
      {cortes.isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={theme.colors.textSecondary} />
        </View>
      ) : cortes.isError ? (
        <RetryState
          titleKey="assistant.corte.loadFailed"
          retryKey="assistant.errors.retry"
          onRetry={() => cortes.refetch()}
        />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 10 }}>
          {(cortes.data ?? []).length === 0 ? (
            <View style={{ paddingTop: 48, alignItems: 'center', gap: 6 }}>
              <Text variant="label">{t('assistant.corte.shelfEmptyTitle')}</Text>
              <Text
                variant="caption"
                color={theme.colors.textSecondary}
                style={{ textAlign: 'center', lineHeight: 18 }}
              >
                {t('assistant.corte.shelfEmptyBody')}
              </Text>
            </View>
          ) : (
            (cortes.data ?? []).map((corte) => (
              <ShelfRow key={corte.id} corte={corte} language={i18n.language} />
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function ShelfRow({ corte, language }: { corte: AgentOutput; language: string }) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const cover = corte.slides.find((s) => s.type === 'cover');

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push(`/corte/${corte.id}`)}
      style={({ pressed }) => ({
        backgroundColor: theme.colors.bgSurface,
        borderColor: theme.colors.borderSubtle,
        borderWidth: 1,
        borderRadius: 14,
        padding: 14,
        gap: 6,
        opacity: pressed ? 0.9 : 1,
      })}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Text variant="label" style={{ fontSize: 15, textTransform: 'capitalize' }}>
          {corteTitle(corte.period, language)}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {corte.readAt === null ? (
            <Pill variant="mint" uppercase>
              {t('assistant.corte.pillNew')}
            </Pill>
          ) : null}
          <Icon name="chevron-right" size={14} color={theme.colors.textTertiary} />
        </View>
      </View>
      {cover ? (
        <Text
          variant="caption"
          color={theme.colors.textSecondary}
          numberOfLines={2}
          style={{ fontSize: 12.5, lineHeight: 18 }}
        >
          {cover.text}
        </Text>
      ) : null}
    </Pressable>
  );
}
