import type { BudgetsSnapshot } from '../../domain/types/Budget';
import type { BudgetsRepository } from '../../application/ports/BudgetsRepository';

/**
 * Mirrors the `BUDGET` literal from the design bundle (`budgets.jsx`).
 * Replace with HttpBudgetsRepository once the back exposes /budgets.
 */
export class InMemoryBudgetsRepository implements BudgetsRepository {
  async getSnapshot(): Promise<BudgetsSnapshot> {
    return {
      month: {
        spent: 1919500,
        target: 3000000,
        daysLeft: 17,
        dailySuggested: 63500,
      },
      projection: {
        willEnd: 4250000,
        over: 1250000,
      },
      categories: [
        {
          id: 'cafe',
          name: 'Café',
          iconName: 'coffee',
          color: 'amber',
          spent: 422400,
          target: 440000,
          topMerchants: [
            { description: 'Juan Valdez', amount: 84000, count: 6 },
            { description: 'Tinto matinal', amount: 21000, count: 6 },
            { description: 'Café externo', amount: 18500, count: 2 },
          ],
        },
        {
          id: 'subs',
          name: 'Suscripciones',
          iconName: 'refresh',
          color: 'amber',
          spent: 92800,
          target: 100000,
          topMerchants: [
            { description: 'Notion', amount: 45000, count: 1 },
            { description: 'Netflix', amount: 30900, count: 1 },
            { description: 'Spotify', amount: 16900, count: 1 },
          ],
        },
        {
          id: 'mercado',
          name: 'Mercado',
          iconName: 'shopping-cart',
          color: 'mint',
          spent: 356400,
          target: 440000,
          topMerchants: [
            { description: 'Carulla', amount: 184500, count: 3 },
            { description: 'Tienda D1', amount: 96400, count: 4 },
            { description: 'Frubana', amount: 75500, count: 2 },
          ],
        },
        {
          id: 'domicilios',
          name: 'Domicilios',
          iconName: 'truck',
          color: 'coral',
          spent: 222000,
          target: 300000,
          topMerchants: [
            { description: 'Rappi', amount: 124800, count: 5 },
            { description: 'iFood', amount: 64200, count: 3 },
            { description: 'Doña Empanada', amount: 33000, count: 2 },
          ],
        },
        {
          id: 'transporte',
          name: 'Transporte',
          iconName: 'car',
          color: 'purple',
          spent: 136000,
          target: 200000,
          topMerchants: [
            { description: 'Tuya gasolina', amount: 85000, count: 1 },
            { description: 'Uber', amount: 36500, count: 4 },
            { description: 'Taxi', amount: 14500, count: 2 },
          ],
        },
        {
          id: 'entret',
          name: 'Entretenimiento',
          iconName: 'movie',
          color: 'purple',
          spent: 102000,
          target: 200000,
          topMerchants: [
            { description: 'Cine Andino', amount: 42000, count: 1 },
            { description: 'Concierto', amount: 60000, count: 1 },
          ],
        },
      ],
    };
  }
}
