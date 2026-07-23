import type { AccentColor } from '@/shared/domain';

export type CategoryId =
  | 'mercado'
  | 'domicilios'
  | 'transporte'
  | 'comida'
  | 'cafe'
  | 'entret'
  | 'subs'
  | 'servicios'
  | 'salud'
  | 'educacion'
  | 'hogar'
  | 'otros'
  | 'ingreso'
  | 'transfer';

export type Category = {
  id: CategoryId;
  name: string;
  iconName: string;
  color: AccentColor | 'neutral';
};

export type AccountId = 'bbva_d' | 'banco' | 'efectivo' | 'bbva_c';

export type Account = {
  id: AccountId;
  name: string;
  short: string;
};
