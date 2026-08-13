import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable } from 'react-native';

import type { CurrencyCode } from '@/shared/domain';
import {
  AmountSheet,
  Icon,
  SheetFieldRow,
  SheetHeaderButton,
  Text,
} from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { withAlpha } from '@/shared/presentation/theme/tokens';
import { formatMoney } from '@/shared/presentation/utils/formatMoney';

import type { CandidateCategory } from '../../hooks/useWatchedCategories';

import { AddVigilanceBody } from './AddVigilanceSheet';

/** What is being capped, once it is known. */
export type CapTarget = {
  categoryId: string;
  name: string;
  spent: number;
};

type Props = {
  visible: boolean;
  /** Set when editing an existing cap; `null` opens on the category picker. */
  target: CapTarget | null;
  /** Only used while picking. */
  candidates: CandidateCategory[];
  current: number;
  currency: CurrencyCode;
  saving?: boolean;
  onClose: () => void;
  onSave: (categoryId: string, amount: number) => void;
  onDelete?: () => void;
};

/**
 * Putting a cap on a category — `CREAR`, which the bundle draws once for
 * subscription, account, category, goal and cap alike.
 *
 * It replaced a sheet with its own everything: a centred amount over a green
 * rule, a row of preset pills, a mint button. Three of those said "this screen
 * is its own place", and the whole redesign says the opposite — money is
 * entered one way in this app, and the way is an amount at the top with the pad
 * at the bottom.
 *
 * The presets went with it. What replaced them is the line under the amount:
 * knowing you have already spent $5.000 of what you are about to cap is worth
 * more than four round numbers someone else chose, and it is the number the
 * decision actually turns on.
 *
 * Picking WHICH category is a step inside this sheet, not another one. Two
 * modals handing over on a timer is a race whichever delay you pick.
 */
export function CapSheet({
  visible,
  target,
  candidates,
  current,
  currency,
  saving = false,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const [picked, setPicked] = useState<CapTarget | null>(target);
  const [digits, setDigits] = useState(current > 0 ? String(current) : '');

  // Each opening starts from what it was opened for, not from the last one.
  useEffect(() => {
    if (visible) {
      setPicked(target);
      setDigits(current > 0 ? String(current) : '');
    }
  }, [visible, target, current]);

  const amount = Number(digits || '0');
  const editing = target !== null;

  const close = () => {
    onClose();
  };

  return (
    <AmountSheet
      visible={visible}
      onClose={close}
      digits={digits}
      onDigits={setDigits}
      currency={currency}
      label={t('budgets.capSheet.label')}
      help={
        picked !== null
          ? t('budgets.editTopeSheet.carry', {
              amount: formatMoney(picked.spent, currency),
            })
          : undefined
      }
      primaryLabel={t(
        editing ? 'budgets.editTopeSheet.save' : 'budgets.editTopeSheet.activate',
      )}
      onPrimary={() => picked !== null && onSave(picked.categoryId, amount)}
      primaryDisabled={saving || picked === null || amount <= 0}
      header={
        <>
          <SheetHeaderButton icon="x" label={t('common.close')} onPress={close} />
          <Text numberOfLines={1} style={{ flex: 1, fontSize: 16, fontWeight: '500' }}>
            {picked === null
              ? t('budgets.addVigilance.title')
              : t('budgets.editTopeSheet.title', { name: picked.name })}
          </Text>
          {editing && onDelete ? (
            <Pressable
              accessibilityRole="button"
              onPress={onDelete}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: 7,
                minHeight: 40,
                paddingHorizontal: 14,
                borderRadius: 14,
                backgroundColor: withAlpha(theme.colors.accentCoral, 0.12),
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Icon
                name="trash"
                size={14}
                stroke={1.9}
                color={theme.colors.accentCoral}
              />
              <Text
                color={theme.colors.accentCoral}
                style={{ fontSize: 12.5, fontWeight: '500' }}
              >
                {t('expenses.correct.remove')}
              </Text>
            </Pressable>
          ) : null}
        </>
      }
      // Nothing to cap yet: the sheet asks which category, in its own body.
      replaceBody={
        picked === null ? (
          <AddVigilanceBody
            candidates={candidates}
            onPick={(category) =>
              setPicked({
                categoryId: category.id,
                name: category.name,
                spent: category.spent,
              })
            }
          />
        ) : undefined
      }
    >
      {/* Only while adding: an existing cap belongs to its category, and letting
          the row move it would silently retarget a cap instead of making one. */}
      {editing ? null : (
        <SheetFieldRow
          label={t('budgets.capSheet.category')}
          value={picked?.name ?? '—'}
          chevron
          onPress={() => setPicked(null)}
        />
      )}
    </AmountSheet>
  );
}
