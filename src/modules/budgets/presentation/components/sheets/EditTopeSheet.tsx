import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';

import { BottomSheet, Button, IconBox, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { formatCOP } from '@/shared/presentation/utils/formatCOP';

import {
  CATEGORY_TOPE_PRESETS,
  GENERIC_TOPE_PRESETS,
  TOPE_MIN,
} from '../../constants/presets';
import { BudgetInputHero } from '../BudgetInputHero';

import { SheetHeader } from './SheetHeader';

import type { CategoryBudget } from '../../../domain/types/Budget';

type Props = {
  visible: boolean;
  category: CategoryBudget | null;
  current: number;
  onClose: () => void;
  onSave: (amount: number) => void;
  onDelete?: () => void;
};

export function EditTopeSheet({
  visible,
  category,
  current,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [value, setValue] = useState(current);

  useEffect(() => {
    if (visible) setValue(current);
  }, [visible, current]);

  if (!category) return null;

  const presets = CATEGORY_TOPE_PRESETS[category.id] ?? GENERIC_TOPE_PRESETS;
  const isEditing = current > 0;
  const valid = value >= TOPE_MIN;

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
          title={t('budgets.editTopeSheet.title', { name: category.name })}
          subtitle={t('budgets.editTopeSheet.subtitle')}
        />

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            paddingVertical: 12,
            paddingHorizontal: 14,
            backgroundColor: theme.colors.bgFloat,
            borderWidth: 1,
            borderColor: theme.colors.borderSubtle,
            borderRadius: 12,
            marginBottom: 18,
          }}
        >
          <IconBox
            name={category.iconName}
            color={category.color}
            size={34}
            iconSize={16}
            radius={10}
          />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text variant="bodyLarge" style={{ fontSize: 13.5 }}>
              {category.name}
            </Text>
            <Text
              variant="caption"
              color={theme.colors.textTertiary}
              style={{ fontSize: 11.5, marginTop: 2 }}
            >
              {t('budgets.editTopeSheet.carry', { amount: formatCOP(category.spent) })}
            </Text>
          </View>
        </View>

        <BudgetInputHero
          value={value}
          onChange={setValue}
          presets={presets}
          size="small"
        />

        <View style={{ marginTop: 22 }}>
          <Button
            full
            label={
              isEditing
                ? t('budgets.editTopeSheet.save')
                : t('budgets.editTopeSheet.activate')
            }
            disabled={!valid}
            onPress={() => valid && onSave(value)}
          />
        </View>

        {isEditing && onDelete ? (
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
              {t('budgets.editTopeSheet.delete')}
            </Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </BottomSheet>
  );
}
