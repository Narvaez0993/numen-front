import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, TextInput, View } from 'react-native';

import {
  CategoryPickerInline,
  Icon,
  IconBox,
  OptionListInline,
  Text,
} from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

import type { DetectedExpense } from '../../domain/types/Expense';
import { ACCOUNTS, EXPENSE_CATEGORIES } from '../constants/manualOptions';

import { EditChip } from './EditChip';

type Props = {
  item: DetectedExpense;
  onRemove: () => void;
  onChange: (patch: Partial<DetectedExpense>) => void;
  manual?: boolean;
};

type ExpandedPicker = 'category' | 'source' | null;

function formatDigits(digits: string): string {
  if (!digits) return '';
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function DetectedCard({ item, onRemove, onChange, manual = false }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState<ExpandedPicker>(null);

  return (
    <View
      style={{
        backgroundColor: theme.colors.bgFloat,
        borderColor: theme.colors.borderSubtle,
        borderWidth: 1,
        borderRadius: 14,
        padding: 14,
        gap: 12,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
        <IconBox
          name={manual ? 'pencil' : 'sparkles'}
          color={manual ? 'mint' : 'purple'}
          size={32}
          iconSize={15}
          radius={10}
        />
        <View style={{ flex: 1, minWidth: 0 }}>
          <TextInput
            value={item.description}
            onChangeText={(v) => onChange({ description: v })}
            placeholder={t('expenses.sheet.manualEntry.descriptionPlaceholder')}
            placeholderTextColor={theme.colors.textTertiary}
            style={{
              fontSize: 14.5,
              color: theme.colors.textPrimary,
              fontFamily: 'Geist_500Medium',
              padding: 0,
            }}
          />
          <Text variant="caption" muted style={{ marginTop: 2, fontSize: 11 }}>
            {manual
              ? t('expenses.sheet.addedManually')
              : t('expenses.sheet.detectedAuto')}
          </Text>
        </View>
        <Pressable
          onPress={onRemove}
          hitSlop={6}
          style={({ pressed }) => ({ padding: 4, opacity: pressed ? 0.6 : 1 })}
        >
          <Icon name="trash" size={15} color={theme.colors.textTertiary} />
        </Pressable>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <EditChip
          icon="tag"
          color={item.categoryColor}
          label={item.categoryName}
          onPress={() => setExpanded((e) => (e === 'category' ? null : 'category'))}
        />
        <EditChip
          icon="credit-card"
          color="neutral"
          label={item.sourceName}
          onPress={() => setExpanded((e) => (e === 'source' ? null : 'source'))}
        />
      </View>

      {expanded === 'category' ? (
        <CategoryPickerInline
          categories={EXPENSE_CATEGORIES}
          selected={item.categoryName}
          onSelect={(name, color) => {
            onChange({ categoryName: name, categoryColor: color });
            setExpanded(null);
          }}
        />
      ) : null}
      {expanded === 'source' ? (
        <OptionListInline
          options={ACCOUNTS}
          selected={item.sourceName}
          onSelect={(value) => {
            onChange({ sourceName: value });
            setExpanded(null);
          }}
        />
      ) : null}

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: theme.colors.bgElevated,
          borderRadius: 12,
          paddingHorizontal: 14,
          paddingVertical: 10,
        }}
      >
        <Text
          variant="micro"
          muted
          uppercase
          style={{ fontSize: 11.5, letterSpacing: 0.66 }}
        >
          {t('expenses.sheet.amount')}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
          <Text variant="bodyLarge" tabular style={{ fontSize: 16 }}>
            $
          </Text>
          <TextInput
            value={formatDigits(String(item.amount || ''))}
            onChangeText={(v) =>
              onChange({ amount: Number(v.replace(/\D/g, '') || '0') })
            }
            keyboardType="number-pad"
            placeholder="0"
            placeholderTextColor={theme.colors.textTertiary}
            style={{
              fontSize: 16,
              color: theme.colors.textPrimary,
              fontFamily: 'Geist_500Medium',
              fontVariant: ['tabular-nums'],
              padding: 0,
              minWidth: 40,
              textAlign: 'right',
            }}
          />
        </View>
      </View>
    </View>
  );
}
