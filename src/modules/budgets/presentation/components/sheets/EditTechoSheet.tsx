import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';

import { BottomSheet, Button, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

import { BUDGET_TECHO_PRESETS, TECHO_MIN } from '../../constants/presets';
import { BudgetInputHero } from '../BudgetInputHero';

import { SheetHeader } from './SheetHeader';

type Props = {
  visible: boolean;
  current: number | null;
  /** The real month of the snapshot — never a hardcoded label. */
  monthName: string;
  saving?: boolean;
  onClose: () => void;
  onSave: (amount: number) => void;
  onDelete: () => void;
};

/**
 * There used to be an "apply to future months" toggle here that did nothing. It is gone
 * because that is now what a cap **is**: it stands until the user changes it, so August
 * measures against this number without anyone opting in.
 */
export function EditTechoSheet({
  visible,
  current,
  monthName,
  saving = false,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [value, setValue] = useState(current ?? 3000000);

  useEffect(() => {
    if (visible) {
      setValue(current ?? 3000000);
    }
  }, [visible, current]);

  const valid = value >= TECHO_MIN;

  return (
    <BottomSheet visible={visible} onClose={onClose} maxHeight="82%">
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 22,
          paddingTop: 8,
          paddingBottom: 26,
        }}
      >
        <SheetHeader
          title={t('budgets.editTecho.title', { month: monthName })}
          subtitle={t('budgets.editTecho.subtitle')}
        />

        <BudgetInputHero
          value={value}
          onChange={setValue}
          presets={BUDGET_TECHO_PRESETS}
          size="small"
        />

        <Text
          variant="caption"
          color={theme.colors.textTertiary}
          style={{ fontSize: 11.5, lineHeight: 16.5, marginTop: 10 }}
        >
          {t('budgets.editTecho.helper', { month: monthName })}
        </Text>

        <View style={{ marginTop: 20 }}>
          <Button
            full
            label={t('budgets.editTecho.save')}
            disabled={!valid || saving}
            onPress={() => valid && onSave(value)}
          />
        </View>

        <Pressable
          onPress={onDelete}
          style={({ pressed }) => ({
            width: '100%',
            paddingVertical: 12,
            alignItems: 'center',
            marginTop: 6,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text
            variant="label"
            color={theme.colors.accentCoral}
            style={{ fontSize: 12.5 }}
          >
            {t('budgets.editTecho.delete')}
          </Text>
        </Pressable>
      </ScrollView>
    </BottomSheet>
  );
}
