import { useTranslation } from 'react-i18next';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { Icon, ListeningOrb, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

type Props = {
  visible: boolean;
  /** What the recognizer has heard so far, growing as the user speaks. */
  transcript: string;
  recording: boolean;
  /** The recognizer has really opened the mic. `recording && !listening` is the
   *  warm-up, and it needs its own words — that is the gap where people spoke
   *  and lost the start of what they said. */
  listening: boolean;
  /** 0..1 input volume, straight from the recognizer. */
  level: number;
  busy: boolean;
  permissionDenied: boolean;
  error: string | null;
  onMicPress: () => void;
  onWriteInstead: () => void;
  onClose: () => void;
};

/**
 * Speaking, on the whole screen.
 *
 * It used to be a face of the capture sheet, which meant talking happened in
 * the bottom third with the app still visible above it. The bundle gives it
 * everything, and the reason shows the moment you use it: the words appear at
 * 29px as they are recognised, and watching them land is the only feedback that
 * the app heard you correctly. Half a screen could not hold a sentence.
 *
 * Its own light, too — a bloom under the orb rather than the aurora, so the
 * glow sits where the thumb and the eye already are.
 */
export function VoiceCaptureScreen({
  visible,
  transcript,
  recording,
  listening,
  level,
  busy,
  permissionDenied,
  error,
  onMicPress,
  onWriteInstead,
  onClose,
}: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const status = busy
    ? t('expenses.voice.status.thinking')
    : recording
      ? listening
        ? t('expenses.voice.status.listening')
        : t('expenses.voice.status.opening')
      : t('expenses.voice.status.ready');

  // Before the tap it explains HOW to talk; once the mic is open it says the app
  // is ready, which is the answer to "when do I start?".
  const idlePrompt = listening
    ? t('expenses.voice.listeningPrompt')
    : t('expenses.voice.prompt');
  const body =
    error ??
    (permissionDenied ? t('expenses.voice.permission') : transcript || idlePrompt);

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: theme.surfaces.bgBase }}>
        <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
          <Defs>
            {/* Under the orb, not behind the page: the light belongs where the
                thumb is about to press. */}
            <RadialGradient id="voiceGlow" cx="0.5" cy="0.62" rx="0.8" ry="0.5">
              <Stop offset="0" stopColor={theme.palette.orb3} stopOpacity={0.34} />
              <Stop offset="0.62" stopColor={theme.palette.orb3} stopOpacity={0} />
            </RadialGradient>
            <RadialGradient id="voiceTop" cx="0.86" cy="0.12" rx="0.8" ry="0.45">
              <Stop offset="0" stopColor={theme.palette.au3} stopOpacity={0.16} />
              <Stop offset="0.62" stopColor={theme.palette.au3} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#voiceGlow)" />
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#voiceTop)" />
        </Svg>

        {/* `edges={['bottom']}` and a manual top pad, like every other
            full-screen modal here: inside a statusBarTranslucent Modal the top
            inset does not arrive reliably, and trusting it put the controls on
            top of the clock. 44 is the floor for a device that reports none. */}
        <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingHorizontal: 22,
              paddingTop: Math.max(insets.top, 44) + 8,
            }}
          >
            <Pressable
              accessibilityRole="button"
              onPress={onWriteInstead}
              style={({ pressed }) => ({
                minHeight: 44,
                justifyContent: 'center',
                paddingHorizontal: 16,
                borderRadius: 22,
                backgroundColor: theme.colors.bgFloat,
                borderWidth: 1,
                borderColor: theme.colors.borderSubtle,
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <Text color={theme.colors.textSecondary} style={{ fontSize: 12.5 }}>
                {t('expenses.voice.writeInstead')}
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
              <Icon name="x" size={15} stroke={2} color={theme.colors.textSecondary} />
            </Pressable>
          </View>

          <View style={{ paddingHorizontal: 32, paddingTop: 30 }}>
            <Text
              variant="micro"
              uppercase
              color={theme.colors.textTertiary}
              style={{ letterSpacing: 2.4, marginBottom: 16 }}
            >
              {status}
            </Text>
            <Text
              color={error ? theme.colors.accentCoral : theme.colors.textPrimary}
              style={{
                fontSize: 29,
                lineHeight: 37,
                fontWeight: '300',
                letterSpacing: -0.9,
              }}
            >
              {body}
            </Text>
          </View>

          <View style={{ flex: 1 }} />

          <View style={{ alignItems: 'center', paddingBottom: 34 }}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ busy: recording }}
              accessibilityLabel={t('expenses.voice.mic')}
              onPress={onMicPress}
              disabled={busy || (recording && !listening)}
              style={({ pressed }) => ({
                transform: [{ scale: pressed ? 0.94 : 1 }],
                opacity: busy ? 0.6 : 1,
              })}
            >
              <ListeningOrb size={96} level={level} listening={listening}>
                <Icon
                  name={recording ? 'check' : 'microphone'}
                  size={34}
                  stroke={1.8}
                  color="#FFFFFF"
                />
              </ListeningOrb>
            </Pressable>
            <Text
              color={theme.colors.textTertiary}
              style={{ fontSize: 12, marginTop: 14 }}
            >
              {!recording
                ? t('expenses.voice.tapToTalk')
                : listening
                  ? t('expenses.voice.tapToStop')
                  : t('expenses.voice.opening')}
            </Text>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
