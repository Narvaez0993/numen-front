import type { TFunction } from 'i18next';

import {
  SOURCE_COUNT_LIMIT,
  type SourceMovementCount,
} from '@/modules/movements/application';

/**
 * What deleting an account or a card does to its movements, said before the
 * second tap (HU-07). `undefined` when there is nothing to warn about.
 *
 * The words describe what the API actually does, not a policy it does not have:
 * the source is deleted and its movements are not. They stay in the history —
 * without a source, which the detail then asks to pick — and keep counting in
 * the month (spending, income, the ceiling), because the month's figures are
 * added up from the movements. What leaves is the source's own balance, or the
 * card's debt, which is what the net balance is added up from.
 */
export function sourceDeleteWarning(
  kind: 'account' | 'card',
  name: string,
  check: SourceMovementCount,
  t: TFunction,
): string | undefined {
  if (check.checking) return t('accounts.deleteWarning.checking');
  if (check.failed) return t(`accounts.deleteWarning.${kind}Unknown`, { name });
  if (check.more) {
    return t(`accounts.deleteWarning.${kind}More`, { name, count: SOURCE_COUNT_LIMIT });
  }
  if (check.count === 0) return undefined;
  return t(`accounts.deleteWarning.${kind}`, { name, count: check.count });
}
