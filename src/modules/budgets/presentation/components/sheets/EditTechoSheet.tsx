import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';

import { BottomSheet, Button, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

import { BUDGET_TECHO_PRESETS, TECHO_MIN } from '../../constants/presets';
import { BudgetInputHero } from '../BudgetInputHero';
import { ToggleSwitch } from '../ToggleSwitch';

import { SheetHeader } from './SheetHeader';

type Props = {
  visible: boolean;
  current: number | null;
  monthName?: string;
  onClose: () => void;
  onSave: (amount: number, applyFuture: boolean) => void;
  onDelete: () => void;
};

export function EditTechoSheet({
  visible,
  current,
  monthName = 'mayo',
  onClose,
  onSave,
  onDelete,
}: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [value, setValue] = useState(current ?? 3000000);
  const [applyFuture, setApplyFuture] = useState(false);

  useEffect(() => {
    if (visible) {
      setValue(current ?? 3000000);
      setApplyFuture(false);
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

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: 12,
            marginTop: 16,
            paddingTop: 14,
            paddingBottom: 14,
            borderTopWidth: 1,
            borderTopColor: theme.colors.borderSubtle,
          }}
        >
          <View style={{ marginTop: 2 }}>
            <ToggleSwitch value={applyFuture} onChange={setApplyFuture} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text variant="bodyLarge" style={{ fontSize: 13.5 }}>
              {t('budgets.editTecho.applyFuture')}
            </Text>
            <Text
              variant="caption"
              color={theme.colors.textTertiary}
              style={{ fontSize: 11.5, marginTop: 3, lineHeight: 16.1 }}
            >
              {t('budgets.editTecho.applyFutureHint')}
            </Text>
          </View>
        </View>

        <View style={{ marginTop: 10 }}>
          <Button
            full
            label={t('budgets.editTecho.save')}
            disabled={!valid}
            onPress={() => valid && onSave(value, applyFuture)}
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
