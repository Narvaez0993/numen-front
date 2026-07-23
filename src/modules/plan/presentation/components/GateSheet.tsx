import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { BottomSheet, Button, Icon, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

type Props = {
  visible: boolean;
  title: string;
  body: string;
  onClose: () => void;
};

/** Contextual capacity gate: shown at the exact moment a Free limit is hit. */
export function GateSheet({ visible, title, body, onClose }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const goPlus = () => {
    onClose();
    router.push('/plan');
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} maxHeight="52%">
      <View style={{ paddingHorizontal: 22, paddingTop: 8, paddingBottom: 26, gap: 14 }}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: theme.colors.accentMintBg,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="sparkles" size={18} color={theme.colors.accentMint} />
        </View>
        <View>
          <Text variant="h1" style={{ fontSize: 16, marginBottom: 6 }}>
            {title}
          </Text>
          <Text
            variant="caption"
            color={theme.colors.textSecondary}
            style={{ lineHeight: 18 }}
          >
            {body}
          </Text>
        </View>
        <Button label={t('plan.gate.cta')} full onPress={goPlus} />
        <Pressable
          accessibilityRole="button"
          onPress={onClose}
          style={({ pressed }) => ({
            alignItems: 'center',
            paddingVertical: 4,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text
            variant="label"
            color={theme.colors.textTertiary}
            style={{ fontSize: 12.5 }}
          >
            {t('plan.gate.notNow')}
          </Text>
        </Pressable>
      </View>
    </BottomSheet>
  );
}
