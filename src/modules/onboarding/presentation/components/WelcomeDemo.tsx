import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { RiseIn, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { withAlpha } from '@/shared/presentation/theme/tokens';

/** One example, as the translation file writes it: the words, with the part
 *  the sentence leans on between asterisks — «almuerzo de *18 mil* con Nequi». */
export type DemoExample = {
  words: string;
  title: string;
  amount: string;
  chips: string[];
  income?: boolean;
};

type Phase = 'listen' | 'saved' | 'clear';

/** The demo's clock, in ms. One example takes about four seconds. */
const FIRST_WORD_MS = 380;
const WORD_MS = 300;
/** After the last word, before the card: the beat where it «thinks». */
const HOLD_MS = 620;
const SAVED_MS = 2400;
const CLEAR_MS = 360;

export function tokenize(words: string): { text: string; bold: boolean }[] {
  return (words.match(/\*[^*]+\*|\S+/g) ?? []).map((token) =>
    token.startsWith('*')
      ? { text: token.slice(1, -1), bold: true }
      : { text: token, bold: false },
  );
}

type Props = {
  /** Starts the loop — when the greeting has finished typing. */
  start: boolean;
  talk: SharedValue<number>;
  burst: SharedValue<number>;
  compact?: boolean;
  /** Reduce Motion: the first example, already saved, and nothing moves. */
  still?: boolean;
};

/**
 * What the welcome promises, shown instead of said: a phrase arrives word by
 * word, the way the app hears it, and becomes the movement it records — then
 * the next one. A purchase, a salary, a loan.
 *
 * It is a demonstration: nothing is heard and nothing is saved. The real thing
 * comes at the end of the setup, where an account exists to save it in.
 *
 * Cheap on purpose. This is the only part of the welcome with React state, and
 * it changes in steps — a word, the card, the next example: about five renders
 * every four seconds, of this block alone. The orb hears about them through
 * `talk` and `burst`, shared values written straight to the UI thread. Every
 * movement here is `RiseIn` or an opacity, both on the UI thread too.
 */
export function WelcomeDemo({
  start,
  talk,
  burst,
  compact = false,
  still = false,
}: Props) {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const examples = useMemo(() => {
    const raw = t('onboarding.welcome.demo.examples', { returnObjects: true });
    return Array.isArray(raw) ? (raw as DemoExample[]) : [];
  }, [t]);

  const [index, setIndex] = useState(0);
  const [words, setWords] = useState(0);
  const [phase, setPhase] = useState<Phase>('listen');
  const fade = useSharedValue(1);

  const example = examples[index];
  const tokens = useMemo(() => tokenize(example?.words ?? ''), [example]);

  // The loop: one timer at a time, each step scheduling the next.
  useEffect(() => {
    if (!start || still || examples.length === 0) return undefined;
    let ms: number;
    let next: () => void;
    if (phase === 'listen' && words < tokens.length) {
      ms = words === 0 ? FIRST_WORD_MS : WORD_MS;
      next = () => setWords((n) => n + 1);
    } else if (phase === 'listen') {
      ms = HOLD_MS;
      next = () => setPhase('saved');
    } else if (phase === 'saved') {
      ms = SAVED_MS;
      next = () => setPhase('clear');
    } else {
      ms = CLEAR_MS;
      next = () => {
        setIndex((i) => (i + 1) % examples.length);
        setWords(0);
        setPhase('listen');
      };
    }
    const id = setTimeout(next, ms);
    return () => clearTimeout(id);
  }, [start, still, examples.length, phase, words, tokens.length]);

  // The orb and the fade follow the phase — on the UI thread, once per phase.
  useEffect(() => {
    if (!start || still) return;
    talk.value = withTiming(phase === 'listen' ? 1 : 0, { duration: 260 });
    if (phase === 'saved') {
      burst.value = withSequence(
        withTiming(0, { duration: 0 }),
        withTiming(1, { duration: 900, easing: Easing.out(Easing.quad) }),
      );
    }
    fade.value = withTiming(phase === 'clear' ? 0 : 1, {
      duration: phase === 'clear' ? 320 : 160,
    });
  }, [start, still, phase, talk, burst, fade]);

  const fadeStyle = useAnimatedStyle(() => ({ opacity: fade.value }));

  if (!example) return null;

  const done = still || phase !== 'listen';
  const visible = still ? tokens.length : words;
  const phraseSize = compact ? 21 : 23;
  const quote = withAlpha(theme.colors.textPrimary, 0.45);

  return (
    <Animated.View
      accessible
      accessibilityLabel={t('onboarding.welcome.demo.a11y')}
      style={[{ minHeight: compact ? 184 : 214 }, fadeStyle]}
    >
      {start || still ? (
        <>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 9,
              marginBottom: 12,
            }}
          >
            <View
              style={{
                width: 7,
                height: 7,
                borderRadius: 4,
                backgroundColor: theme.palette.acc,
              }}
            />
            <Text
              variant="micro"
              uppercase
              color={theme.colors.textTertiary}
              style={{ letterSpacing: 2.4 }}
            >
              {t(
                done
                  ? 'onboarding.welcome.demo.saved'
                  : 'onboarding.welcome.demo.listening',
              )}
            </Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              alignItems: 'baseline',
              minHeight: Math.round(phraseSize * 1.32) * 2,
            }}
          >
            <Phrase size={phraseSize} color={quote}>
              «
            </Phrase>
            {tokens.slice(0, visible).map((token, i) => (
              <RiseIn key={`${index}-${i}`} duration={still ? 0 : 240}>
                {/* The closing quote sits against the last word, as in print. */}
                <Phrase
                  size={phraseSize}
                  bold={token.bold}
                  spaced={!done || i < visible - 1}
                >
                  {token.text}
                </Phrase>
              </RiseIn>
            ))}
            {done ? (
              <Phrase size={phraseSize} color={quote}>
                »
              </Phrase>
            ) : (
              <Caret size={phraseSize} />
            )}
          </View>

          {done ? (
            <RiseIn
              key={`card-${index}`}
              duration={still ? 0 : 380}
              style={{ marginTop: 14 }}
            >
              <DemoCard example={example} compact={compact} />
            </RiseIn>
          ) : null}
        </>
      ) : null}
    </Animated.View>
  );
}

