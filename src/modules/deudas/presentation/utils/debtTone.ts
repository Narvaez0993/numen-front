import type { Theme } from '@/shared/presentation/theme';

import type { DebtDirection } from '../../domain';

/**
 * The one colour a debt wears, and it comes from the **direction**, not from the
 * person.
 *
 * The design paints the amount, the progress bar and the avatar's letter with a
 * single `{{ d.color }}`, and the same token drives the total at the top — which
 * only ever means "me deben" or "yo debo". Colouring by person instead would say
 * something about Andrés rather than about the money, and a list of eight people
 * would come out as confetti, which is exactly the mistake Movimientos already
 * made once.
 *
 * People keep their own colour where it identifies them and nothing else: the
 * avatar in the picker.
 */
export function debtTone(theme: Theme, direction: DebtDirection): string {
  return direction === 'incoming' ? theme.colors.accentMint : theme.colors.accentAmber;
}
