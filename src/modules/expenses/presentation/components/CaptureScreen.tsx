import { useTranslation } from 'react-i18next';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { Icon, Text } from '@/shared/presentation/components';
import { useKeyboardInset } from '@/shared/presentation/hooks/useKeyboardInset';
import { useTheme } from '@/shared/presentation/theme';

import { CaptureBar } from './CaptureBar';
import { DetectedCard, type DetectedChip } from './DetectedCard';

export type CaptureState = 'empty' | 'recording' | 'understood';

export type DetectedCardModel = {
  id: string;
  title: string;
  amount: string;
  sign: string;
  income?: boolean;
  chips: DetectedChip[];
  fresh?: boolean;
  onEdit: () => void;
  onRemove: () => void;
};

type Props = {
  visible: boolean;
  state: CaptureState;
  /** What is in the text bar. */
  text: string;
  onChangeText: (next: string) => void;
  /** The recognizer's live output, shown while recording. */
  transcript: string;
  /** What was said, quoted back over the cards. */
  phrase: string | null;
  cards: DetectedCardModel[];
  level: number;
  elapsed: number;
  /** A whole capture that only half made it — shown above the cards. */
  notice: string | null;
  error: string | null;
  /** A parse is in flight. The bar locks; the cards already on screen stay. */
  busy: boolean;
  saving: boolean;
  onSend: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onCancelRecording: () => void;
  onRegister: () => void;
  onRetry: () => void;
  onFillByHand: () => void;
  onClose: () => void;
};

/** The three the bundle offers, as keys into the locale file. */
const EXAMPLES = ['one', 'two', 'three'] as const;

/**
 * Capturing, on one screen.
 *
 * It used to be three: a menu asking how you wanted to capture, a screen for
 * speaking, and a modal for confirming. The design has none of that structure,
 * and going back to it made the reason obvious — **the question "how do you want
 * to capture?" is one nobody has an answer to before they start.** So there is no
 * menu: the bar at the bottom takes typing, and its button is a microphone until
 * there is something to send. You capture the way your thumb already moved.
 *
 * Confirming lives here too, in the same scroll. Sending the words and reading
 * back what they became is one continuous thought, and a modal in the middle of
 * it made the app look like it had changed its mind about what you were doing.
 *
 * Three states share the space above the bar: the invitation, the dictation as
 * it is recognised, and what was understood. Only ever one of them is on screen,
 * so the bar never moves.
 */
