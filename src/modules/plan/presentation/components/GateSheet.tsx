import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { BottomSheet, Icon, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { withAlpha } from '@/shared/presentation/theme/tokens';

type Props = {
  visible: boolean;
  title: string;
  body: string;
  onClose: () => void;
};

/**
 * The capacity gate, shown at the exact moment a Free limit is hit.
 *
 * That timing is the whole design: this is the one place an upsell is not an
 * interruption, because the user just tried to do the thing it sells. The
 * redesign took the passive Plus banner off Presupuesto for the same reason —
 * a banner asks all month; this asks once, when the answer matters.
 *
 * Monochrome like everything else now. It used to be a mint well over a green
 * button, which made the paywall the most colourful surface in the app.
 */
export function GateSheet({ visible, title, body, onClose }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const goPlus = () => {
    onClose();
    router.push('/plan');
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} maxHeight="52%">
      <View style={{ paddingHorizontal: 22, paddingTop: 8, paddingBottom: 26, gap: 16 }}>
        <View
          style={{
            width: 42,
            height: 42,
            borderRadius: 14,
            backgroundColor: withAlpha(theme.palette.acc, 0.14),
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="sparkles" size={19} stroke={1.8} color={theme.palette.acc2} />
        </View>

        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 18, fontWeight: '400', letterSpacing: -0.4 }}>
            {title}
          </Text>
          <Text
            color={theme.colors.textSecondary}
            style={{ fontSize: 13.5, lineHeight: 20 }}
          >
            {body}
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={goPlus}
          style={({ pressed }) => ({
            minHeight: 52,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 18,
            // The same solid surface every sheet commits with. A paywall does not
            // get its own colour — it gets the app's.
            backgroundColor: theme.colors.textPrimary,
            opacity: pressed ? 0.9 : 1,
          })}
        >
          <Text color={theme.colors.bgBase} style={{ fontSize: 14, fontWeight: '600' }}>
            {t('plan.gate.cta')}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={onClose}
          style={({ pressed }) => ({
            alignItems: 'center',
            minHeight: 44,
            justifyContent: 'center',
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text color={theme.colors.textTertiary} style={{ fontSize: 12.5 }}>
            {t('plan.gate.notNow')}
          </Text>
        </Pressable>
      </View>
    </BottomSheet>
  );
}
