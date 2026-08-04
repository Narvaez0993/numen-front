import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Easing, Pressable, useWindowDimensions, View } from 'react-native';
import { Ellipse, Svg } from 'react-native-svg';

import { useMovementCatalogs } from '@/modules/movements/presentation/hooks/useMovementCatalogs';
import type { AccentColor } from '@/shared/domain';
import { Icon, IconBox, Text } from '@/shared/presentation/components';
import { accentColorKey, useTheme } from '@/shared/presentation/theme';
import { monthName, shiftMonth, weekdayName } from '@/shared/presentation/utils/dates';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

import type { AgentOutput, AgentPlay, Slide } from '../../../domain/types/AgentFeed';
import { playAmountLine } from './PlayRow';

type Props = {
  slide: Slide;
  corte: AgentOutput;
  playAction?: (play: AgentPlay) => ReactNode;
  /** «Ahora no» / «Volver al Asistente» on the play slide. */
  onClose?: () => void;
};

/** The design's easing — every corte animation shares it. */
const CURVE = Easing.bezier(0.32, 0.72, 0, 1);

/** Dark navy from the tokens: the text that sits ON a mint button, any theme. */
const ON_MINT = '#0A0E1A';

/**
 * One accent per story — the design's whole color system. The wash, the
 * kicker and the protagonist number all wear it; everything else stays
 * bg-base and text ramps ("Restrained Wrapped").
 */
function accentFor(slide: Slide): AccentColor {
  switch (slide.type) {
    case 'big_number':
      return 'coral';
    case 'category_bars':
    case 'goal':
      return 'amber';
    case 'fun_fact':
      return 'purple';
    case 'pulse':
      return slide.deltaPct <= 0 ? 'mint' : 'coral';
    default:
      return 'mint';
  }
}

/**
 * One story slide, full screen, faithful to the Corte design: an atmospheric
 * accent wash (solid tint, no gradient), a small uppercase kicker, a giant
 * number IN the accent color, and the agent's narrated line below. Elements
 * enter staggered on the design's shared curve; the player remounts this per
 * slide so every entrance replays.
 */
