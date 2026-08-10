import { useTranslation } from 'react-i18next';
import { Pressable, TextInput, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Icon, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { withAlpha } from '@/shared/presentation/theme/tokens';

/** The bundle draws nine bars. Their resting heights are its own, kept verbatim
 *  so an idle mic looks like the design rather than a flat line. */
const BAR_RESTS = [0.36, 0.72, 1, 0.54, 0.88, 0.4, 0.66, 0.3, 0.58];

type Props = {
  /** What has been typed so far. Empty means the round button is a microphone. */
  text: string;
  onChangeText: (next: string) => void;
  recording: boolean;
  /** 0..1 input volume — moves the bars while recording. */
  level: number;
  /** Seconds elapsed, shown next to the wave. */
  elapsed: number;
  busy: boolean;
  onSend: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onCancelRecording: () => void;
};

/**
 * The bar the whole capture screen stands on.
 *
 * Speaking and typing are not two screens here — they are two states of one
 * control, and the round button on the right is the switch: a microphone while
 * the field is empty, an arrow the moment there is something to send. That is
 * the design's answer to "which way do I capture?", and it is a better one than
 * a menu, because the answer is whatever your thumb already did.
 *
 * While recording, the bar becomes the recorder: cancel, the wave, the clock,
 * and send. The wave is driven by real input volume, so it is the proof that the
 * mic is open — a looping animation would say the same thing whether or not
 * anything was being heard.
 */
export function CaptureBar({
  text,
  onChangeText,
  recording,
  level,
  elapsed,
  busy,
  onSend,
  onStartRecording,
  onStopRecording,
  onCancelRecording,
}: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const typed = text.trim().length > 0;

  if (recording) {
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          paddingVertical: 9,
          paddingLeft: 12,
          paddingRight: 9,
          borderRadius: 26,
          backgroundColor: theme.colors.bgFloat,
          borderWidth: 1,
          borderColor: withAlpha(theme.palette.acc, 0.3),
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('common.cancel')}
          onPress={onCancelRecording}
          style={({ pressed }) => ({
            width: 42,
            height: 42,
            borderRadius: 21,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <Icon name="x" size={17} stroke={2} color={theme.colors.textTertiary} />
        </Pressable>

        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 3,
            height: 26,
          }}
        >
          {BAR_RESTS.map((rest, index) => (
            <WaveBar key={index} rest={rest} level={level} index={index} />
          ))}
        </View>

        <Text tabular color={theme.colors.textSecondary} style={{ fontSize: 13 }}>
          {formatElapsed(elapsed)}
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('expenses.capture.send')}
          onPress={onStopRecording}
          style={({ pressed }) => ({
            width: 42,
            height: 42,
            borderRadius: 21,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.palette.acc,
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <Icon name="arrow-up" size={19} stroke={2} color="#FFFFFF" />
        </Pressable>
      </View>
    );
  }

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 9,
        paddingVertical: 9,
        paddingLeft: 16,
        paddingRight: 9,
        borderRadius: 26,
        backgroundColor: theme.colors.bgFloat,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
      }}
    >
      <TextInput
        value={text}
        onChangeText={onChangeText}
        placeholder={t('expenses.capture.placeholder')}
        placeholderTextColor={theme.colors.textTertiary}
        multiline
        editable={!busy}
        onSubmitEditing={typed ? onSend : undefined}
        style={{
          flex: 1,
          minHeight: 42,
          maxHeight: 110,
          paddingTop: 11,
          paddingBottom: 11,
          fontSize: 15,
          lineHeight: 21,
          color: theme.colors.textPrimary,
          fontFamily: 'Geist_400Regular',
        }}
      />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={typed ? t('expenses.capture.send') : t('expenses.voice.mic')}
        onPress={typed ? onSend : onStartRecording}
        disabled={busy}
        style={({ pressed }) => ({
          width: 42,
          height: 42,
          borderRadius: 21,
          alignItems: 'center',
          justifyContent: 'center',
          // Filled once there is something to send: the accent marks the action
          // that commits, and an empty field has nothing to commit.
          backgroundColor: typed ? theme.palette.acc : withAlpha(theme.palette.acc, 0.18),
          opacity: busy ? 0.5 : pressed ? 0.85 : 1,
        })}
      >
        <Icon
          name={typed ? 'arrow-up' : 'microphone'}
          size={19}
          stroke={1.9}
          color={typed ? '#FFFFFF' : theme.palette.acc2}
        />
      </Pressable>
    </View>
  );
}

/** One bar of the wave. Its resting height is the design's; the voice pushes it
 *  up from there, so silence still looks like the mockup. */
function WaveBar({ rest, level, index }: { rest: number; level: number; index: number }) {
  const { theme } = useTheme();
  const height = useSharedValue(rest);

  // Neighbouring bars must not move as one block — offsetting each by its
  // position turns a single volume reading into something that looks like sound
  // travelling across the bar.
  const swing = 0.35 + 0.65 * Math.abs(Math.sin(index * 1.7));
  height.value = withTiming(Math.min(rest + level * swing, 1), { duration: 110 });

  const style = useAnimatedStyle(() => ({
    height: `${height.value * 100}%`,
  }));

  return (
    <Animated.View
      style={[
        {
          flex: 1,
          borderRadius: 2,
          backgroundColor: withAlpha(theme.palette.acc, 0.55 + rest * 0.35),
        },
        style,
      ]}
    />
  );
}

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
