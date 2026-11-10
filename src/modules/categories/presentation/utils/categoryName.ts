import type { TFunction } from 'i18next';

import { isStandardCategoryId } from '../../domain';

/**
 * The name to show for a category — the one place it is decided (HU-10).
 *
 * A standard category is named by its stable id, in the language the app is in:
 * the server only knows its Spanish name, so an English user used to pick
 * «Mercado» and «Comida fuera». One of the user's own categories is shown
 * exactly as they wrote it.
 *
 * It takes an id and a name rather than a `Category` because names also arrive
 * inside other payloads — a play of the Corte, a cap alert — next to the id.
 */
export function categoryName(
  id: string | null | undefined,
  name: string,
  t: TFunction,
): string {
  return isStandardCategoryId(id) ? t(`categories.standard.${id}`) : name;
}
