import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  Icon,
  Pill,
  RetryState,
  Segmented,
  SectionLabel,
  SubScreenHeader,
  Text,
} from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import {
  addDays,
  isoWeekMonday,
  monthName,
  shortDate,
} from '@/shared/presentation/utils/dates';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

import type { AgentOutput } from '../../domain/types/AgentFeed';
import { useSummaries } from '../hooks/useCortes';
import { corteTotal, forTab, groupByYear, type SummaryTab } from '../utils/summariesList';

const TABS = ['monthly', 'weekly'] as const;

/**
 * «Resúmenes» — everything the agent has delivered, split in two tabs because a
 * single mixed list could not be scanned: a month and a week are different
 * questions and they alternate unpredictably.
 *
 * Inside each tab the newest one is FEATURED — a big card under «el más
 * reciente» — and the rest read as compact rows. The point is that the user
 * never has to work out which one is their latest.
 *
 * This is their home: docked over the chat they cost the conversation a third of
 * its screen for artifacts that arrive five times a month.
 */
export function SummariesScreen() {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const summaries = useSummaries();
  const [tab, setTab] = useState<SummaryTab>('monthly');

  const all = summaries.data ?? [];
  const rows = forTab(all, tab);
  const featured = rows[0];
  const groups = groupByYear(rows.slice(1));
  // A lone year heading over one list is furniture; two or more earn it.
  const showYears = groups.length > 1;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.bgBase }}
      edges={['top']}
    >
      <SubScreenHeader
        title={t('assistant.summaries.title')}
        onBack={() => router.back()}
      />

      {summaries.isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={theme.colors.textSecondary} />
        </View>
      ) : summaries.isError ? (
        <RetryState
          titleKey="assistant.summaries.loadFailed"
          retryKey="assistant.errors.retry"
          onRetry={() => summaries.refetch()}
        />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 16 }}>
          <Segmented
            value={tab}
            onChange={setTab}
            options={TABS.map((id) => ({
              value: id,
              label: countLabel(
                t(
                  id === 'monthly'
                    ? 'assistant.summaries.tabMonthly'
                    : 'assistant.summaries.tabWeekly',
                ),
                forTab(all, id),
              ),
            }))}
          />

          {featured === undefined ? (
            <View style={{ paddingTop: 40, alignItems: 'center', gap: 6 }}>
              <Text variant="label">{t('assistant.summaries.emptyTitle')}</Text>
              <Text
                variant="caption"
                color={theme.colors.textSecondary}
                style={{ textAlign: 'center', lineHeight: 18 }}
              >
                {t(`assistant.summaries.empty.${tab}`)}
              </Text>
            </View>
          ) : (
            <>
              <View style={{ gap: 8 }}>
                <SectionLabel>{t('assistant.summaries.mostRecent')}</SectionLabel>
                <FeaturedCard output={featured} language={i18n.language} />
              </View>

              {groups.length > 0 ? (
                <View style={{ gap: 8 }}>
                  <SectionLabel>{t('assistant.summaries.previous')}</SectionLabel>
                  {groups.map((group) => (
                    <View key={group.year} style={{ gap: 8 }}>
                      {showYears ? (
                        <Text
                          variant="micro"
                          muted
                          tabular
                          style={{ fontSize: 11, marginTop: 4 }}
                        >
                          {group.year}
                        </Text>
                      ) : null}
                      {group.items.map((output) => (
                        <CompactRow
                          key={output.id}
                          output={output}
                          language={i18n.language}
                        />
                      ))}
                    </View>
                  ))}
                </View>
              ) : null}
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

/** `Mensuales · 3`, or the bare label while there is nothing to count. */
function countLabel(label: string, items: AgentOutput[]): string {
  return items.length > 0 ? `${label} · ${items.length}` : label;
}

// ─────────────────────────────────────────────────────────────
// What a delivery says without being opened
// ─────────────────────────────────────────────────────────────

type Described = {
  isCorte: boolean;
  /** The period, spelled for a human: «Julio 2026» or «20 – 26 jul». */
  title: string;
  /** The figure that makes the row worth reading; `null` if it was not measured. */
  amount: number | null;
  /** Signed fraction vs the previous week — weekly only. */
  deltaPct: number | null;
  body: string | null;
  open: () => void;
};

function describe(output: AgentOutput, language: string): Described {
  const isCorte = output.kind === 'monthly_summary';
  const open = () =>
    router.push(isCorte ? `/corte/${output.id}` : `/weekly/${output.id}`);

  if (isCorte) {
    return {
      isCorte,
      title: `${monthName(`${output.period}-01`, language)} ${output.period.slice(0, 4)}`,
      amount: corteTotal(output),
      deltaPct: null,
      body: output.slides.find((s) => s.type === 'cover')?.text ?? null,
      open,
    };
  }

  // Reviews stored before the report blocks existed carry no dates: the range
  // comes back from the ISO key rather than showing `2026-W30` raw.
  const from = output.weekly?.dateFrom ?? isoWeekMonday(output.period);
  const to = output.weekly?.dateTo ?? (from ? addDays(from, 6) : null);
  return {
    isCorte,
    title:
      from && to
        ? `${shortDate(from, language)} – ${shortDate(to, language)}`
        : output.period,
    amount: output.weekly?.weekTotal ?? null,
    deltaPct: output.weekly?.deltaPct ?? null,
    body: output.weekly?.diagnosisText ?? null,
    open,
  };
}

/** The latest one, unmistakable: the accent border, the figure big, its CTA. */
function FeaturedCard({ output, language }: { output: AgentOutput; language: string }) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const described = describe(output, language);
  const accent = described.isCorte ? theme.colors.accentMint : theme.colors.accentPurple;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={described.open}
      style={({ pressed }) => ({
        backgroundColor: theme.colors.bgSurface,
        borderColor: accent,
        borderWidth: 1,
        borderRadius: 16,
        padding: 16,
        gap: 10,
        opacity: pressed ? 0.9 : 1,
      })}
    >
      <View
        style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}
      >
        <Pill variant={described.isCorte ? 'mint' : 'purple'} uppercase>
          {described.isCorte
            ? t('assistant.corte.title')
            : t('assistant.summaries.weeklyKind')}
        </Pill>
        {output.readAt === null ? (
          <Pill variant="mint" uppercase>
            {t('assistant.corte.pillNew')}
          </Pill>
        ) : null}
      </View>

      <View style={{ gap: 4 }}>
        <Text
          variant="label"
          numberOfLines={1}
          style={{ fontSize: 17, textTransform: 'capitalize' }}
        >
          {described.title}
        </Text>
        {described.amount !== null ? (
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
            <Text variant="label" tabular style={{ fontSize: 28, letterSpacing: -0.9 }}>
              {formatMoney(described.amount)}
            </Text>
            <Delta value={described.deltaPct} />
            {described.isCorte ? (
              <Text variant="caption" muted style={{ fontSize: 12 }}>
                {t('assistant.summaries.spent')}
              </Text>
            ) : null}
          </View>
        ) : null}
      </View>

      {described.body ? (
        <Text
          variant="caption"
          color={theme.colors.textSecondary}
          numberOfLines={2}
          style={{ fontSize: 12.5, lineHeight: 18 }}
        >
          {described.body}
        </Text>
      ) : null}

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Text variant="label" color={accent} style={{ fontSize: 12 }}>
          {described.isCorte
            ? t('assistant.corte.entryCta')
            : t('assistant.summaries.weeklyCta')}
        </Text>
        <Icon name="chevron-right" size={12} color={accent} />
      </View>
    </Pressable>
  );
}

