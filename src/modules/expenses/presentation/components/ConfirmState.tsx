import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Button, Icon, type IconName, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

import type { DetectedExpense } from '../../domain/types/Expense';
import { useExpenseSheetStore, type SheetMethod } from '../stores/useExpenseSheetStore';

import { DetectedCard } from './DetectedCard';

const DETECTED_VOICE: DetectedExpense[] = [
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

const DETECTED_PHOTO: DetectedExpense[] = [
  {
    id: 'p1',
    description: 'Carulla · Mercado',
    categoryName: 'Mercado',
    categoryColor: 'mint',
    amount: 68400,
    sourceName: 'BBVA Débito',
  },
];

const QUOTE_ICON: Record<SheetMethod, IconName> = {
  voice: 'sparkles',
  text: 'pencil',
  photo: 'camera',
};

type Props = {
  onSave: (items: DetectedExpense[]) => void;
  saving?: boolean;
};

export function ConfirmState({ onSave, saving = false }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const method = useExpenseSheetStore((s) => s.method);
  const transcript = useExpenseSheetStore((s) => s.transcript);

  const initial = method === 'photo' ? DETECTED_PHOTO : DETECTED_VOICE;
  const [items, setItems] = useState<DetectedExpense[]>(initial);
  const manualIds = useRef<Set<string>>(new Set());
  const nextId = useRef(0);

  useEffect(() => {
    setItems(method === 'photo' ? DETECTED_PHOTO : DETECTED_VOICE);
    manualIds.current.clear();
  }, [method]);

  const updateItem = (id: string, patch: Partial<DetectedExpense>) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  };

  const addItem = () => {
    const id = `manual-${nextId.current++}`;
    manualIds.current.add(id);
    setItems((prev) => [
      ...prev,
      {
        id,
        description: '',
        categoryName: 'Otros',
        categoryColor: 'pink',
        amount: 0,
        sourceName: 'Efectivo',
      },
    ]);
  };

  const total = items.reduce((sum, i) => sum + i.amount, 0);
  const titleKey =
    items.length === 1
      ? 'expenses.sheet.title.confirmOne'
      : 'expenses.sheet.title.confirm';

  const quoteLabel = t(`expenses.sheet.quote.${method}`);
  const quoteText =
    transcript ??
    (method === 'photo'
      ? t('expenses.sheet.photo.demoTranscript')
      : t('expenses.sheet.transcript.voice'));
  const quoteIsItalic = method !== 'photo';
  const quoteRendered = quoteIsItalic ? `"${quoteText}"` : quoteText;

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
          paddingHorizontal: 12,
          paddingVertical: 10,
        }}
      >
        <View style={{ marginTop: 1 }}>
          <Icon name={QUOTE_ICON[method]} size={14} color={theme.colors.accentPurple} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text
            variant="micro"
            muted
            uppercase
            style={{ fontSize: 10, letterSpacing: 0.8, marginBottom: 3 }}
          >
            {quoteLabel}
          </Text>
          <Text
            variant="caption"
            color={theme.colors.textSecondary}
            style={{
              fontSize: 12.5,
              fontStyle: quoteIsItalic ? 'italic' : 'normal',
              lineHeight: 17,
            }}
          >
            {quoteRendered}
          </Text>
        </View>
      </View>

      <View style={{ gap: 10 }}>
        {items.map((item) => (
          <DetectedCard
            key={item.id}
            item={item}
            manual={manualIds.current.has(item.id)}
            onChange={(patch) => updateItem(item.id, patch)}
            onRemove={() => setItems((prev) => prev.filter((i) => i.id !== item.id))}
          />
        ))}
      </View>

      <Pressable
        onPress={addItem}
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
          {formatMoney(total)}
        </Text>
      </View>

      <Button
        label={t('expenses.sheet.save')}
        loading={saving}
        full
        disabled={items.length === 0}
        onPress={() => onSave(items)}
      />
    </View>
  );
}
