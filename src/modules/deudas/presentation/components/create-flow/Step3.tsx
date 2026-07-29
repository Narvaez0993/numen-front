import { useTranslation } from 'react-i18next';
import { Pressable, TextInput, View } from 'react-native';

import { Icon, SectionLabel, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

import { pickKey, type PersonPick } from './personPick';

import { PersonAvatar } from '../PersonAvatar';
import { YoAvatar } from '../YoAvatar';

type Props = {
  amount: number;
  persons: PersonPick[];
  splits: Record<string, number>;
  yoShare: number;
  splitsSum: number;
  isEqual: boolean;
  splitValid: boolean;
  splitOverage: boolean;
  onEditSplit: (id: string, v: number) => void;
  onEqualSplit: () => void;
  onYoPongoMas: () => void;
};

const formatThousands = (n: number) =>
  n > 0 ? n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '';

export function Step3({
  amount,
  persons,
  splits,
  yoShare,
  splitsSum,
  isEqual,
  splitValid,
  splitOverage,
  onEditSplit,
  onEqualSplit,
  onYoPongoMas,
}: Props) {
  const { theme, mode } = useTheme();
  const { t } = useTranslation();
  const n = persons.length + 1;
  const eachEqual = Math.floor(amount / n / 100) * 100;

  const mintAlpha = (a: number) =>
    mode === 'dark' ? `rgba(0,229,168,${a})` : `rgba(0,181,137,${a})`;
  const coralAlpha = (a: number) =>
    mode === 'dark' ? `rgba(255,107,71,${a})` : `rgba(224,77,36,${a})`;

  return (
    <View style={{ gap: 16 }}>
      <View>
        <Text
          style={{
            fontSize: 24,
            fontWeight: '500',
            letterSpacing: -0.6,
            marginBottom: 8,
          }}
        >
          {t('deudas.create.step3.title')}
        </Text>
        <Text
          color={theme.colors.textSecondary}
          style={{ fontSize: 13, lineHeight: 18.85 }}
        >
          {t('deudas.create.step3.subtitle', {
            amount: formatMoney(amount),
            count: n,
          })}
        </Text>
      </View>

      <View style={{ gap: 8 }}>
        <Pressable
          onPress={onEqualSplit}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            paddingVertical: 11,
            paddingHorizontal: 14,
            backgroundColor: isEqual ? mintAlpha(0.12) : theme.colors.bgSurface,
            borderWidth: 1,
            borderColor: isEqual ? mintAlpha(0.25) : theme.colors.borderDefault,
            borderRadius: 11,
            opacity: pressed ? 0.92 : 1,
          })}
        >
          <Icon
            name="equal"
            size={15}
            stroke={2}
            color={isEqual ? theme.colors.accentMint : theme.colors.textSecondary}
          />
          <Text
            variant="label"
            color={isEqual ? theme.colors.accentMint : theme.colors.textSecondary}
            style={{ fontSize: 12.5 }}
          >
            {t('deudas.create.step3.equalSplit', { amount: formatMoney(eachEqual) })}
          </Text>
        </Pressable>
        <Pressable
          onPress={onYoPongoMas}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            paddingVertical: 11,
            paddingHorizontal: 14,
            backgroundColor: theme.colors.bgSurface,
            borderWidth: 1,
            borderColor: theme.colors.borderDefault,
            borderRadius: 11,
            opacity: pressed ? 0.92 : 1,
          })}
        >
          <Icon name="user-up" size={15} stroke={2} color={theme.colors.textSecondary} />
          <Text
            variant="label"
            color={theme.colors.textSecondary}
            style={{ fontSize: 12.5 }}
          >
            {t('deudas.create.step3.youPayMore')}
          </Text>
        </Pressable>
      </View>

      <View style={{ gap: 8 }}>
        <SectionLabel>{t('deudas.create.step3.personsLabel')}</SectionLabel>
        <View
          style={{
            backgroundColor: theme.colors.bgSurface,
            borderWidth: 1,
            borderColor: theme.colors.borderSubtle,
            borderRadius: 16,
            overflow: 'hidden',
          }}
        >
          {/* Yo row */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              paddingVertical: 13,
              paddingHorizontal: 14,
              backgroundColor: mintAlpha(0.04),
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.borderSubtle,
            }}
          >
            <YoAvatar size={36} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text variant="label" style={{ fontSize: 14 }}>
                {t('deudas.create.step3.you')}
              </Text>
              <Text
                color={theme.colors.accentMint}
                style={{ fontSize: 11, marginTop: 2, fontFamily: 'Geist_500Medium' }}
              >
                {t('deudas.create.step3.yourPart')}
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'baseline',
                gap: 3,
                paddingVertical: 6,
                paddingHorizontal: 10,
                backgroundColor: theme.colors.bgFloat,
                borderWidth: 1,
                borderColor: theme.colors.accentMint,
                borderRadius: 9,
                minWidth: 90,
              }}
            >
              <Text color={theme.colors.textSecondary} style={{ fontSize: 11 }}>
                $
              </Text>
              <Text
                tabular
                style={{
                  flex: 1,
                  textAlign: 'right',
                  fontSize: 15,
                  fontWeight: '500',
                }}
              >
                {yoShare > 0 ? formatThousands(yoShare) : '0'}
              </Text>
            </View>
          </View>

          {persons.map((p, i) => {
            const v = splits[pickKey(p)] ?? 0;
            const display = formatThousands(v);
            const pctOfTotal = amount > 0 ? Math.round((v / amount) * 100) : 0;
            return (
              <View
                key={pickKey(p)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  paddingVertical: 13,
                  paddingHorizontal: 14,
                  borderBottomWidth: i === persons.length - 1 ? 0 : 1,
                  borderBottomColor: theme.colors.borderSubtle,
                }}
              >
                <PersonAvatar person={p} size={36} fontSize={14} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text variant="label" numberOfLines={1} style={{ fontSize: 14 }}>
                    {p.name}
                  </Text>
                  <Text
                    color={theme.colors.textTertiary}
                    style={{ fontSize: 11, marginTop: 2 }}
                  >
                    {t('deudas.create.step3.pctOfTotal', { pct: pctOfTotal })}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'baseline',
                    gap: 3,
                    paddingVertical: 6,
                    paddingHorizontal: 10,
                    backgroundColor: theme.colors.bgFloat,
                    borderWidth: 1,
                    borderColor: theme.colors.borderDefault,
                    borderRadius: 9,
                    minWidth: 90,
                  }}
                >
                  <Text color={theme.colors.textSecondary} style={{ fontSize: 11 }}>
                    $
                  </Text>
                  <TextInput
                    keyboardType="numeric"
                    inputMode="numeric"
                    value={display}
                    onChangeText={(value) => {
                      const raw = value.replace(/\D/g, '').slice(0, 10);
                      onEditSplit(pickKey(p), raw === '' ? 0 : parseInt(raw, 10));
                    }}
                    placeholder="0"
                    placeholderTextColor={theme.colors.textTertiary}
                    style={{
                      flex: 1,
                      textAlign: 'right',
                      fontSize: 15,
                      fontFamily: 'Geist_500Medium',
                      color: theme.colors.textPrimary,
                      padding: 0,
                      fontVariant: ['tabular-nums'],
                    }}
                  />
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Validation */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: 10,
          paddingHorizontal: 14,
          backgroundColor: splitOverage
            ? coralAlpha(0.08)
            : splitValid
              ? mintAlpha(0.08)
              : theme.colors.bgFloat,
          borderWidth: 1,
          borderColor: splitOverage
            ? coralAlpha(0.2)
            : splitValid
              ? mintAlpha(0.2)
              : theme.colors.borderSubtle,
          borderRadius: 12,
        }}
      >
        <Text color={theme.colors.textSecondary} style={{ fontSize: 12 }}>
          {t('deudas.create.step3.sumLabel')}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          {splitOverage ? (
            <>
              <Icon
                name="alert-triangle"
                size={13}
                stroke={2}
                color={theme.colors.accentCoral}
              />
              <Text
                tabular
                color={theme.colors.accentCoral}
                style={{ fontSize: 14, fontFamily: 'Geist_500Medium' }}
              >
                {t('deudas.create.step3.overage', {
                  amount: formatMoney(splitsSum + yoShare - amount),
                })}
              </Text>
            </>
          ) : splitValid ? (
            <>
              <Icon name="check" size={13} stroke={2.4} color={theme.colors.accentMint} />
              <Text
                tabular
                color={theme.colors.accentMint}
                style={{ fontSize: 14, fontFamily: 'Geist_500Medium' }}
              >
                {formatMoney(amount)}
              </Text>
            </>
          ) : (
            <Text
              tabular
              color={theme.colors.accentCoral}
              style={{ fontSize: 14, fontFamily: 'Geist_500Medium' }}
            >
              {t('deudas.create.step3.remaining', {
                amount: formatMoney(amount - splitsSum - yoShare),
              })}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}