export function SlideView({ slide, corte, playAction, onClose }: Props) {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const language = i18n.language;
  const catalogs = useMovementCatalogs();
  const { width, height } = useWindowDimensions();

  const accent = accentFor(slide);
  const accentFg = theme.colors[accentColorKey(accent, 'fg')];
  const accentBg = theme.colors[accentColorKey(accent, 'bg')];
  const month = monthName(`${corte.period}-01`, language);

  const narration = (delay = 320) => (
    <Rise delay={delay}>
      <Text
        variant="body"
        color={theme.colors.textSecondary}
        style={{ fontSize: 15, lineHeight: 22.5, letterSpacing: -0.15 }}
      >
        {slide.text}
      </Text>
    </Rise>
  );

  const body = () => {
    switch (slide.type) {
      case 'cover':
        return (
          <View style={{ gap: 30 }}>
            <NumIn delay={0}>
              <CoverMark
                stroke={theme.colors.textTertiary}
                dot={theme.colors.accentMint}
              />
            </NumIn>
            <View>
              <NumIn delay={200}>
                <Text
                  variant="display"
                  style={{ fontSize: 44, lineHeight: 46, letterSpacing: -1.5 }}
                >
                  {t('assistant.corte.stories.coverTitle', { month })}
                </Text>
              </NumIn>
              <Rise delay={420}>
                <Text
                  variant="body"
                  color={theme.colors.textSecondary}
                  style={{ fontSize: 14.5, lineHeight: 22, marginTop: 14 }}
                >
                  {slide.text}
                </Text>
              </Rise>
            </View>
            <Rise delay={700}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
                <Icon name="chevron-right" size={13} color={theme.colors.textTertiary} />
                <Text variant="caption" muted style={{ fontSize: 11.5 }}>
                  {t('assistant.corte.playerHint')}
                </Text>
              </View>
            </Rise>
          </View>
        );

      case 'big_number':
        return (
          <View>
            <Kicker color={accentFg}>
              {t('assistant.corte.stories.kickerSpent', { month })}
            </Kicker>
            <View style={{ height: 18 }} />
            <BigNum color={accentFg} size={54}>
              {formatMoney(slide.amount)}
            </BigNum>
            <View style={{ height: 26 }} />
            {narration()}
          </View>
        );

      case 'category_bars': {
        const max = Math.max(...slide.bars.map((bar) => bar.amount), 1);
        return (
          <View>
            <Kicker color={accentFg}>{t('assistant.corte.stories.kickerWhere')}</Kicker>
            <View style={{ height: 24 }} />
            <View style={{ gap: 20 }}>
              {slide.bars.map((bar, position) => {
                const color =
                  theme.colors[
                    accentColorKey(
                      catalogs.categoryById[bar.categoryId]?.color ?? 'mint',
                      'fg',
                    )
                  ];
                return (
                  <Rise key={bar.categoryId} delay={140 + position * 130}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'baseline',
                        justifyContent: 'space-between',
                        gap: 10,
                        marginBottom: 9,
                      }}
                    >
                      <Text
                        variant="body"
                        numberOfLines={1}
                        style={{ fontWeight: '500', fontSize: 15, flexShrink: 1 }}
                      >
                        {bar.name}
                      </Text>
                      <Text
                        variant="body"
                        tabular
                        color={color}
                        style={{ fontWeight: '500', fontSize: 15 }}
                      >
                        {formatMoney(bar.amount)}
                      </Text>
                    </View>
                    <BarFill
                      pct={bar.amount / max}
                      color={color}
                      track={theme.colors.bgElevated}
                      height={8}
                      delay={280 + position * 130}
                    />
                  </Rise>
                );
              })}
            </View>
            <View style={{ height: 28 }} />
            {narration(620)}
          </View>
        );
      }

      case 'fun_fact': {
        const day = `${weekdayName(slide.day, language)} ${Number(slide.day.slice(8, 10))}`;
        return (
          <View>
            <Rise delay={0}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  alignSelf: 'flex-start',
                  gap: 6,
                  paddingVertical: 5,
                  paddingHorizontal: 11,
                  borderRadius: 100,
                  backgroundColor: accentBg,
                }}
              >
                <Icon name="sparkles" size={12} color={accentFg} />
                <Text
                  variant="micro"
                  uppercase
                  color={accentFg}
                  style={{ fontSize: 10.5, letterSpacing: 1.05 }}
                >
                  {t('assistant.corte.stories.funFactPill')}
                </Text>
              </View>
            </Rise>
            <View style={{ height: 26 }} />
            <Rise delay={140}>
              <Text
                variant="display"
                style={{ fontSize: 26, lineHeight: 31, letterSpacing: -0.65 }}
              >
                {t('assistant.corte.stories.funFactTitle', { day })}
              </Text>
            </Rise>
            <View style={{ height: 20 }} />
            <BigNum color={accentFg} size={50} delay={300}>
              {formatMoney(slide.amount)}
            </BigNum>
            <View style={{ height: 22 }} />
            {narration(480)}
          </View>
        );
      }

      case 'pulse': {
        const pct = Math.round(Math.abs(slide.deltaPct) * 100);
        const less = slide.deltaPct <= 0;
        const max = Math.max(slide.current, slide.previous, 1);
        const previousMonth = monthName(shiftMonth(`${corte.period}-01`, -1), language);
        const bars = [
          { label: previousMonth, value: slide.previous, muted: true },
          { label: month, value: slide.current, muted: false },
        ];
        return (
          <View>
            <Kicker color={accentFg}>{t('assistant.corte.stories.kickerPulse')}</Kicker>
            <View style={{ height: 18 }} />
            <BigNum color={accentFg} size={62}>
              {`${less ? '−' : '+'}${pct}%`}
            </BigNum>
            <View style={{ height: 24 }} />
            <View style={{ gap: 14 }}>
              {bars.map((bar, position) => (
                <Rise key={bar.label} delay={220 + position * 120}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'baseline',
                      justifyContent: 'space-between',
                      gap: 10,
                      marginBottom: 7,
                    }}
                  >
                    <Text
                      variant="micro"
                      uppercase
                      muted
                      style={{ fontSize: 12, letterSpacing: 0.96 }}
                    >
                      {bar.label}
                    </Text>
                    <Text
                      variant="body"
                      tabular
                      color={bar.muted ? theme.colors.textTertiary : accentFg}
                      style={{ fontWeight: '500', fontSize: 14 }}
                    >
                      {formatMoney(bar.value)}
                    </Text>
                  </View>
                  <BarFill
                    pct={bar.value / max}
                    color={bar.muted ? theme.colors.bgFloat : accentFg}
                    track={theme.colors.bgElevated}
                    height={10}
                    delay={340 + position * 120}
                    border={bar.muted ? theme.colors.borderDefault : undefined}
                  />
                </Rise>
              ))}
            </View>
            <View style={{ height: 26 }} />
            {narration(620)}
            <Rise delay={760}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 7,
                  marginTop: 12,
                }}
              >
                <Icon name="info-circle" size={13} color={theme.colors.textTertiary} />
                <Text variant="caption" muted style={{ fontSize: 11.5 }}>
                  {t('assistant.corte.stories.pulseFair')}
                </Text>
              </View>
            </Rise>
          </View>
        );
      }

      case 'goal': {
        const pct = Math.round(slide.pct * 100);
        return (
          <View>
            <Kicker color={accentFg}>{t('assistant.corte.stories.kickerGoal')}</Kicker>
            <View style={{ height: 14 }} />
            <Rise delay={100}>
              <Text
                variant="display"
                style={{ fontSize: 24, lineHeight: 29, letterSpacing: -0.6 }}
              >
                {slide.name}
              </Text>
            </Rise>
            <View style={{ height: 22 }} />
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10 }}>
              <BigNum color={accentFg} size={64} delay={220}>
                {`${pct}%`}
              </BigNum>
              <Rise delay={400}>
                <Text variant="body" tabular muted style={{ fontSize: 14 }}>
                  {t('assistant.corte.stories.goalOf', {
                    amount: formatMoney(slide.target),
                  })}
                </Text>
              </Rise>
            </View>
            <View style={{ height: 20 }} />
            <Rise delay={300}>
              <BarFill
                pct={Math.min(slide.pct, 1)}
                color={accentFg}
                track={theme.colors.bgElevated}
                height={10}
                delay={420}
              />
            </Rise>
            <View style={{ height: 26 }} />
            {narration(560)}
          </View>
        );
      }

      case 'first_month':
        return (
          <View>
            <Kicker color={accentFg}>{t('assistant.corte.flat.firstMonth')}</Kicker>
            <View style={{ height: 18 }} />
            <NumIn delay={140}>
              <Text
                variant="display"
                style={{ fontSize: 32, lineHeight: 38, letterSpacing: -0.9 }}
              >
                {slide.text}
              </Text>
            </NumIn>
          </View>
        );

      case 'play': {
        const play = corte.plays.find((p) => p.id === slide.playId);
        const nextMonth = monthName(shiftMonth(`${corte.period}-01`, 1), language);
        return (
          <View>
            <Kicker color={accentFg}>
              {t('assistant.corte.stories.kickerPlay', { month: nextMonth })}
            </Kicker>
            <View style={{ height: 18 }} />
            <Rise delay={100}>
              <Text
                variant="display"
                style={{ fontSize: 25, lineHeight: 30, letterSpacing: -0.6 }}
              >
                {slide.text}
              </Text>
            </Rise>
            {play ? (
              <>
                <View style={{ height: 22 }} />
                <Rise delay={260}>
                  <PlayCard play={play} />
                </Rise>
                <View style={{ height: 20 }} />
                {play.status === 'applied' ? (
                  <Rise delay={0}>
                    <AppliedCard play={play} />
                    {onClose ? (
                      <GhostButton
                        label={t('assistant.corte.stories.backToAssistant')}
                        onPress={onClose}
                      />
                    ) : null}
                  </Rise>
                ) : (
                  <Rise delay={420}>
                    {playAction?.(play)}
                    {onClose && play.action !== 'treat' ? (
                      <GhostButton
                        label={t('assistant.corte.stories.notNow')}
                        onPress={onClose}
                      />
                    ) : null}
                  </Rise>
                )}
              </>
            ) : null}
          </View>
        );
      }
    }
  };

  return (
    <View style={{ flex: 1, overflow: 'hidden' }}>
      <Wash color={accentBg} width={width} height={height} />
      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 26 }}>
        {body()}
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// Design primitives — the shared entrance curve, staggered
// ─────────────────────────────────────────────────────────────