function Phrase({
  children,
  size,
  bold = false,
  spaced = false,
  color,
}: {
  children: string;
  size: number;
  bold?: boolean;
  spaced?: boolean;
  color?: string;
}) {
  return (
    <Text
      color={color}
      style={{
        fontSize: size,
        lineHeight: Math.round(size * 1.32),
        fontWeight: bold ? '500' : '300',
        letterSpacing: -0.6,
        marginRight: spaced ? Math.round(size * 0.26) : 0,
      }}
    >
      {children}
    </Text>
  );
}

/** The cursor at the end of what has been heard, blinking on the UI thread. */
function Caret({ size }: { size: number }) {
  const { theme } = useTheme();
  const blink = useSharedValue(1);

  useEffect(() => {
    blink.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 500 }),
        withTiming(0, { duration: 0 }),
        withTiming(0, { duration: 500 }),
        withTiming(1, { duration: 0 }),
      ),
      -1,
    );
  }, [blink]);

  const style = useAnimatedStyle(() => ({ opacity: blink.value }));

  return (
    <Animated.View style={style}>
      <Text
        color={theme.palette.acc2}
        style={{ fontSize: size, lineHeight: Math.round(size * 1.32), fontWeight: '300' }}
      >
        |
      </Text>
    </Animated.View>
  );
}

/** The movement as the design's «Ya quedó» draws it: what, how much, and the
 *  three things the app filled in by itself. */
function DemoCard({ example, compact }: { example: DemoExample; compact: boolean }) {
  const { theme } = useTheme();

  return (
    <View
      style={{
        paddingVertical: compact ? 13 : 16,
        paddingHorizontal: compact ? 15 : 18,
        borderRadius: 22,
        backgroundColor: theme.colors.bgSurface,
        borderWidth: 1,
        borderColor: withAlpha(theme.palette.acc, 0.3),
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'baseline',
          gap: 12,
          marginBottom: compact ? 10 : 13,
        }}
      >
        <Text
          numberOfLines={1}
          style={{ flex: 1, fontSize: compact ? 15 : 16, fontWeight: '500' }}
        >
          {example.title}
        </Text>
        <Text
          tabular
          color={example.income ? theme.colors.accentMint : theme.colors.textPrimary}
          style={{ fontSize: compact ? 17 : 19, fontWeight: '500', letterSpacing: -0.5 }}
        >
          {example.amount}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>
        {example.chips.map((chip) => (
          <View
            key={chip}
            style={{
              minHeight: 30,
              justifyContent: 'center',
              paddingHorizontal: 11,
              borderRadius: 12,
              backgroundColor: theme.colors.bgSurface,
              borderWidth: 1,
              borderColor: theme.colors.borderSubtle,
            }}
          >
            <Text color={theme.colors.textSecondary} style={{ fontSize: 12 }}>
              {chip}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
