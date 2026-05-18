import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Icon, IconBox, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { formatCOP } from '@/shared/presentation/utils/formatCOP';

import type { DetectedExpense } from '../../domain/types/Expense';

import { EditChip } from './EditChip';

type Props = {
  item: DetectedExpense;
  onRemove: () => void;
};

export function DetectedCard({ item, onRemove }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();

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
        <IconBox name="sparkles" color="purple" size={32} iconSize={15} radius={10} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text variant="bodyLarge" numberOfLines={1}>
            {item.description}
          </Text>
          <Text variant="caption" muted style={{ marginTop: 2, fontSize: 11 }}>
            {t('expenses.sheet.detectedAuto')}
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
        <EditChip icon="tag" color={item.categoryColor} label={item.categoryName} />
        <EditChip icon="credit-card" color="neutral" label={item.sourceName} />
      </View>

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
        <Text variant="bodyLarge" tabular style={{ fontSize: 16 }}>
          {formatCOP(item.amount)}
        </Text>
      </View>
    </View>
  );
}
