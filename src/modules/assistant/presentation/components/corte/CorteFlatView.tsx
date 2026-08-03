import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ProgressBar, SectionLabel, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { monthName, shortDate, weekdayName } from '@/shared/presentation/utils/dates';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

import type { AgentOutput, Slide } from '../../../domain/types/AgentFeed';
import { PlayRow } from './PlayRow';

type Props = {
  corte: AgentOutput;
  /** Rendered under the play row (the apply button, when that slice lands). */
  playAction?: (playId: string) => ReactNode;
};

export function corteTitle(period: string, language: string): string {
  return `${monthName(`${period}-01`, language)} ${period.slice(0, 4)}`;
}

/**
 * The analytical view: every slide as a well-organized flat list. This is the
 * archive's reading mode — same frozen data as the stories, none of the show.
 */
export function CorteFlatView({ corte, playAction }: Props) {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const language = i18n.language;

  const renderSlide = (slide: Slide): ReactNode => {
    switch (slide.type) {
      case 'cover':
        return (
          <Text
            variant="caption"
            color={theme.colors.textSecondary}
            style={{ lineHeight: 18 }}
          >
            {slide.text}
          </Text>
        );
      case 'big_number':
        return (
          <View style={{ gap: 4 }}>
            <SectionLabel>{t('assistant.corte.flat.spent')}</SectionLabel>
            <Text variant="label" style={{ fontSize: 34, letterSpacing: -1 }}>
              {formatMoney(slide.amount)}
            </Text>
            <Text variant="caption" color={theme.colors.textSecondary}>
              {t('assistant.corte.flat.movements', { count: slide.count })}
            </Text>
          </View>
        );
      case 'category_bars':
        return (
          <View style={{ gap: 10 }}>
            <SectionLabel>{t('assistant.corte.flat.topCategories')}</SectionLabel>
            {slide.bars.map((bar) => (
              <View key={bar.categoryId} style={{ gap: 4 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text variant="caption">{bar.name}</Text>
                  <Text variant="caption" color={theme.colors.textSecondary}>
                    {formatMoney(bar.amount)} · {Math.round(bar.pct * 100)}%
                  </Text>
                </View>
                <ProgressBar pct={bar.pct} color={theme.colors.accentMint} />
              </View>
            ))}
          </View>
        );
      case 'fun_fact':
        return (
          <View style={{ gap: 4 }}>
            <SectionLabel>{t('assistant.corte.flat.heaviestDay')}</SectionLabel>
            <Text variant="label" style={{ fontSize: 16 }}>
              {weekdayName(slide.day, language)} {shortDate(slide.day, language)}
            </Text>
            <Text variant="caption" color={theme.colors.textSecondary}>
              {formatMoney(slide.amount)} ·{' '}
              {t('assistant.corte.flat.movements', { count: slide.count })}
            </Text>
          </View>
        );
      case 'pulse': {
        const pct = Math.round(Math.abs(slide.deltaPct) * 100);
        const less = slide.deltaPct <= 0;
        return (
          <View style={{ gap: 4 }}>
            <SectionLabel>{t('assistant.corte.flat.pulse')}</SectionLabel>
            <Text
              variant="label"
              color={less ? theme.colors.accentMint : theme.colors.accentCoral}
              style={{ fontSize: 16 }}
            >
              {less
                ? t('assistant.corte.flat.spentLess', { pct })
                : t('assistant.corte.flat.spentMore', { pct })}
            </Text>
            <Text variant="caption" color={theme.colors.textSecondary}>
              {formatMoney(slide.current)} · {formatMoney(slide.previous)}{' '}
              {t('assistant.corte.flat.previousMonth')}
            </Text>
          </View>
        );
      }
      case 'goal':
        return (
          <View style={{ gap: 6 }}>
            <SectionLabel>{t('assistant.corte.flat.goal')}</SectionLabel>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text variant="caption">{slide.name}</Text>
              <Text variant="caption" color={theme.colors.textSecondary}>
                {formatMoney(slide.saved)} / {formatMoney(slide.target)}
              </Text>
            </View>
            <ProgressBar pct={slide.pct} color={theme.colors.accentPurple} />
            {slide.neededPerMonth !== null ? (
              <Text variant="caption" color={theme.colors.textSecondary}>
                {t('assistant.corte.flat.neededPerMonth', {
                  amount: formatMoney(slide.neededPerMonth),
                })}
              </Text>
            ) : null}
          </View>
        );
      case 'first_month':
        return (
          <View style={{ gap: 4 }}>
            <SectionLabel>{t('assistant.corte.flat.firstMonth')}</SectionLabel>
            <Text
              variant="caption"
              color={theme.colors.textSecondary}
              style={{ lineHeight: 18 }}
            >
              {slide.text}
            </Text>
          </View>
        );
      case 'play': {
        const play = corte.plays.find((p) => p.id === slide.playId);
        if (!play) return null;
        return (
          <View style={{ gap: 8 }}>
            <SectionLabel>{t('assistant.corte.flat.play')}</SectionLabel>
            <PlayRow play={play} action={playAction?.(play.id)} />
          </View>
        );
      }
    }
  };

  return (
    <View style={{ gap: 18 }}>
      {corte.slides.map((slide) => (
        <View key={slide.id} style={{ gap: 8 }}>
          {renderSlide(slide)}
          {slide.type !== 'cover' && slide.type !== 'play' ? (
            <Text
              variant="caption"
              color={theme.colors.textTertiary}
              style={{ fontSize: 12, lineHeight: 17 }}
            >
              {slide.text}
            </Text>
          ) : null}
        </View>
      ))}
    </View>
  );
}