/**
 * The atmospheric wash: a solid accent tint (never a gradient) bleeding in
 * from the top. A capsule stands in for the design's ellipse — at 15% alpha
 * the difference is invisible and RN has no elliptical border radius.
 */
function Wash({
  color,
  width,
  height,
}: {
  color: string;
  width: number;
  height: number;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 700,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [opacity]);

  const washHeight = height * 0.68;
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: -0.3 * width,
        top: -0.18 * height,
        width: 1.6 * width,
        height: washHeight,
        borderRadius: washHeight / 2,
        backgroundColor: color,
        opacity,
      }}
    />
  );
}

/** corte-rise: fade + 18px lift on the shared curve. */
function Rise({ delay, children }: { delay: number; children: ReactNode }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(18)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 560,
        delay,
        easing: CURVE,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 560,
        delay,
        easing: CURVE,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY, delay]);
  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
}

/** corte-num-in: the protagonist's entrance — rise plus a settle from 0.94. */
function NumIn({ delay, children }: { delay: number; children: ReactNode }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(26)).current;
  const scale = useRef(new Animated.Value(0.94)).current;
  useEffect(() => {
    Animated.parallel(
      [
        [opacity, 1],
        [translateY, 0],
        [scale, 1],
      ].map(([value, toValue]) =>
        Animated.timing(value as Animated.Value, {
          toValue: toValue as number,
          duration: 620,
          delay,
          easing: CURVE,
          useNativeDriver: true,
        }),
      ),
    ).start();
  }, [opacity, translateY, scale, delay]);
  return (
    <Animated.View style={{ opacity, transform: [{ translateY }, { scale }] }}>
      {children}
    </Animated.View>
  );
}

