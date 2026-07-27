import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { type Objective, OBJECTIVES } from '@/shared/domain';
import { BottomSheet, SelectListInline, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

type Props = {
  visible: boolean;
  selected: Objective | null;
  onClose: () => void;
  onChange: (objective: Objective) => void;
};

/**
 * What the user came for, changeable after the onboarding.
 *
 * It has to be editable: someone who picked "get out of debt" and paid everything off
 * would otherwise be stuck with a hero about a debt they no longer have.
 */
export function ObjectivePickerSheet({ visible, selected, onClose, onChange }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <BottomSheet visible={visible} onClose={onClose} maxHeight="55%">
      <View style={{ paddingHorizontal: 22, paddingTop: 8, paddingBottom: 26, gap: 14 }}>
        <View>
          <Text variant="h1" style={{ fontSize: 16 }}>
            {t('profile.objective.title')}
          </Text>
          <Text
            variant="caption"
            color={theme.colors.textSecondary}
            style={{ marginTop: 4 }}
          >
            {t('profile.objective.subtitle')}
          </Text>
        </View>

        <SelectListInline
          options={OBJECTIVES.map((objective) => ({
            value: objective,
            label: t(`profile.objective.options.${objective}`),
          }))}
          selected={selected}
          onSelect={(value) => onChange(value as Objective)}
        />
      </View>
    </BottomSheet>
  );
}
