import type { AccentColor } from '@/shared/domain';

export type BankId =
  | 'bbva'
  | 'bancolombia'
  | 'davivienda'
  | 'nu'
  | 'daviplata'
  | 'nequi'
  | 'efectivo'
  | 'otro';

export type BrandBank = {
  id: BankId;
  kind: 'brand';
  letter: string;
  brandColor: string;
};

export type IconBank = {
  id: BankId;
  kind: 'icon';
  icon: string;
  iconColor: AccentColor | 'neutral';
};

export type Bank = BrandBank | IconBank;
