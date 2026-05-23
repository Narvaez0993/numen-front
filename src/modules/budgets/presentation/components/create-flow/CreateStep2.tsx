import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Icon, IconBox, SectionLabel, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { formatCOP } from '@/shared/presentation/utils/formatCOP';

import { DashedButton } from '../DashedButton';

import type { CategoryBudget } from '../../../domain/types/Budget';

type Props = {
  techo: number;
  categories: CategoryBudget[];
  topes: Record<string, number>;
  onOpenTope: (category: CategoryBudget) => void;
  onCreateCategory: () => void;
};

export function CreateStep2({
  techo,
  categories,
  topes,
  onOpenTope,
  onCreateCategory,
}: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={{ gap: 14 }}>
      <Text
        variant="display"
        style={{ fontSize: 24, letterSpacing: -0.6, lineHeight: 30 }}
      >
        {t('budgets.create.step2.title')}
      </Text>
      <Text
        variant="body"
        color={theme.colors.textSecondary}
        style={{ fontSize: 13.5, lineHeight: 19.5 }}
      >
        {t('budgets.create.step2.subtitle')}
      </Text>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: 10,
          paddingVertical: 12,
          paddingHorizontal: 14,
          backgroundColor: theme.colors.bgFloat,
          borderWidth: 1,
          borderColor: theme.colors.borderSubtle,
          borderRadius: 12,
          marginTop: 4,
        }}
      >
        <View style={{ marginTop: 1 }}>
          <Icon
            name="sparkles"
            size={15}
            color={theme.colors.textSecondary}
            stroke={1.8}
          />
        </View>
        <Text
          variant="caption"
          color={theme.colors.textSecondary}
          style={{ flex: 1, fontSize: 11.5, lineHeight: 16.7 }}
        >
          {t('budgets.create.step2.infoPart1')}
          <Text
            variant="caption"
            style={{ fontSize: 11.5, fontWeight: '500', lineHeight: 16.7 }}
          >
            {t('budgets.create.step2.infoBold')}
          </Text>
          {t('budgets.create.step2.infoPart2')}
          <Text
            variant="caption"
            tabular
            style={{ fontSize: 11.5, fontWeight: '500', lineHeight: 16.7 }}
          >
            {formatCOP(techo)}
          </Text>
          {t('budgets.create.step2.infoPart3')}
        </Text>
      </View>

      <View style={{ paddingTop: 4 }}>
        <SectionLabel>{t('budgets.create.step2.categoriesLabel')}</SectionLabel>
        <View
          style={{
            backgroundColor: theme.colors.bgSurface,
            borderWidth: 1,
            borderColor: theme.colors.borderSubtle,
            borderRadius: 14,
            overflow: 'hidden',
          }}
        >
          {categories.map((c, i) => {
            const tope = topes[c.id];
            const hasT = tope != null && tope > 0;
            return (
              <Pressable
                key={c.id}
                onPress={() => onOpenTope(c)}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  paddingVertical: 12,
                  paddingHorizontal: 14,
                  borderBottomWidth: i === categories.length - 1 ? 0 : 1,
                  borderBottomColor: theme.colors.borderSubtle,
                  opacity: pressed ? 0.85 : 1,
                })}
              >
                <IconBox name={c.iconName} color={c.color} size={36} iconSize={16} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text variant="bodyLarge" style={{ fontSize: 13.5 }}>
                    {c.name}
                  </Text>
                  <Text
                    variant="caption"
                    color={hasT ? theme.colors.accentMint : theme.colors.textTertiary}
                    style={{
                      fontSize: 11.5,
                      marginTop: 2,
                      fontWeight: hasT ? '500' : '400',
                    }}
                  >
                    {hasT
                      ? t('budgets.create.step2.tope', { amount: formatCOP(tope) })
                      : t('budgets.create.step2.noTope')}
                  </Text>
                </View>
                {hasT ? (
                  <Icon
                    name="chevron-right"
                    size={16}
                    color={theme.colors.textTertiary}
                  />
                ) : (
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
                )}
              </Pressable>
            );
          })}
        </View>

        <View style={{ marginTop: 10 }}>
          <DashedButton
            icon="plus"
            label={t('budgets.create.step2.createCategory')}
            onPress={onCreateCategory}
          />
        </View>
      </View>
    </View>
  );
}
