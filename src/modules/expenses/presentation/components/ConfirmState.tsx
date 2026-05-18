import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Button, Icon, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { formatCOP } from '@/shared/presentation/utils/formatCOP';

import type { DetectedExpense } from '../../domain/types/Expense';

import { DetectedCard } from './DetectedCard';

const DETECTED_DEMO: DetectedExpense[] = [
  {
    id: 'd1',
    description: 'Taxi al trabajo',
    categoryName: 'Transporte',
    categoryColor: 'purple',
    amount: 9000,
    sourceName: 'Efectivo',
  },
  {
    id: 'd2',
    description: 'Almuerzo Juan Valdez',
    categoryName: 'Comida fuera',
    categoryColor: 'pink',
    amount: 18000,
    sourceName: 'BBVA Débito',
  },
];

type Props = {
  onSave: (items: DetectedExpense[]) => void;
  saving?: boolean;
};

export function ConfirmState({ onSave, saving = false }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [items, setItems] = useState<DetectedExpense[]>(DETECTED_DEMO);

  const total = items.reduce((sum, i) => sum + i.amount, 0);
  const titleKey =
    items.length === 1
      ? 'expenses.sheet.title.confirmOne'
      : 'expenses.sheet.title.confirm';

  return (
    <View style={{ gap: 14 }}>
      <View>
        <Text variant="h1" style={{ fontSize: 16 }}>
          {t(titleKey, { count: items.length })}
        </Text>
        <Text
          variant="caption"
          color={theme.colors.textSecondary}
          style={{ marginTop: 4 }}
        >
          {t('expenses.sheet.sub.confirm')}
        </Text>
      </View>

      <View
        style={{
          flexDirection: 'row',
          gap: 10,
          alignItems: 'flex-start',
          backgroundColor: theme.colors.bgFloat,
          borderColor: theme.colors.borderSubtle,
          borderWidth: 1,
          borderRadius: 12,
          paddingHorizontal: 14,
          paddingVertical: 12,
        }}
      >
        <View style={{ marginTop: 1 }}>
          <Icon name="sparkles" size={15} color={theme.colors.accentPurple} />
        </View>
        <Text
          variant="caption"
          color={theme.colors.textSecondary}
          style={{ flex: 1, fontStyle: 'italic', lineHeight: 17 }}
        >
          {t('expenses.sheet.quote')}
        </Text>
      </View>

      <View style={{ gap: 10 }}>
        {items.map((item) => (
          <DetectedCard
            key={item.id}
            item={item}
            onRemove={() => setItems((prev) => prev.filter((i) => i.id !== item.id))}
          />
        ))}
      </View>

      <Pressable
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          paddingVertical: 12,
          borderRadius: 14,
          borderColor: theme.colors.borderDefault,
          borderWidth: 1,
          borderStyle: 'dashed',
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <Icon name="plus" size={14} color={theme.colors.accentMint} />
        <Text variant="label" color={theme.colors.accentMint} style={{ fontSize: 12.5 }}>
          {t('expenses.sheet.addAnother')}
        </Text>
      </Pressable>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: 14,
          paddingHorizontal: 4,
          borderTopWidth: 1,
          borderTopColor: theme.colors.borderSubtle,
          marginTop: 4,
        }}
      >
        <Text variant="body" color={theme.colors.textSecondary}>
          {t('expenses.sheet.total')}
        </Text>
        <Text variant="display" tabular style={{ fontSize: 22 }}>
          {formatCOP(total)}
        </Text>
      </View>

      <Button
        label={t('expenses.sheet.save')}
        loading={saving}
        full
        onPress={() => onSave(items)}
      />
    </View>
  );
}
