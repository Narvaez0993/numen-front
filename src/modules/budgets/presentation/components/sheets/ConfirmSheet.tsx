import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';

import { BottomSheet, Icon, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

type Props = {
  visible: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
};

export function ConfirmSheet({
  visible,
  title,
  body,
  confirmLabel,
  onConfirm,
  onClose,
}: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <BottomSheet visible={visible} onClose={onClose} maxHeight="55%">
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 22,
          paddingTop: 8,
          paddingBottom: 26,
        }}
      >
        <View style={{ paddingTop: 8, paddingBottom: 14, paddingRight: 40 }}>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 11,
              backgroundColor: theme.colors.accentCoralBg,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
            }}
          >
            <Icon
              name="alert-triangle"
              size={18}
              color={theme.colors.accentCoral}
              stroke={1.9}
            />
          </View>
          <Text variant="h1" style={{ fontSize: 17, marginBottom: 6 }}>
            {title}
          </Text>
          <Text
            variant="body"
            color={theme.colors.textSecondary}
            style={{ fontSize: 13, lineHeight: 18.9 }}
          >
            {body}
          </Text>
        </View>

        <Pressable
          onPress={onConfirm}
          style={({ pressed }) => ({
            width: '100%',
            backgroundColor: theme.colors.accentCoral,
            borderRadius: 14,
            paddingVertical: 14,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 8,
            opacity: pressed ? 0.9 : 1,
          })}
        >
          <Text variant="label" color="#FFFFFF" style={{ fontSize: 14 }}>
            {confirmLabel}
          </Text>
        </Pressable>

        <Pressable
          onPress={onClose}
          style={({ pressed }) => ({
            width: '100%',
            paddingVertical: 12,
            alignItems: 'center',
            marginTop: 4,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text
            variant="label"
            color={theme.colors.textSecondary}
            style={{ fontSize: 13 }}
          >
            {t('budgets.confirmSheet.cancel')}
          </Text>
        </Pressable>
      </ScrollView>
    </BottomSheet>
  );
}
