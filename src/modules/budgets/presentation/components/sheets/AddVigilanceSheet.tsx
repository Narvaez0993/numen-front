import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';

import { BottomSheet, Icon, IconBox, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

import { SheetHeader } from './SheetHeader';

import type { CandidateCategory } from '../../hooks/useWatchedCategories';

type BodyProps = {
  /** Already filtered to what is not watched yet, most expensive first. */
  candidates: CandidateCategory[];
  onPick: (category: CandidateCategory) => void;
};

type Props = BodyProps & {
  visible: boolean;
  onClose: () => void;
};

/** The picker without a sheet around it, so the cap step can replace it inside
 *  the same one rather than opening a second `Modal`. */
export function AddVigilanceBody({ candidates, onPick }: BodyProps) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const available = candidates;

  return (
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
              <IconBox name={c.icon} color={c.color} size={36} iconSize={17} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text variant="bodyLarge" style={{ fontSize: 14 }}>
                  {c.name}
                </Text>
                <Text
                  variant="caption"
                  color={theme.colors.textTertiary}
                  style={{ fontSize: 11.5, marginTop: 2 }}
                >
                  {t('budgets.addVigilance.spent', { amount: formatMoney(c.spent) })}
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
  );
}

export function AddVigilanceSheet({ visible, onClose, ...body }: Props) {
  return (
    <BottomSheet visible={visible} onClose={onClose} maxHeight="82%">
      <AddVigilanceBody {...body} />
    </BottomSheet>
  );
}