export function CaptureScreen({
  visible,
  state,
  text,
  onChangeText,
  transcript,
  phrase,
  cards,
  level,
  elapsed,
  notice,
  error,
  busy,
  saving,
  onSend,
  onStartRecording,
  onStopRecording,
  onCancelRecording,
  onRegister,
  onRetry,
  onFillByHand,
  onClose,
}: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const keyboard = useKeyboardInset();

  const registerLabel =
    cards.length > 1
      ? t('expenses.capture.registerMany', { count: cards.length })
      : t('expenses.capture.registerOne');

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: theme.colors.bgBase }}>
        {/* The design's one light on this screen: a bloom low and centred, under
            where the thumb and the bar are. Not the app's aurora. */}
        <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
          <Defs>
            <RadialGradient id="captureGlow" cx="0.5" cy="0.58" rx="0.8" ry="0.46">
              <Stop offset="0" stopColor={theme.palette.orb3} stopOpacity={0.26} />
              <Stop offset="0.62" stopColor={theme.palette.orb3} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#captureGlow)" />
        </Svg>

        {/* Both insets are applied by hand, and neither comes from a SafeAreaView:
            inside a statusBarTranslucent Modal the top inset does not arrive at
            all, and the bottom one has to add up with the keyboard's height
            rather than stack on top of it. */}
        <View
          style={{ flex: 1, paddingBottom: keyboard.paddingBottom }}
          onLayout={keyboard.onLayout}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 20,
              paddingTop: Math.max(insets.top, 44) + 8,
            }}
          >
            <Pressable
              accessibilityRole="button"
              onPress={onFillByHand}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: 7,
                minHeight: 44,
                paddingHorizontal: 15,
                borderRadius: 22,
                backgroundColor: theme.colors.bgFloat,
                borderWidth: 1,
                borderColor: theme.colors.borderSubtle,
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <Icon
                name="note-lines"
                size={14}
                stroke={1.8}
                color={theme.colors.textSecondary}
              />
              <Text color={theme.colors.textSecondary} style={{ fontSize: 12.5 }}>
                {t('expenses.capture.byHand')}
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('common.close')}
              onPress={onClose}
              style={({ pressed }) => ({
                width: 44,
                height: 44,
                borderRadius: 22,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: theme.colors.bgFloat,
                borderWidth: 1,
                borderColor: theme.colors.borderSubtle,
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <Icon name="x" size={15} stroke={2} color={theme.colors.textTertiary} />
            </Pressable>
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 16 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {state === 'understood' ? (
              <Understood
                phrase={phrase}
                cards={cards}
                notice={notice}
                error={error}
                busy={busy}
                saving={saving}
                registerLabel={registerLabel}
                onRegister={onRegister}
                onRetry={onRetry}
              />
            ) : state === 'recording' ? (
              <Listening transcript={transcript} />
            ) : (
              <Invitation error={error} onExample={(example) => onChangeText(example)} />
            )}
          </ScrollView>

          {/* The bar never leaves. Reading back three things is exactly when
                a fourth is remembered, and a screen that had to be closed and
                reopened to take it would make the app worse than a napkin. */}
          <View
            style={{
              paddingHorizontal: 18,
              paddingBottom: Math.max(insets.bottom, 20),
            }}
          >
            <CaptureBar
              text={text}
              onChangeText={onChangeText}
              recording={state === 'recording'}
              level={level}
              elapsed={elapsed}
              busy={busy}
              onSend={onSend}
              onStartRecording={onStartRecording}
              onStopRecording={onStopRecording}
              onCancelRecording={onCancelRecording}
            />
            <Text
              color={theme.colors.textTertiary}
              style={{ fontSize: 11, textAlign: 'center', marginTop: 11 }}
            >
              {busy
                ? t('expenses.capture.foot.thinking')
                : state === 'recording'
                  ? t('expenses.capture.foot.recording')
                  : state === 'understood'
                    ? t('expenses.capture.foot.more')
                    : t('expenses.capture.foot.idle')}
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

/** Nothing captured yet: what this screen is for, and three ways to start. */
function Invitation({
  error,
  onExample,
}: {
  error: string | null;
  onExample: (text: string) => void;
}) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={{ paddingHorizontal: 30, paddingTop: 34 }}>
      <Text
        style={{ fontSize: 29, lineHeight: 37, fontWeight: '300', letterSpacing: -0.9 }}
      >
        {t('expenses.capture.title')}
      </Text>
      <Text
        color={theme.colors.textSecondary}
        style={{ fontSize: 13.5, lineHeight: 21.6, marginTop: 14 }}
      >
        {t('expenses.capture.subtitle')}
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 24 }}>
        {EXAMPLES.map((key) => {
          const example = t(`expenses.capture.examples.${key}`);
          return (
            <Pressable
              key={key}
              accessibilityRole="button"
              onPress={() => onExample(example)}
              style={({ pressed }) => ({
                minHeight: 38,
                justifyContent: 'center',
                paddingHorizontal: 14,
                borderRadius: 19,
                backgroundColor: theme.colors.bgSurface,
                borderWidth: 1,
                borderColor: theme.colors.borderSubtle,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text color={theme.colors.textSecondary} style={{ fontSize: 12.5 }}>
                {example}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {error !== null ? (
        <Text
          color={theme.colors.accentCoral}
          style={{ fontSize: 12.5, lineHeight: 18, marginTop: 20 }}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}

/** The mic is open and the words are landing. */
function Listening({ transcript }: { transcript: string }) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={{ paddingHorizontal: 30, paddingTop: 30 }}>
      <Text
        variant="micro"
        uppercase
        color={theme.colors.textTertiary}
        style={{ letterSpacing: 2.4, marginBottom: 16 }}
      >
        {t('expenses.voice.status.listening')}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <Text
          style={{ fontSize: 27, lineHeight: 35, fontWeight: '300', letterSpacing: -0.8 }}
        >
          {transcript}
        </Text>
        {/* Sits on the last word, which is the only place it means anything. */}
        <View
          style={{
            width: 2,
            height: 22,
            marginLeft: 3,
            marginBottom: 6,
            borderRadius: 1,
            backgroundColor: theme.palette.acc2,
          }}
        />
      </View>
    </View>
  );
}

/** What the agent made of it, still editable. */
function Understood({
  phrase,
  cards,
  notice,
  error,
  busy,
  saving,
  registerLabel,
  onRegister,
  onRetry,
}: {
  phrase: string | null;
  cards: DetectedCardModel[];
  notice: string | null;
  error: string | null;
  /** A parse is in flight. The bar locks; the cards already on screen stay. */
  busy: boolean;
  saving: boolean;
  registerLabel: string;
  onRegister: () => void;
  onRetry: () => void;
}) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={{ paddingHorizontal: 22, paddingTop: 26 }}>
      <View style={{ paddingHorizontal: 8, marginBottom: 6 }}>
        <Text
          variant="micro"
          uppercase
          color={theme.colors.textTertiary}
          style={{ letterSpacing: 2.4, marginBottom: 9 }}
        >
          {t('expenses.capture.understood')}
        </Text>
        {phrase !== null ? (
          <Text
            color={theme.colors.textSecondary}
            style={{ fontSize: 13.5, lineHeight: 21 }}
          >
            «{phrase}»
          </Text>
        ) : null}
        <Text color={theme.colors.textTertiary} style={{ fontSize: 11.5, marginTop: 8 }}>
          {t('expenses.capture.tapToFix')}
        </Text>
      </View>

      {notice !== null ? (
        <View
          style={{
            flexDirection: 'row',
            gap: 10,
            marginTop: 14,
            padding: 14,
            borderRadius: 18,
            backgroundColor: theme.colors.accentAmberBg,
          }}
        >
          <Icon
            name="alert-circle"
            size={16}
            stroke={1.9}
            color={theme.colors.accentAmber}
          />
          <Text
            color={theme.colors.textSecondary}
            style={{ flex: 1, fontSize: 12.5, lineHeight: 18 }}
          >
            {notice}
          </Text>
        </View>
      ) : null}

      <View style={{ gap: 10, marginTop: 16 }}>
        {cards.map((card) => (
          <DetectedCard key={card.id} {...card} />
        ))}
      </View>

      {error !== null ? (
        <Text
          color={theme.colors.accentCoral}
          style={{ fontSize: 12, lineHeight: 17, marginTop: 12 }}
        >
          {error}
        </Text>
      ) : null}

      <Pressable
        accessibilityRole="button"
        onPress={onRegister}
        disabled={saving || busy || cards.length === 0}
        style={({ pressed }) => ({
          minHeight: 54,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 18,
          marginTop: 14,
          // The one solid, un-tinted surface in the whole flow. It is the last
          // thing you touch and the only one that moves money. Locked while a
          // sentence is still being parsed, or the thing being added right now
          // would be left behind by the button that was meant to save it.
          backgroundColor: theme.colors.textPrimary,
          opacity: saving || busy || cards.length === 0 ? 0.5 : pressed ? 0.9 : 1,
        })}
      >
        <Text color={theme.colors.bgBase} style={{ fontSize: 14.5, fontWeight: '600' }}>
          {registerLabel}
        </Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        onPress={onRetry}
        disabled={saving}
        style={({ pressed }) => ({
          minHeight: 44,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Text color={theme.colors.textTertiary} style={{ fontSize: 12.5 }}>
          {t('expenses.capture.retry')}
        </Text>
      </Pressable>
    </View>
  );
}
