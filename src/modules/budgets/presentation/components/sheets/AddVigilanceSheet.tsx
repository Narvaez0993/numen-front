import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';

import { BottomSheet, Icon, IconBox, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { formatCOP } from '@/shared/presentation/utils/formatCOP';

import { SheetHeader } from './SheetHeader';

import type { CategoryBudget } from '../../../domain/types/Budget';

type Props = {
  visible: boolean;
  categories: CategoryBudget[];
  topes: Record<string, number>;
  onClose: () => void;
  onPick: (category: CategoryBudget) => void;
};

export function AddVigilanceSheet({
  visible,
  categories,
  topes,
  onClose,
  onPick,
}: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const available = categories.filter((c) => topes[c.id] == null);

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
          title={t('budgets.addVigilance.title')}
          subtitle={t('budgets.addVigilance.subtitle')}
        />

        {available.length === 0 ? (
          <View
            style={{
              paddingVertical: 32,
              paddingHorizontal: 16,
              alignItems: 'center',
              backgroundColor: theme.colors.bgFloat,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: theme.colors.borderSubtle,
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                marginBottom: 10,
                backgroundColor: theme.colors.accentMintBg,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="check" size={20} color={theme.colors.accentMint} stroke={2} />
            </View>
            <Text variant="bodyLarge" style={{ fontSize: 13, textAlign: 'center' }}>
              {t('budgets.addVigilance.allWatchedTitle')}
            </Text>
            <Text
              variant="caption"
              color={theme.colors.textTertiary}
              style={{ fontSize: 11.5, marginTop: 4, textAlign: 'center' }}
            >
              {t('budgets.addVigilance.allWatchedHint')}
            </Text>
          </View>
        ) : (
          <View
            style={{
              backgroundColor: theme.colors.bgFloat,
              borderWidth: 1,
              borderColor: theme.colors.borderSubtle,
              borderRadius: 14,
              overflow: 'hidden',
            }}
          >
            {available.map((c, i) => (
              <Pressable
                key={c.id}
                onPress={() => onPick(c)}
                style={({ pressed }) => ({
                  paddingVertical: 13,
                  paddingHorizontal: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  borderBottomWidth: i === available.length - 1 ? 0 : 1,
                  borderBottomColor: theme.colors.borderSubtle,
                  opacity: pressed ? 0.85 : 1,
                })}
              >
                <IconBox name={c.iconName} color={c.color} size={36} iconSize={17} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text variant="bodyLarge" style={{ fontSize: 14 }}>
                    {c.name}
                  </Text>
                  <Text
                    variant="caption"
                    color={theme.colors.textTertiary}
                    style={{ fontSize: 11.5, marginTop: 2 }}
                  >
                    {t('budgets.addVigilance.spent', { amount: formatCOP(c.spent) })}
                  </Text>
                </View>
                <View
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 100,
                    borderWidth: 1,
                    borderColor: theme.colors.borderDefault,
                  }}
                >
                  <Text
                    variant="label"
                    color={theme.colors.textSecondary}
                    style={{ fontSize: 11.5 }}
                  >
                    {t('budgets.addVigilance.add')}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </BottomSheet>
  );
}
