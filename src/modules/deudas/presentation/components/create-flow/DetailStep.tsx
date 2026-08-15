import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, TextInput, View } from 'react-native';

import type { CurrencyCode } from '@/shared/domain';
import { SheetFieldRow, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

import type { DebtDirection } from '../../../domain';
import { initialOf } from '../../../domain';
import { debtTone } from '../../utils/debtTone';

import type { PersonPick } from './personPick';

type Props = {
  direction: DebtDirection;
  isShared: boolean;
  amount: number;
  currency: CurrencyCode;
  persons: PersonPick[];
  note: string;
  onNote: (next: string) => void;
  /** Resolved by the sheet that owns the picker — see `onPickAccount`. */
  accountLabel: string;
  onPickAccount: () => void;
  remind: boolean;
  onRemind: (next: boolean) => void;
  remindInDays: number;
};

/**
 * The last step: what it was for, where the cash moved, and whether to be
 * reminded — then the whole thing said back in one line.
 *
 * **"Queda así" is the point of this step.** Everything above it is a field, and
 * fields are easy to fill in wrong; the card underneath is the debt as it will
 * be saved, with the person, the reason and the signed amount together. It is
 * cheaper to read one line than to re-check three rows.
 *
 * A split has no "salió de". The bill already left as one expense — that is what
 * makes it a split rather than four loans — so offering an account here would
 * ask the user to move money that has already moved.
 *
 * The account list itself belongs to the sheet above, not here. A `Modal` opened
 * from inside a sheet's body is the one arrangement this app has been burned by
 * three times; `overlays` is the slot that is known to work, and it is one level
 * up.
 */
export function DetailStep({
  direction,
  isShared,
  amount,
  currency,
  persons,
  note,
  onNote,
  accountLabel,
  onPickAccount,
  remind,
  onRemind,
  remindInDays,
}: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const tone = debtTone(theme, direction);
  const incoming = direction === 'incoming';

  const who = isShared
    ? t('deudas.create.summaryShared', { count: persons.length })
    : (persons[0]?.name ?? '');

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingTop: 22, paddingBottom: 8 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={{ paddingHorizontal: 24, gap: 10 }}>
        <SheetFieldRow
          label={t(isShared ? 'deudas.create.eventName' : 'deudas.create.why')}
          onPress={() => undefined}
        >
          <TextInput
            value={note}
            onChangeText={onNote}
            placeholder={t(
              isShared
                ? 'deudas.create.eventPlaceholder'
                : 'deudas.create.whyPlaceholder',
            )}
            placeholderTextColor={theme.colors.textTertiary}
            maxLength={60}
            selectionColor={theme.palette.acc}
            style={{
              flex: 1,
              textAlign: 'right',
              fontSize: 13.5,
              color: theme.colors.textPrimary,
              fontFamily: 'Geist_400Regular',
              padding: 0,
            }}
          />
        </SheetFieldRow>

        {isShared ? null : (
          <SheetFieldRow
            label={t(incoming ? 'deudas.create.cameFrom' : 'deudas.create.wentTo')}
            value={accountLabel}
            chevron
            onPress={onPickAccount}
          />
        )}

        <Pressable
          accessibilityRole="switch"
          accessibilityState={{ checked: remind }}
          onPress={() => onRemind(!remind)}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            minHeight: 44,
            paddingHorizontal: 16,
            paddingVertical: 13,
            borderRadius: 16,
            backgroundColor: theme.colors.bgSurface,
            borderWidth: 1,
            borderColor: theme.colors.borderSubtle,
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={{ fontSize: 13.5 }}>{t('deudas.create.remindMe')}</Text>
            <Text
              color={theme.colors.textTertiary}
              style={{ fontSize: 11, marginTop: 2 }}
            >
              {t('deudas.create.remindMeHint', { count: remindInDays })}
            </Text>
          </View>
          <View
            style={{
              width: 46,
              height: 28,
              borderRadius: 14,
              paddingHorizontal: 3,
              justifyContent: 'center',
              alignItems: remind ? 'flex-end' : 'flex-start',
              backgroundColor: remind ? theme.palette.acc : theme.colors.bgElevated,
            }}
          >
            <View
              style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                backgroundColor: remind ? theme.colors.bgBase : theme.colors.textTertiary,
              }}
            />
          </View>
        </Pressable>
      </View>

      <View style={{ paddingHorizontal: 24, paddingTop: 24 }}>
        <View
          style={{
            padding: 16,
            borderRadius: 20,
            backgroundColor: theme.colors.bgFloat,
            borderWidth: 1,
            borderColor: theme.colors.borderSubtle,
          }}
        >
          <Text
            variant="micro"
            uppercase
            color={theme.colors.textTertiary}
            style={{ letterSpacing: 2.2, marginBottom: 10 }}
          >
            {t('deudas.create.soFar')}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 13 }}>
            <View
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: theme.colors.bgElevated,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text color={tone} style={{ fontSize: 14, fontWeight: '600' }}>
                {initialOf(who)}
              </Text>
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text numberOfLines={1} style={{ fontSize: 14.5 }}>
                {t(
                  incoming
                    ? 'deudas.create.summaryOwesYou'
                    : 'deudas.create.summaryYouOwe',
                  {
                    name: who,
                  },
                )}
              </Text>
              <Text
                numberOfLines={1}
                color={theme.colors.textTertiary}
                style={{ fontSize: 11.5, marginTop: 2 }}
              >
                {note.trim() || t('deudas.create.noReason')}
              </Text>
            </View>
            <Text tabular color={tone} style={{ fontSize: 16, fontWeight: '500' }}>
              {`${incoming ? '+' : '−'}${formatMoney(amount, currency)}`}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
