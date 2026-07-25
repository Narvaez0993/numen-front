import type { AccentColor } from '@/shared/domain';

/** Icon + color choices shared by the category creators (categories & budgets). */
export const CATEGORY_ICON_OPTIONS: string[] = [
  'heart',
  'bolt',
  'school',
  'home-2',
  'star',
  'tag',
  'device-tv',
  'brand-spotify',
  'notebook',
  'cash',
  'building-bank',
  'dots',
];

export const CATEGORY_COLOR_OPTIONS = [
  'mint',
  'coral',
  'purple',
  'amber',
  'pink',
] as const satisfies readonly AccentColor[];
