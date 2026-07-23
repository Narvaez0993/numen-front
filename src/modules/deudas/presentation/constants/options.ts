import type { IconName } from '@/shared/presentation/components';
import type { AccentColor } from '@/shared/domain';

export type SelectOption<T = string> = {
  value: T;
  label: string;
  icon?: IconName;
  color?: AccentColor | 'neutral';
  sub?: string;
};

export const ACCOUNT_OPTIONS: SelectOption<string>[] = [
  {
    value: 'BBVA Débito',
    label: 'BBVA Débito',
    icon: 'building-bank',
    color: 'mint',
    sub: 'Cuenta de ahorros',
  },
  {
    value: 'Bancolombia',
    label: 'Bancolombia',
    icon: 'building-bank',
    color: 'purple',
    sub: 'Cuenta corriente',
  },
  {
    value: 'Efectivo',
    label: 'Efectivo',
    icon: 'cash',
    color: 'amber',
    sub: 'Bolsillo',
  },
  {
    value: 'BBVA Crédito',
    label: 'BBVA Crédito',
    icon: 'credit-card',
    color: 'coral',
    sub: 'Tarjeta de crédito',
  },
];

export const ALL_CATEGORIES: SelectOption<string>[] = [
  {
    value: 'mercado',
    label: 'Mercado',
    icon: 'shopping-cart',
    color: 'mint',
    sub: 'Supermercados y víveres',
  },
  {
    value: 'domicilios',
    label: 'Domicilios',
    icon: 'truck',
    color: 'coral',
    sub: 'Rappi, iFood, etc.',
  },
  {
    value: 'transporte',
    label: 'Transporte',
    icon: 'car',
    color: 'purple',
    sub: 'Taxi, Uber, gasolina',
  },
  {
    value: 'comida',
    label: 'Comida fuera',
    icon: 'tools-kitchen-2',
    color: 'pink',
    sub: 'Restaurantes, almuerzos',
  },
  {
    value: 'cafe',
    label: 'Café',
    icon: 'coffee',
    color: 'amber',
    sub: 'Cafetería, tinto',
  },
  {
    value: 'entret',
    label: 'Entretenimiento',
    icon: 'movie',
    color: 'purple',
    sub: 'Cine, conciertos, salidas',
  },
  {
    value: 'subs',
    label: 'Suscripciones',
    icon: 'refresh',
    color: 'amber',
    sub: 'Netflix, Spotify, etc.',
  },
  {
    value: 'servicios',
    label: 'Servicios',
    icon: 'bolt',
    color: 'amber',
    sub: 'Internet, agua, luz',
  },
  {
    value: 'salud',
    label: 'Salud',
    icon: 'heart',
    color: 'mint',
    sub: 'Farmacia, médico',
  },
  {
    value: 'educacion',
    label: 'Educación',
    icon: 'school',
    color: 'purple',
    sub: 'Cursos, libros',
  },
  {
    value: 'hogar',
    label: 'Hogar',
    icon: 'home-2',
    color: 'mint',
    sub: 'Muebles, mantenimiento',
  },
  {
    value: 'otros',
    label: 'Otros',
    icon: 'dots',
    color: 'neutral',
    sub: 'Sin categoría específica',
  },
];

export const QUICK_CATS: SelectOption<string>[] = [
  { value: 'comida', label: 'Comida', icon: 'tools-kitchen-2', color: 'pink' },
  { value: 'mercado', label: 'Mercado', icon: 'shopping-cart', color: 'mint' },
  { value: 'transporte', label: 'Transporte', icon: 'car', color: 'purple' },
  { value: 'entret', label: 'Salidas', icon: 'movie', color: 'purple' },
  { value: 'cafe', label: 'Café', icon: 'coffee', color: 'amber' },
  { value: 'otros', label: 'Otros', icon: 'dots', color: 'neutral' },
];

export const DATE_OPTIONS: SelectOption<string>[] = [
  {
    value: 'Hoy · 14 may',
    label: 'Hoy',
    icon: 'calendar-event',
    color: 'mint',
  },
  {
    value: 'Ayer · 13 may',
    label: 'Ayer',
    icon: 'calendar-event',
    color: 'neutral',
  },
  {
    value: '12 may',
    label: 'Lunes 12 may',
    icon: 'calendar-event',
    color: 'neutral',
  },
  {
    value: '11 may',
    label: 'Domingo 11 may',
    icon: 'calendar-event',
    color: 'neutral',
  },
  {
    value: '10 may',
    label: 'Sábado 10 may',
    icon: 'calendar-event',
    color: 'neutral',
  },
];

export const DUE_OPTIONS: SelectOption<string | null>[] = [
  {
    value: null,
    label: 'Sin vencimiento',
    icon: 'calendar-event',
    color: 'neutral',
  },
  {
    value: '21 may',
    label: 'En 1 semana',
    icon: 'calendar-event',
    color: 'mint',
    sub: '21 may',
  },
  {
    value: '29 may',
    label: 'En 15 días',
    icon: 'calendar-event',
    color: 'mint',
    sub: '29 may',
  },
  {
    value: '14 jun',
    label: 'En 1 mes',
    icon: 'calendar-event',
    color: 'amber',
    sub: '14 jun',
  },
  {
    value: '14 ago',
    label: 'En 3 meses',
    icon: 'calendar-event',
    color: 'amber',
    sub: '14 ago',
  },
];
