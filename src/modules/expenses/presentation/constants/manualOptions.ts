import type { AccentColor } from '@/shared/domain';

export type CategoryOption = {
  name: string;
  color: AccentColor;
};

/** Visual-prototype catalogs. Replaced by real repositories when wired. */
export const EXPENSE_CATEGORIES: CategoryOption[] = [
  { name: 'Mercado', color: 'mint' },
  { name: 'Domicilios', color: 'coral' },
  { name: 'Transporte', color: 'purple' },
  { name: 'Comida fuera', color: 'pink' },
  { name: 'Café', color: 'amber' },
  { name: 'Entretenimiento', color: 'purple' },
  { name: 'Suscripciones', color: 'coral' },
  { name: 'Servicios', color: 'amber' },
  { name: 'Salud', color: 'mint' },
  { name: 'Educación', color: 'purple' },
  { name: 'Hogar', color: 'amber' },
  { name: 'Otros', color: 'pink' },
];

export const INCOME_CATEGORIES: CategoryOption[] = [
  { name: 'Salario', color: 'mint' },
  { name: 'Freelance', color: 'purple' },
  { name: 'Otro ingreso', color: 'amber' },
];

export const ACCOUNTS: string[] = [
  'BBVA Débito',
  'Bancolombia',
  'Efectivo',
  'BBVA Crédito',
];

export const DATE_OPTIONS: string[] = [
  'Hoy · 14 may',
  'Ayer · 13 may',
  'sáb 11 may',
  'vie 10 may',
];

export function categoryColor(name: string): AccentColor {
  const all = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];
  return all.find((c) => c.name === name)?.color ?? 'purple';
}
