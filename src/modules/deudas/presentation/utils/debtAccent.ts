import type { Theme } from '@/shared/presentation/theme';

/**
 * What a debt is painted with, and it is the palette's accent — the same one
 * every other list in the redesign uses.
 *
 * It used to be a pair: mint for "me deben", amber for "yo debo". Both come from
 * the **old** system, and mint in particular is the income colour, which says
 * something false here — money someone owes you has not arrived, and money you
 * owe is not an expense. The screen was announcing a deposit that never
 * happened.
 *
 * Nothing is lost by dropping the pair. The tab says which side you are on, the
 * label over the total repeats it, and every row carries "Te debe" or "Le debes"
 * under the name. Three words already answer what a colour was guessing at, and
 * `TxRow` reached the same conclusion one stage earlier: one accent for the
 * whole list, so it is scanned by its numbers.
 */
export function debtAccent(theme: Theme): string {
  return theme.palette.acc;
}

/** The dimmer accent, for a glyph inside a tinted disc. */
export function debtAccentSoft(theme: Theme): string {
  return theme.palette.acc2;
}
