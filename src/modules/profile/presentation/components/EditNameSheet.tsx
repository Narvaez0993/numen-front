import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import {
  BottomSheet,
  Button,
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
        <Button
          label={t('profile.editName.save')}
          full
          disabled={!valid}
          onPress={() => onSave(name.trim())}
        />
      </View>
    </BottomSheet>
  );
}
