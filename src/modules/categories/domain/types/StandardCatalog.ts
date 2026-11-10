/**
 * The ids of the standard catalog, mirror of the server's `standard_catalog.py`.
 *
 * They are stable slugs, never translated: movements, caps and the agent all
 * reference them. The server sends each standard category with its Spanish
 * name, so the name a user reads is looked up by this id in the app's own
 * language (HU-10). A category the user created has a uuid for an id and keeps
 * the name they gave it.
 */
export const STANDARD_CATEGORY_IDS = [
  'mercado',
  'domi',
  'transporte',
  'comida',
  'cafe',
  'entret',
  'subs',
  'servicios',
  'salud',
  'educacion',
  'hogar',
  'otros',
  'salario',
  'freelance',
  'otro_ingreso',
] as const;

export type StandardCategoryId = (typeof STANDARD_CATEGORY_IDS)[number];

const STANDARD = new Set<string>(STANDARD_CATEGORY_IDS);

export function isStandardCategoryId(
  id: string | null | undefined,
): id is StandardCategoryId {
  return id != null && STANDARD.has(id);
}
