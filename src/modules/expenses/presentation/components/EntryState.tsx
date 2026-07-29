import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Button, Icon, IconName, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

import { useExpenseSheetStore } from '../stores/useExpenseSheetStore';

import { PermissionRationale } from './PermissionRationale';
import { RecordingMic, WaveVisualizer } from './RecordingMic';

type Props = {
  liveTranscript: string;
  permissionDenied: boolean;
  inlineError: string | null;
  onMicPress: () => void;
};

/**
 * Entry point of the capture sheet — and since the voice slice, the real core
 * gesture: tap the mic, talk, watch your words appear, and the agent stages
 * the movement. The store's `flow` drives which face renders (entry /
 * recording / processing); manual and writing stay one tap away.
 */
export function EntryState({
  liveTranscript,
  permissionDenied,
  inlineError,
  onMicPress,
}: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const flow = useExpenseSheetStore((s) => s.flow);
  const setFlow = useExpenseSheetStore((s) => s.setFlow);

  const micState =
    flow === 'recording' ? 'recording' : flow === 'processing' ? 'processing' : 'entry';

  return (
    <View style={{ paddingTop: 4 }}>
      <View style={{ paddingBottom: 4 }}>
        <Text variant="h1" style={{ fontSize: 16 }}>
          {t('expenses.sheet.title.entry')}
        </Text>
        <Text
          variant="caption"
          color={theme.colors.textSecondary}
          style={{ marginTop: 4 }}
        >
          {t('expenses.sheet.sub.entry')}
        </Text>
      </View>

      {permissionDenied ? (
        <PermissionRationale onWriteInstead={() => setFlow('writing')} />
      ) : (
        <View style={{ alignItems: 'center', paddingVertical: 18 }}>
          <RecordingMic state={micState} onPress={onMicPress} />
          <View style={{ marginTop: 16, alignItems: 'center', gap: 8, minHeight: 52 }}>
            {flow === 'recording' ? (
              <>
                <WaveVisualizer />
                <Text
                  variant="body"
                  style={{ textAlign: 'center', maxWidth: 280 }}
                  numberOfLines={2}
                >
                  {liveTranscript || t('expenses.sheet.recordingHint')}
                </Text>
              </>
            ) : flow === 'processing' ? (
              <Text variant="caption" muted style={{ textAlign: 'center' }}>
                {t('expenses.sheet.processing')}
              </Text>
            ) : (
              <Text
                variant="caption"
                muted
                style={{ textAlign: 'center', maxWidth: 250 }}
              >
                {inlineError ?? t('expenses.sheet.voiceHint')}
              </Text>
            )}
          </View>
        </View>
      )}

      <Button label={t('expenses.sheet.manual')} full onPress={() => setFlow('manual')} />

      <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
        <MethodBtn icon="camera" label={t('expenses.sheet.photoReceipt')} soon />
        <MethodBtn
          icon="pencil"
          label={t('expenses.sheet.write')}
          onPress={() => setFlow('writing')}
        />
      </View>
    </View>
  );
}

function MethodBtn({
  icon,
  label,
  soon = false,
  onPress,
}: {
  icon: IconName;
  label: string;
  soon?: boolean;
  onPress?: () => void;
}) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: soon }}
      disabled={soon}
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        alignItems: 'center',
        gap: 4,
        paddingVertical: 12,
        paddingHorizontal: 10,
        backgroundColor: theme.colors.bgSurface,
        borderColor: theme.colors.borderDefault,
        borderWidth: 1,
        borderRadius: 14,
        opacity: soon ? 0.4 : pressed ? 0.8 : 1,
      })}
    >
      <Icon name={icon} size={17} color={theme.colors.textSecondary} />
      <Text variant="label" muted style={{ fontSize: 12 }}>
        {label}
      </Text>
      {soon ? (
        <Text variant="micro" muted style={{ fontSize: 9.5 }}>
          {t('common.soon')}
        </Text>
      ) : null}
    </Pressable>
  );
}
