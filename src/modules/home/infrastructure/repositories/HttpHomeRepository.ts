import { AxiosInstance } from 'axios';

import { type MovementResponse, toMovement } from '@/modules/movements/infrastructure';
import type { CurrencyCode } from '@/shared/domain';

import type { HomeRepository } from '../../application/ports/HomeRepository';
import type {
  AllowanceBasis,
  HomeOverview,
  TopCategory,
} from '../../domain/types/HomeOverview';
import { mapApiError } from '../mappers/mapApiError';

type HomeOverviewResponse = {
  currency: string;
  period: string;
  days_left: number;
  net_balance: number;
  accounts_count: number;
  credit_cards_count: number;
  month: { spent: number; income: number; savings_rate: number; movements: number };
  daily: { available: number; spent_today: number; basis: string };
  top_categories: {
    category_id: string | null;
    spent: number;
    count: number;
    share: number;
  }[];
  recent: MovementResponse[];
};

export class HttpHomeRepository implements HomeRepository {
  constructor(private readonly http: AxiosInstance) {}

  async getOverview(today: string): Promise<HomeOverview> {
    try {
      const { data } = await this.http.get<HomeOverviewResponse>('/home/overview', {
        // The device's local day: "spent today" and "days left" are answers about
        // the user's calendar, not the server's.
        params: { today },
      });
      return {
        currency: data.currency as CurrencyCode,
        period: data.period,
        daysLeft: data.days_left,
        netBalance: data.net_balance,
        accountsCount: data.accounts_count,
        creditCardsCount: data.credit_cards_count,
        month: {
          spent: data.month.spent,
          income: data.month.income,
          savingsRate: data.month.savings_rate,
          movements: data.month.movements,
        },
        daily: {
          available: data.daily.available,
          spentToday: data.daily.spent_today,
          basis: data.daily.basis as AllowanceBasis,
        },
        topCategories: data.top_categories.map(toTopCategory),
        recent: data.recent.map(toMovement),
      };
    } catch (error) {
      throw mapApiError(error);
    }
  }
}

function toTopCategory(dto: HomeOverviewResponse['top_categories'][number]): TopCategory {
  return {
    categoryId: dto.category_id,
    spent: dto.spent,
    count: dto.count,
    share: dto.share,
  };
}