function Kicker({ color, children }: { color: string; children: ReactNode }) {
  return (
    <Rise delay={0}>
      <Text
        variant="micro"
        uppercase
        color={color}
        style={{ fontSize: 11, fontWeight: '500', letterSpacing: 1.54 }}
      >
        {children}
      </Text>
    </Rise>
  );
}

/** The number that owns the screen — always in the story's accent. */
function BigNum({
  color,
  size,
  delay = 120,
  children,
}: {
  color: string;
  size: number;
  delay?: number;
  children: string;
}) {
  return (
    <NumIn delay={delay}>
      <Text
        tabular
        color={color}
        style={{
          fontFamily: 'Geist_500Medium',
          fontSize: size,
          lineHeight: Math.round(size * 1.02),
          letterSpacing: -0.045 * size,
        }}
      >
        {children}
      </Text>
    </NumIn>
  );
}

/** corte-bar: the fill grows from the left after its row has risen. */
function BarFill({
  pct,
  color,
  track,
  height,
  delay,
  border,
}: {
  pct: number;
  color: string;
  track: string;
  height: number;
  delay: number;
  border?: string;
}) {
  const fill = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fill, {
      toValue: 1,
      duration: 720,
      delay,
      easing: CURVE,
      // Width animation — layout, so the native driver stays off.
      useNativeDriver: false,
    }).start();
  }, [fill, delay]);

  return (
    <View
      style={{
        height,
        borderRadius: height / 2,
        backgroundColor: track,
        overflow: 'hidden',
      }}
    >
      <Animated.View
        style={{
          height: '100%',
          borderRadius: height / 2,
          backgroundColor: color,
          borderWidth: border ? 1 : 0,
          borderColor: border,
          width: fill.interpolate({
            inputRange: [0, 1],
            outputRange: ['0%', `${Math.round(Math.max(0, Math.min(1, pct)) * 100)}%`],
          }),
        }}
      />
    </View>
  );
}

