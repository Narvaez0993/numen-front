import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import {
  BottomSheet,
  FieldLabel,
  Text,
  TextField,
} from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

type Props = {
  visible: boolean;
  initialName: string;
  onClose: () => void;
  onSave: (name: string) => void;
};

export function EditNameSheet({ visible, initialName, onClose, onSave }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [name, setName] = useState(initialName);

  useEffect(() => {
    if (visible) setName(initialName);
  }, [visible, initialName]);

  const valid = name.trim().length >= 2;

  return (
    <BottomSheet visible={visible} onClose={onClose} maxHeight="60%">
      <View style={{ paddingHorizontal: 22, paddingTop: 8, paddingBottom: 26, gap: 16 }}>
        <View>
          <Text variant="h1" style={{ fontSize: 16 }}>
            {t('profile.editName.title')}
          </Text>
          <Text
            variant="caption"
            color={theme.colors.textSecondary}
            style={{ marginTop: 4 }}
          >
            {t('profile.editName.subtitle')}
          </Text>
        </View>
        <View>
          <FieldLabel label={t('profile.editName.label')} />
          <TextField
            value={name}
            onChangeText={setName}
            placeholder={t('profile.editName.placeholder')}
            autoFocus
          />
        </View>
        {/* The same solid surface every sheet commits with — the green `Button`
            this replaces was the last of the old system left inside Perfil. */}
        <Pressable
          accessibilityRole="button"
          disabled={!valid}
          onPress={() => onSave(name.trim())}
          style={({ pressed }) => ({
            minHeight: 52,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 18,
            backgroundColor: theme.colors.textPrimary,
            opacity: valid ? (pressed ? 0.9 : 1) : 0.4,
          })}
        >
          <Text
            color={theme.colors.bgBase}
            style={{ fontSize: 14, fontFamily: 'Geist_500Medium' }}
          >
            {t('profile.editName.save')}
          </Text>
        </Pressable>
      </View>
    </BottomSheet>
  );
}
