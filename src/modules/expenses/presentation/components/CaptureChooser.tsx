import { useTranslation } from 'react-i18next';
import { Modal, Pressable, View } from 'react-native';

import { Icon, Orb, Pill, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSpeak: () => void;
  onType: () => void;
};

/**
 * What the orb opens: how do you want to say it.
 *
 * A step that did not exist — the FAB used to drop straight into the microphone.
 * The redesign asks first because the three ways are not variations of one act:
 * speaking is a sentence the agent parses, typing is a form, and a voice note is
 * left for later. Landing on the mic made the other two feel hidden.
 *
 * It floats above the bar rather than rising from the bottom, and the close
 * button sits *above* the panel where the thumb already is — this is a menu
 * hanging off the orb, not a sheet.
 */
export function CaptureChooser({ visible, onClose, onSpeak, onType }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('common.close')}
        onPress={onClose}
        style={{ flex: 1, backgroundColor: theme.colors.scrim }}
      />

      <View
        pointerEvents="box-none"
        style={{ position: 'absolute', left: 24, right: 24, bottom: 120 }}
      >
        <View style={{ alignItems: 'flex-end', marginBottom: 14 }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('common.close')}
            onPress={onClose}
            style={({ pressed }) => ({
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: theme.colors.bgElevated,
              borderWidth: 1,
              borderColor: theme.colors.borderDefault,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <Icon name="x" size={18} stroke={2} color={theme.colors.textPrimary} />
          </Pressable>
        </View>

        <Text
          variant="micro"
          uppercase
          color={theme.colors.textTertiary}
          style={{ letterSpacing: 2.4, marginBottom: 16, paddingLeft: 4 }}
        >
          {t('expenses.chooser.title')}
        </Text>

        <View style={{ gap: 10 }}>
          <Option
            leading={
              <Orb size={42}>
                <Icon name="microphone" size={19} stroke={1.8} color="#FFFFFF" />
              </Orb>
            }
            title={t('expenses.chooser.speak.title')}
            body={t('expenses.chooser.speak.body')}
            onPress={onSpeak}
            featured
          />
          <Option
            leading={
              <Well>
                <Icon
                  name="typography"
                  size={19}
                  stroke={1.8}
                  color={theme.colors.textSecondary}
                />
              </Well>
            }
            title={t('expenses.chooser.type.title')}
            body={t('expenses.chooser.type.body')}
            onPress={onType}
          />
          <Option
            leading={
              <Well>
                <Icon
                  name="waveform"
                  size={19}
                  stroke={1.8}
                  color={theme.colors.textTertiary}
                />
              </Well>
            }
            title={t('expenses.chooser.note.title')}
            body={t('expenses.chooser.note.body')}
            // Recording now and reading it later is a different machine from
            // live dictation — audio leaves the device. It keeps its slot so the
            // shape of the menu is final, and says plainly that it is not here.
            badge={t('common.soon')}
          />
        </View>
      </View>
    </Modal>
  );
}

function Well({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  return (
    <View
      style={{
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: theme.colors.bgElevated,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {children}
    </View>
  );
}

function Option({
  leading,
  title,
  body,
  onPress,
  featured = false,
  badge,
}: {
  leading: React.ReactNode;
  title: string;
  body: string;
  onPress?: () => void;
  featured?: boolean;
  badge?: string;
}) {
  const { theme } = useTheme();
  const disabled = onPress === undefined;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
        padding: 16,
        borderRadius: 22,
        minHeight: 44,
        backgroundColor: featured ? theme.colors.bgElevated : theme.colors.bgFloat,
        borderWidth: 1,
        borderColor: featured ? theme.colors.borderDefault : theme.colors.borderSubtle,
        opacity: disabled ? 0.6 : pressed ? 0.85 : 1,
      })}
    >
      {leading}
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={{ fontSize: 15, fontWeight: '500' }}>{title}</Text>
          {badge ? (
            <Pill variant="neutral" uppercase>
              {badge}
            </Pill>
          ) : null}
        </View>
        <Text color={theme.colors.textSecondary} style={{ fontSize: 11.5, marginTop: 3 }}>
          {body}
        </Text>
      </View>
    </Pressable>
  );
}
