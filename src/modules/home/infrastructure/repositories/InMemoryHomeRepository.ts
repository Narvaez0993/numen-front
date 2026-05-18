import type { HomeOverview } from '../../domain/types/HomeOverview';
import type { HomeRepository } from '../../application/ports/HomeRepository';

/**
 * Mirrors the `HOME_DATA` literal from the design bundle (`home.jsx`).
 * Replace with `HttpHomeRepository` when the back exposes the overview endpoint.
 */
export class InMemoryHomeRepository implements HomeRepository {
  async getOverview(): Promise<HomeOverview> {
    return {
      greeting: 'Sebastián',
      daily: { suggested: 67000, spent: 45000 },
      saldo: { net: 5245000, accounts: 3, hasCash: true, hasTC: 1 },
      month: { spent: 1919500, target: 3000000, daysLeft: 17 },
      topCategories: [
        {
          id: 'mercado',
          name: 'Mercado',
          iconName: 'shopping-cart',
          color: 'mint',
          spent: 356000,
          target: 440000,
        },
        {
          id: 'domi',
          name: 'Domicilios',
          iconName: 'truck',
          color: 'coral',
          spent: 222000,
          target: 300000,
        },
        {
          id: 'trans',
          name: 'Transporte',
          iconName: 'car',
          color: 'purple',
          spent: 136000,
          target: 200000,
        },
      ],
      upcoming: [
        {
          id: 's1',
          name: 'Netflix',
          amount: 30900,
          daysUntil: 2,
          iconName: 'device-tv',
          color: 'coral',
        },
        {
          id: 's2',
          name: 'Spotify',
          amount: 16900,
          daysUntil: 5,
          iconName: 'brand-spotify',
          color: 'mint',
        },
        {
          id: 's3',
          name: 'Notion',
          amount: 45000,
          daysUntil: 9,
          iconName: 'notebook',
          color: 'purple',
        },
        {
          id: 's4',
          name: 'iCloud',
          amount: 4900,
          daysUntil: 14,
          iconName: 'device-tv',
          color: 'amber',
        },
      ],
      recent: [
        {
          id: 'r1',
          description: 'Juan Valdez',
          category: 'Café',
          iconName: 'coffee',
          color: 'amber',
          amount: -15500,
          time: '11:42',
          tag: null,
        },
        {
          id: 'r2',
          description: 'Taxi al trabajo',
          category: 'Transporte',
          iconName: 'car',
          color: 'purple',
          amount: -9000,
          time: '08:15',
          tag: null,
        },
        {
          id: 'r3',
          description: 'Netflix',
          category: 'Suscripciones',
          iconName: 'device-tv',
          color: 'coral',
          amount: -30900,
          time: 'ayer',
          tag: 'recurrente',
        },
        {
          id: 'r4',
          description: 'Carulla',
          category: 'Mercado',
          iconName: 'shopping-cart',
          color: 'mint',
          amount: -68400,
          time: 'ayer',
          tag: null,
        },
        {
          id: 'r5',
          description: 'Pago BBVA Crédito',
          category: 'Transferencia',
          iconName: 'credit-card',
          color: 'mint',
          amount: -350000,
          time: 'ayer',
          tag: 'transfer',
        },
      ],
    };
  }
}
