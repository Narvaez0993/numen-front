import { AxiosInstance } from 'axios';

import type { BudgetsRepository } from '../../application';
import type {
  Budget,
  BudgetScope,
  BudgetsSnapshot,
  Cap,
  CategoryCap,
  NewBudget,
} from '../../domain';
import { mapApiError } from '../mappers/mapApiError';

type CapResponse = {
  id: string;
  target: number;
  spent: number;
  remaining: number;
  used: number;
  per_day: number | null;
  projected: number | null;
  over: number | null;
};

type CategoryCapResponse = CapResponse & {
  category_id: string;
  count: number;
  top_merchants: { label: string; spent: number; count: number }[];
};

type SnapshotResponse = {
  currency: string;
  period: string;
  days_left: number;
  days_elapsed: number;
  month: CapResponse | null;
  categories: CategoryCapResponse[];
};

type BudgetResponse = {
  id: string;
  scope: string;
  category_id: string | null;
  target: number;
  since: string;
};

export class HttpBudgetsRepository implements BudgetsRepository {
  constructor(private readonly http: AxiosInstance) {}

  async getSnapshot(today: string): Promise<BudgetsSnapshot> {
    try {
      const { data } = await this.http.get<SnapshotResponse>('/budgets/snapshot', {
        // The device's local day: the period, the days left and therefore the daily
        // ceiling are all derived from it.
        params: { today },
      });
      return {
        currency: data.currency,
        period: data.period,
        daysLeft: data.days_left,
        daysElapsed: data.days_elapsed,
        month: data.month ? toCap(data.month) : null,
        categories: data.categories.map(toCategoryCap),
      };
    } catch (error) {
      throw mapApiError(error);
    }
  }

  async create(input: NewBudget, today: string): Promise<Budget> {
    try {
      const { data } = await this.http.post<BudgetResponse>(
        '/budgets',
        {
          scope: input.scope,
          category_id: input.categoryId ?? null,
          target: input.target,
        },
        { params: { today } },
      );
      return toBudget(data);
    } catch (error) {
      throw mapApiError(error);
    }
  }

  async update(id: string, target: number, today: string): Promise<Budget> {
    try {
      const { data } = await this.http.patch<BudgetResponse>(
        `/budgets/${id}`,
        { target },
        { params: { today } },
      );
      return toBudget(data);
    } catch (error) {
      throw mapApiError(error);
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.http.delete(`/budgets/${id}`);
    } catch (error) {
      throw mapApiError(error);
    }
  }
}

function toCap(response: CapResponse): Cap {
  return {
    id: response.id,
    target: response.target,
    spent: response.spent,
    remaining: response.remaining,
    used: response.used,
    perDay: response.per_day,
    projected: response.projected,
    over: response.over,
  };
}

function toCategoryCap(response: CategoryCapResponse): CategoryCap {
  return {
    ...toCap(response),
    categoryId: response.category_id,
    count: response.count,
    topMerchants: response.top_merchants.map((merchant) => ({
      label: merchant.label,
      spent: merchant.spent,
      count: merchant.count,
    })),
  };
}

function toBudget(response: BudgetResponse): Budget {
  return {
    id: response.id,
    scope: response.scope as BudgetScope,
    categoryId: response.category_id,
    target: response.target,
    since: response.since,
  };
}