/** The cover's orbital mark: three thin ellipses around the mint dot. */
function CoverMark({ stroke, dot }: { stroke: string; dot: string }) {
  return (
    <View
      style={{ width: 92, height: 92, alignItems: 'center', justifyContent: 'center' }}
    >
      <Svg width={92} height={92} viewBox="0 0 92 92" style={{ position: 'absolute' }}>
        <Ellipse
          cx={46}
          cy={46}
          rx={44}
          ry={20}
          stroke={stroke}
          strokeOpacity={0.4}
          strokeWidth={1}
          fill="none"
        />
        <Ellipse
          cx={46}
          cy={46}
          rx={44}
          ry={20}
          stroke={stroke}
          strokeOpacity={0.28}
          strokeWidth={1}
          fill="none"
          rotation={60}
          originX={46}
          originY={46}
        />
        <Ellipse
          cx={46}
          cy={46}
          rx={44}
          ry={20}
          stroke={stroke}
          strokeOpacity={0.28}
          strokeWidth={1}
          fill="none"
          rotation={120}
          originX={46}
          originY={46}
        />
      </Svg>
      <View style={{ width: 15, height: 15, borderRadius: 7.5, backgroundColor: dot }} />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// The play slide's pieces — before → after, then the action
// ─────────────────────────────────────────────────────────────

/** What the play proposes, as numbers: old cap struck through → new in mint. */
function PlayCard({ play }: { play: AgentPlay }) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const catalogs = useMovementCatalogs();

  const category =
    play.action === 'set_category_cap' || play.action === 'raise_category_cap'
      ? catalogs.categoryById[play.categoryId]
      : undefined;
  const icon =
    category?.icon ??
    (play.action === 'contribute_goal'
      ? 'pig-money'
      : play.action === 'treat'
        ? 'sparkles'
        : 'target');
  const color = category?.color ?? (play.action === 'treat' ? 'amber' : 'mint');
  const label =
    play.action === 'contribute_goal'
      ? play.goalName
      : play.action === 'treat'
        ? t('assistant.corte.stories.treatLabel')
        : t('assistant.corte.stories.capProposed');
  const amount =
    play.action === 'contribute_goal' || play.action === 'treat'
      ? play.amount
      : play.target;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
        backgroundColor: theme.colors.bgSurface,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
        borderRadius: 16,
      }}
    >
      <IconBox name={icon} color={color} size={38} iconSize={18} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          variant="micro"
          uppercase
          muted
          numberOfLines={1}
          style={{ fontSize: 10, letterSpacing: 1, marginBottom: 4 }}
        >
          {label}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
          {play.action === 'raise_category_cap' ? (
            <>
              <Text
                variant="caption"
                tabular
                muted
                style={{ fontSize: 13, textDecorationLine: 'line-through' }}
              >
                {formatMoney(play.currentTarget)}
              </Text>
              <Icon name="chevron-right" size={12} color={theme.colors.textTertiary} />
            </>
          ) : null}
          <Text
            variant="label"
            tabular
            color={theme.colors.accentMint}
            style={{ fontSize: 17 }}
          >
            {formatMoney(amount)}
          </Text>
        </View>
      </View>
    </View>
  );
}

/** The design's confirmation: check on mint, the play now lives in the app. */
function AppliedCard({ play }: { play: AgentPlay }) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 14,
        backgroundColor: theme.colors.accentMintBg,
        borderWidth: 1,
        borderColor: 'rgba(0,229,168,0.25)',
      }}
    >
      <View
        style={{
          width: 26,
          height: 26,
          borderRadius: 8,
          backgroundColor: theme.colors.accentMint,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name="check" size={14} stroke={2.6} color={ON_MINT} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text variant="body" style={{ fontWeight: '500', fontSize: 13.5 }}>
          {t('assistant.corte.stories.applied')}
        </Text>
        <Text
          variant="caption"
          color={theme.colors.textSecondary}
          style={{ fontSize: 11.5, marginTop: 2 }}
        >
          {playAmountLine(play, t)}
        </Text>
      </View>
    </View>
  );
}

function GhostButton({ label, onPress }: { label: string; onPress: () => void }) {
  const { theme } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        alignItems: 'center',
        paddingVertical: 12,
        marginTop: 6,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Text variant="label" color={theme.colors.textSecondary} style={{ fontSize: 13 }}>
        {label}
      </Text>
    </Pressable>
  );
}
