import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Easing, View } from 'react-native';

import { Pill, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { shortDate, weekdayName } from '@/shared/presentation/utils/dates';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

import type { AgentOutput, AgentPlay, Slide } from '../../../domain/types/AgentFeed';
import { PlayRow } from './PlayRow';

type Props = {
  slide: Slide;
  corte: AgentOutput;
  playAction?: (play: AgentPlay) => ReactNode;
};

/**
 * One story slide, full screen. Numbers land big (the narration never repeats
 * them); everything enters with the same 320/380 ms ease-out the mock set.
 */
export function SlideView({ slide, corte, playAction }: Props) {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const language = i18n.language;

  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(24)).current;
  const scale = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    opacity.setValue(0);
    translateY.setValue(24);
    scale.setValue(0.92);
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 380,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
    // Re-runs when the slide changes — each entrance replays.
  }, [slide.id, opacity, translateY, scale]);

  const big = (value: string) => (
    <Animated.Text
      style={{
        fontFamily: 'Geist_500Medium',
        fontSize: 56,
        lineHeight: 62,
        letterSpacing: -2.2,
        color: theme.colors.textPrimary,
        transform: [{ scale }],
      }}
    >
      {value}
    </Animated.Text>
  );

  const narration = (
    <Text
      variant="body"
      color={theme.colors.textSecondary}
      style={{ fontSize: 15, lineHeight: 22 }}
    >
      {slide.text}
    </Text>
  );

  const body = () => {
    switch (slide.type) {
      case 'cover':
        return (
          <View style={{ gap: 14 }}>
            <Pill variant="mint" uppercase>
              {t('assistant.corte.title')}
            </Pill>
            <Text
              variant="display"
              style={{ fontSize: 40, lineHeight: 46, letterSpacing: -1.2 }}
            >
              {slide.text}
            </Text>
          </View>
        );
      case 'big_number':
        return (
          <View style={{ gap: 14 }}>
            <Pill variant="mint" uppercase>
              {t('assistant.corte.flat.spent')}
            </Pill>
            {big(formatMoney(slide.amount))}
            <Text variant="body" color={theme.colors.textSecondary}>
              {t('assistant.corte.flat.movements', { count: slide.count })}
            </Text>
            {narration}
          </View>
        );
      case 'category_bars':
        return (
          <View style={{ gap: 14 }}>
            <Pill variant="purple" uppercase>
              {t('assistant.corte.flat.topCategories')}
            </Pill>
            <View style={{ gap: 12 }}>
              {slide.bars.map((bar, position) => (
                <View key={bar.categoryId} style={{ gap: 5 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text variant="bodyLarge" style={{ fontSize: 16 }}>
                      {bar.name}
                    </Text>
                    <Text variant="bodyLarge" tabular style={{ fontSize: 16 }}>
                      {formatMoney(bar.amount)}
                    </Text>
                  </View>
                  <View
                    style={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'rgba(168,178,200,0.18)',
                      overflow: 'hidden',
                    }}
                  >
                    <View
                      style={{
                        width: `${Math.round(bar.pct * 100)}%`,
                        height: '100%',
                        borderRadius: 4,
                        backgroundColor:
                          position === 0
                            ? theme.colors.accentMint
                            : theme.colors.accentPurple,
                      }}
                    />
                  </View>
                </View>
              ))}
            </View>
            {narration}
          </View>
        );
      case 'fun_fact':
        return (
          <View style={{ gap: 14 }}>
            <Pill variant="amber" uppercase>
              {t('assistant.corte.flat.heaviestDay')}
            </Pill>
            {big(`${weekdayName(slide.day, language)} ${shortDate(slide.day, language)}`)}
            <Text variant="body" color={theme.colors.textSecondary}>
              {formatMoney(slide.amount)} ·{' '}
              {t('assistant.corte.flat.movements', { count: slide.count })}
            </Text>
            {narration}
          </View>
        );
      case 'pulse': {
        const pct = Math.round(Math.abs(slide.deltaPct) * 100);
        const less = slide.deltaPct <= 0;
        return (
          <View style={{ gap: 14 }}>
            <Pill variant={less ? 'mint' : 'coral'} uppercase>
              {t('assistant.corte.flat.pulse')}
            </Pill>
            {big(
              less
                ? t('assistant.corte.flat.spentLess', { pct })
                : t('assistant.corte.flat.spentMore', { pct }),
            )}
            <Text variant="body" color={theme.colors.textSecondary}>
              {formatMoney(slide.current)} · {formatMoney(slide.previous)}{' '}
              {t('assistant.corte.flat.previousMonth')}
            </Text>
            {narration}
          </View>
        );
      }
      case 'goal':
        return (
          <View style={{ gap: 14 }}>
            <Pill variant="purple" uppercase>
              {t('assistant.corte.flat.goal')}
            </Pill>
            <Text
              variant="display"
              style={{ fontSize: 32, lineHeight: 38, letterSpacing: -0.8 }}
            >
              {slide.name}
            </Text>
            {big(`${Math.round(slide.pct * 100)}%`)}
            <Text variant="body" color={theme.colors.textSecondary}>
              {formatMoney(slide.saved)} / {formatMoney(slide.target)}
            </Text>
            {narration}
          </View>
        );
      case 'first_month':
        return (
          <View style={{ gap: 14 }}>
            <Pill variant="mint" uppercase>
              {t('assistant.corte.flat.firstMonth')}
            </Pill>
            <Text
              variant="display"
              style={{ fontSize: 34, lineHeight: 40, letterSpacing: -1 }}
            >
              {slide.text}
            </Text>
          </View>
        );
      case 'play': {
        const play = corte.plays.find((p) => p.id === slide.playId);
        return (
          <View style={{ gap: 14 }}>
            <Pill variant="mint" uppercase>
              {t('assistant.corte.flat.play')}
            </Pill>
            <Text
              variant="display"
              style={{ fontSize: 30, lineHeight: 36, letterSpacing: -0.8 }}
            >
              {slide.text}
            </Text>
            {play ? <PlayRow play={play} action={playAction?.(play)} /> : null}
          </View>
        );
      }
    }
  };

  return (
    <Animated.View
      style={{
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 28,
        opacity,
        transform: [{ translateY }],
      }}
    >
      {body()}
    </Animated.View>
  );
}