/** An older delivery: one line, still carrying its figure. */
function CompactRow({ output, language }: { output: AgentOutput; language: string }) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const described = describe(output, language);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={described.open}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: theme.colors.bgSurface,
        borderColor: theme.colors.borderSubtle,
        borderWidth: 1,
        borderRadius: 14,
        paddingVertical: 13,
        paddingHorizontal: 14,
        opacity: pressed ? 0.9 : 1,
      })}
    >
      <Text
        variant="body"
        numberOfLines={1}
        style={{ flex: 1, minWidth: 0, textTransform: 'capitalize' }}
      >
        {described.title}
      </Text>
      {output.readAt === null ? (
        <Pill variant="mint" uppercase>
          {t('assistant.corte.pillNew')}
        </Pill>
      ) : null}
      {described.amount !== null ? (
        <Text
          variant="body"
          tabular
          color={theme.colors.textSecondary}
          style={{ fontWeight: '500', fontSize: 13 }}
        >
          {formatMoney(described.amount)}
        </Text>
      ) : null}
      <Icon name="chevron-right" size={14} color={theme.colors.textTertiary} />
    </Pressable>
  );
}

/** «28% menos» in mint, «12% más» in coral. Nothing on a first week. */
function Delta({ value }: { value: number | null }) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  if (value === null) return null;
  const less = value <= 0;
  const pct = Math.round(Math.abs(value) * 100);
  return (
    <Text
      variant="caption"
      color={less ? theme.colors.accentMint : theme.colors.accentCoral}
      style={{ fontSize: 12 }}
    >
      {less ? t('assistant.weekly.less', { pct }) : t('assistant.weekly.more', { pct })}
    </Text>
  );
}
