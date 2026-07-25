export const BUDGET_TECHO_PRESETS = [
  1500000, 2000000, 2500000, 3000000, 4000000, 5000000,
];

export const CATEGORY_TOPE_PRESETS: Record<string, number[]> = {
  cafe: [50000, 100000, 200000, 300000],
  subs: [50000, 100000, 150000, 200000],
  mercado: [300000, 500000, 700000, 1000000],
  domicilios: [100000, 200000, 300000, 500000],
  transporte: [80000, 150000, 250000, 400000],
  entret: [50000, 100000, 200000, 400000],
};

export const GENERIC_TOPE_PRESETS = [50000, 100000, 200000, 300000];

export const TECHO_MIN = 50000;
export const TOPE_MIN = 10000;

export {
  CATEGORY_ICON_OPTIONS,
  CATEGORY_COLOR_OPTIONS,
} from '@/shared/presentation/constants/categoryOptions';
