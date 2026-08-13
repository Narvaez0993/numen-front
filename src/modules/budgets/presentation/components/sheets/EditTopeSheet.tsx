import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';

import { BottomSheet, Button, IconBox, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

import {
  CATEGORY_TOPE_PRESETS,
  GENERIC_TOPE_PRESETS,
  TOPE_MIN,
} from '../../constants/presets';
import { BudgetInputHero } from '../BudgetInputHero';

import { SheetHeader } from './SheetHeader';

import type { AccentColor } from '@/shared/domain';

/**
 * A category this sheet can put a cap on — either one already watched or a candidate.
 *
 * `categoryId` is spelled out because a watched category carries **two** ids: this one and
 * the cap's own. Presets and the eventual request key off the category, never the cap.
 */
export type TopeTarget = {
  categoryId: string;
  name: string;
  icon: string;
  color: AccentColor;
  spent: number;
};

type BodyProps = {
  category: TopeTarget | null;
  current: number;
  saving?: boolean;
  onSave: (amount: number) => void;
  onDelete?: () => void;
  /** Re-seeds the amount whenever the sheet is (re)opened for a category. */
  resetKey?: unknown;
};

type Props = BodyProps & {
  visible: boolean;
  onClose: () => void;
};

/**
 * The cap form, without a sheet around it.
 *
 * It is separated so the "watch a new category" flow can show it INSIDE the
 * picker's own sheet instead of opening a second one. Two `Modal`s handing over
 * on a timer is what broke the flow: the picker was still animating out when the
 * cap sheet tried to mount, and picking a category did nothing at all.
 */
export function EditTopeBody({
  category,
  current,
  saving = false,
  onSave,
  onDelete,
  resetKey,
}: BodyProps) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [value, setValue] = useState(current);

  useEffect(() => {
    setValue(current);
  }, [current, resetKey]);

  if (!category) return null;

  const presets = CATEGORY_TOPE_PRESETS[category.categoryId] ?? GENERIC_TOPE_PRESETS;
  const isEditing = current > 0;
  const valid = value >= TOPE_MIN;

  return (
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
          name={category.icon}
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
            {t('budgets.editTopeSheet.carry', { amount: formatMoney(category.spent) })}
          </Text>
        </View>
      </View>

      <BudgetInputHero value={value} onChange={setValue} presets={presets} size="small" />

      <View style={{ marginTop: 22 }}>
        <Button
          full
          label={
            isEditing
              ? t('budgets.editTopeSheet.save')
              : t('budgets.editTopeSheet.activate')
          }
          disabled={!valid || saving}
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
  );
}

/** The same form on its own sheet — how an existing cap is edited, where there
 *  is no picker to hand over from. */
export function EditTopeSheet({ visible, onClose, ...body }: Props) {
  return (
    <BottomSheet visible={visible} onClose={onClose} maxHeight="82%">
      <EditTopeBody {...body} resetKey={visible} />
    </BottomSheet>
  );
}
