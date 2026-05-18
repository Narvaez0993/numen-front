import type { Category, CategoryId } from '../../domain/types/MovementsCatalog';

export const CATEGORIES: Record<CategoryId, Category> = {
  mercado: { id: 'mercado', name: 'Mercado', iconName: 'shopping-cart', color: 'mint' },
  domicilios: { id: 'domicilios', name: 'Domicilios', iconName: 'truck', color: 'coral' },
  transporte: { id: 'transporte', name: 'Transporte', iconName: 'car', color: 'purple' },
  comida: {
    id: 'comida',
    name: 'Comida fuera',
    iconName: 'tools-kitchen-2',
    color: 'pink',
  },
  cafe: { id: 'cafe', name: 'Café', iconName: 'coffee', color: 'amber' },
  entret: { id: 'entret', name: 'Entretenimiento', iconName: 'movie', color: 'purple' },
  subs: { id: 'subs', name: 'Suscripciones', iconName: 'refresh', color: 'amber' },
  servicios: { id: 'servicios', name: 'Servicios', iconName: 'bolt', color: 'amber' },
  salud: { id: 'salud', name: 'Salud', iconName: 'heart', color: 'mint' },
  educacion: { id: 'educacion', name: 'Educación', iconName: 'school', color: 'purple' },
  hogar: { id: 'hogar', name: 'Hogar', iconName: 'home-2', color: 'mint' },
  otros: { id: 'otros', name: 'Otros', iconName: 'dots', color: 'neutral' },
  transfer: {
    id: 'transfer',
    name: 'Transferencia',
    iconName: 'credit-card',
    color: 'neutral',
  },
};
