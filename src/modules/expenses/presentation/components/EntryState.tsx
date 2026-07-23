import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Icon, IconName, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

import { useExpenseSheetStore } from '../stores/useExpenseSheetStore';

import { RecordingMic, WaveVisualizer } from './RecordingMic';

const RECORDING_MS = 1900;
const PROCESSING_MS = 1300;

export function EntryState() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const flow = useExpenseSheetStore((s) => s.flow);
  const setFlow = useExpenseSheetStore((s) => s.setFlow);
  const setMethod = useExpenseSheetStore((s) => s.setMethod);

  const recording = flow === 'recording';
  const processing = flow === 'processing';

  const goPhoto = () => {
    setMethod('photo');
    setFlow('photo');
  };
  const goWriting = () => {
    setMethod('text');
    setFlow('writing');
  };
  const goManual = () => setFlow('manual');

  useEffect(() => {
    if (recording) {
      const id = setTimeout(() => setFlow('processing'), RECORDING_MS);
      return () => clearTimeout(id);
    }
    if (processing) {
      const id = setTimeout(() => setFlow('confirm'), PROCESSING_MS);
      return () => clearTimeout(id);
    }
  }, [recording, processing, setFlow]);

  const handleMicPress = () => {
    if (flow === 'entry') setFlow('recording');
    else if (flow === 'recording') setFlow('processing');
  };

  const title = recording
    ? t('expenses.sheet.title.recording')
    : processing
      ? t('expenses.sheet.title.processing')
      : t('expenses.sheet.title.entry');
  const sub = recording
    ? t('expenses.sheet.sub.recording')
    : processing
      ? t('expenses.sheet.sub.processing')
      : t('expenses.sheet.sub.entry');
  const micLabel = recording
    ? t('expenses.sheet.talking')
    : processing
      ? t('expenses.sheet.wait')
      : t('expenses.sheet.tapAndSpeak');

  return (
    <View style={{ paddingTop: 4 }}>
      <View style={{ paddingBottom: 4 }}>
        <Text variant="h1" style={{ fontSize: 16 }}>
          {title}
        </Text>
        <Text
          variant="caption"
          color={theme.colors.textSecondary}
          style={{ marginTop: 4 }}
        >
          {sub}
        </Text>
      </View>

      <View style={{ alignItems: 'center', paddingVertical: 22 }}>
        <RecordingMic
          state={flow as 'entry' | 'recording' | 'processing'}
          onPress={handleMicPress}
        />

        {recording ? (
          <View style={{ marginTop: 18 }}>
            <WaveVisualizer />
          </View>
        ) : null}

        <Text variant="label" style={{ marginTop: recording ? 14 : 22, fontSize: 13 }}>
          {micLabel}
        </Text>
        <Text
          variant="caption"
          muted
          style={{
            marginTop: 6,
            fontStyle: 'italic',
            textAlign: 'center',
            maxWidth: 260,
          }}
        >
          {t('expenses.sheet.hint')}
        </Text>
      </View>

      <View
        style={{
          flexDirection: 'row',
          gap: 10,
          marginTop: 12,
          opacity: flow === 'entry' ? 1 : 0.35,
        }}
        pointerEvents={flow === 'entry' ? 'auto' : 'none'}
      >
        <SecondaryBtn
          icon="camera"
          label={t('expenses.sheet.photoReceipt')}
          onPress={goPhoto}
        />
        <SecondaryBtn
          icon="pencil"
          label={t('expenses.sheet.write')}
          onPress={goWriting}
        />
        <SecondaryBtn
          icon="list-details"
          label={t('expenses.sheet.manual')}
          onPress={goManual}
        />
      </View>
    </View>
  );
}

function SecondaryBtn({
  icon,
  label,
  onPress,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
}) {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        paddingHorizontal: 12,
        backgroundColor: theme.colors.bgSurface,
        borderColor: theme.colors.borderDefault,
        borderWidth: 1,
        borderRadius: 14,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <Icon name={icon} size={17} color={theme.colors.textPrimary} />
      <Text variant="label" style={{ fontSize: 13 }}>
        {label}
      </Text>
    </Pressable>
  );
}
