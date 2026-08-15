import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, TextInput, View } from 'react-native';

import type { CurrencyCode } from '@/shared/domain';
import { Icon, Text } from '@/shared/presentation/components';
import { accentColorKey, useTheme } from '@/shared/presentation/theme';
import { withAlpha } from '@/shared/presentation/theme/tokens';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

import { initialOf } from '../../../domain';

import { pickKey, type PersonPick } from './personPick';

type Props = {
  amount: number;
  currency: CurrencyCode;
  persons: PersonPick[];
  splits: Record<string, number>;
  /** What is left for the user once everyone else's share is taken out. */
  yoShare: number;
  onEditSplit: (key: string, value: number) => void;
  onEqualSplit: () => void;
  onYoPongoMas: () => void;
};

const groupThousands = (value: number) =>
  value > 0 ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '';

/**
 * How a shared bill divides.
 *
 * The user's own share is **never typed** — it is whatever is left after
 * everyone else's, shown and not editable. That is the one rule that keeps the
 * arithmetic honest: with every row editable the sum drifts away from the total
 * and the screen has to argue with you about it. Here it cannot: change anyone's
 * share and yours absorbs the difference, and the only invalid state left is
 * owing more than the bill, which turns your row red.
 *
 * The two shortcuts on top exist because they are what actually happens — an
 * even split, or one person covering more. Everything else is typing.
 */
export function SplitStep({
  amount,
  currency,
  persons,
  splits,
  yoShare,
  onEditSplit,
  onEqualSplit,
  onYoPongoMas,
}: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const each = Math.floor(amount / (persons.length + 1) / 100) * 100;
  const over = yoShare < 0;

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingTop: 20, paddingBottom: 8 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 22 }}>
        <Shortcut
          icon="equal"
          label={t('deudas.create.equalSplit', { amount: formatMoney(each, currency) })}
          onPress={onEqualSplit}
        />
        <Shortcut
          icon="user-up"
          label={t('deudas.create.iPayMore')}
          onPress={onYoPongoMas}
        />
      </View>

      <View style={{ paddingHorizontal: 26, paddingTop: 22 }}>
        {persons.map((pick) => {
          const key = pickKey(pick);
          return (
            <View
              key={key}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 13,
                minHeight: 44,
                paddingVertical: 11,
                borderBottomWidth: 1,
                borderBottomColor: theme.colors.borderSubtle,
              }}
            >
              <View
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  backgroundColor: theme.colors[accentColorKey(pick.color, 'bg')],
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  color={theme.colors[accentColorKey(pick.color, 'fg')]}
                  style={{ fontSize: 13, fontWeight: '600' }}
                >
                  {initialOf(pick.name)}
                </Text>
              </View>

              <Text numberOfLines={1} style={{ flex: 1, fontSize: 14.5 }}>
                {pick.name}
              </Text>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'baseline',
                  gap: 3,
                  minWidth: 104,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 12,
                  backgroundColor: theme.colors.bgSurface,
                  borderWidth: 1,
                  borderColor: theme.colors.borderSubtle,
                }}
              >
                <Text color={theme.colors.textTertiary} style={{ fontSize: 11 }}>
                  $
                </Text>
                <TextInput
                  keyboardType="numeric"
                  inputMode="numeric"
                  value={groupThousands(splits[key] ?? 0)}
                  onChangeText={(next) => {
                    const raw = next.replace(/\D/g, '').slice(0, 10);
                    onEditSplit(key, raw === '' ? 0 : parseInt(raw, 10));
                  }}
                  placeholder="0"
                  placeholderTextColor={theme.colors.textTertiary}
                  selectionColor={theme.palette.acc}
                  style={{
                    flex: 1,
                    textAlign: 'right',
                    fontSize: 14,
                    color: theme.colors.textPrimary,
                    fontFamily: 'Geist_500Medium',
                    fontVariant: ['tabular-nums'],
                    padding: 0,
                  }}
                />
              </View>
            </View>
          );
        })}

        {/* Not a field. Yours is the remainder, and typing it would let the sum
            disagree with the bill. */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 13,
            minHeight: 44,
            paddingVertical: 13,
          }}
        >
          <View
            style={{
              width: 34,
              height: 34,
              borderRadius: 17,
              backgroundColor: withAlpha(theme.palette.acc, 0.16),
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="user" size={16} stroke={1.9} color={theme.palette.acc} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={{ fontSize: 14.5 }}>{t('deudas.create.you')}</Text>
            <Text
              color={over ? theme.colors.accentCoral : theme.colors.textTertiary}
              style={{ fontSize: 11, marginTop: 2 }}
            >
              {over
                ? t('deudas.create.splitOver', {
                    amount: formatMoney(Math.abs(yoShare), currency),
                  })
                : t('deudas.create.yourShare')}
            </Text>
          </View>
          <Text
            tabular
            color={over ? theme.colors.accentCoral : theme.colors.textPrimary}
            style={{ fontSize: 15, fontWeight: '500' }}
          >
            {formatMoney(yoShare, currency)}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

function Shortcut({
  icon,
  label,
  onPress,
}: {
  icon: string;
  label: string;
  onPress: () => void;
}) {
  const { theme } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        minHeight: 44,
        paddingHorizontal: 10,
        borderRadius: 14,
        backgroundColor: theme.colors.bgSurface,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <Icon name={icon} size={14} stroke={2} color={theme.colors.textSecondary} />
      <Text
        numberOfLines={1}
        color={theme.colors.textSecondary}
        style={{ fontSize: 12, flexShrink: 1 }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
