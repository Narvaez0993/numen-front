import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Button, Icon, IconName, Pill, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

import { useExpenseSheetStore } from '../stores/useExpenseSheetStore';

import { RecordingMic } from './RecordingMic';

/**
 * Entry point of the capture sheet.
 *
 * Voice, photo and text are the product's core gesture, but their parsing lands
 * with the assistant (phase 4) — until then they are shown as what they are,
 * coming soon, instead of a mic that records nothing into a save that saves
 * nothing. Manual entry is real and is the primary action.
 */
export function EntryState() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const setFlow = useExpenseSheetStore((s) => s.setFlow);

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

      <View style={{ alignItems: 'center', paddingVertical: 18, opacity: 0.4 }}>
        <RecordingMic state="entry" onPress={() => {}} />
        <View style={{ marginTop: 18, alignItems: 'center', gap: 6 }}>
          <Pill variant="amber">{t('common.soon')}</Pill>
          <Text variant="caption" muted style={{ textAlign: 'center', maxWidth: 250 }}>
            {t('expenses.sheet.voiceSoon')}
          </Text>
        </View>
      </View>

      <Button label={t('expenses.sheet.manual')} full onPress={() => setFlow('manual')} />

      <View style={{ flexDirection: 'row', gap: 10, marginTop: 10, opacity: 0.4 }}>
        <SoonBtn icon="camera" label={t('expenses.sheet.photoReceipt')} />
        <SoonBtn icon="pencil" label={t('expenses.sheet.write')} />
      </View>
    </View>
  );
}

function SoonBtn({ icon, label }: { icon: IconName; label: string }) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: true }}
      disabled
      style={{
        flex: 1,
        alignItems: 'center',
        gap: 4,
        paddingVertical: 12,
        paddingHorizontal: 10,
        backgroundColor: theme.colors.bgSurface,
        borderColor: theme.colors.borderDefault,
        borderWidth: 1,
        borderRadius: 14,
      }}
    >
      <Icon name={icon} size={17} color={theme.colors.textSecondary} />
      <Text variant="label" muted style={{ fontSize: 12 }}>
        {label}
      </Text>
      <Text variant="micro" muted style={{ fontSize: 9.5 }}>
        {t('common.soon')}
      </Text>
    </Pressable>
  );
}
