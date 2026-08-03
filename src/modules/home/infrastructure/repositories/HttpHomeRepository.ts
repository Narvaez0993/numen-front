import { AxiosInstance } from 'axios';

import { type MovementResponse, toMovement } from '@/modules/movements/infrastructure';
import type { CurrencyCode, Objective } from '@/shared/domain';

import type { HomeRepository } from '../../application/ports/HomeRepository';
import type {
  HeroFocus,
  HomeOverview,
  TopCategory,
  UpcomingCharge,
} from '../../domain/types/HomeOverview';
import { mapApiError } from '../mappers/mapApiError';

type HomeOverviewResponse = {
  currency: string;
  period: string;
  days_left: number;
  days_elapsed: number;
  objective: string | null;
  focus: string;
  card_debt: number;
  card_limit: number;
  net_balance: number;
  accounts_count: number;
  credit_cards_count: number;
  month: {
    spent: number;
    income: number;
    saved: number;
    savings_rate: number;
    movements: number;
    spent_today: number;
    previous: { spent: number; income: number } | null;
    change: number | null;
  };
  pace: { daily_average: number; projected: number } | null;
  budget: {
    target: number;
    spent: number;
    remaining: number;
    used: number;
    per_day: number | null;
    projected: number | null;
    over: number | null;
  } | null;
  debts: { i_owe: number; owed_to_me: number; open_count: number };
  goal: {
    name: string;
    target: number;
    saved: number;
    pct: number;
    projected_on: string | null;
  } | null;
  top_categories: {
    category_id: string | null;
    spent: number;
    count: number;
    share: number;
    cap: { target: number; used: number } | null;
  }[];
  recent: MovementResponse[];
  upcoming: {
    subscription_id: string;
    charge_on: string;
    amount: number;
    status: string;
    charge_id: string | null;
  }[];
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
        daysElapsed: data.days_elapsed,
        objective: data.objective as Objective | null,
        focus: data.focus as HeroFocus,
        cardDebt: data.card_debt,
        cardLimit: data.card_limit,
        netBalance: data.net_balance,
        accountsCount: data.accounts_count,
        creditCardsCount: data.credit_cards_count,
        month: {
          spent: data.month.spent,
          income: data.month.income,
          saved: data.month.saved,
          savingsRate: data.month.savings_rate,
          movements: data.month.movements,
          spentToday: data.month.spent_today,
          previous: data.month.previous,
          change: data.month.change,
        },
        debts: {
          iOwe: data.debts.i_owe,
          owedToMe: data.debts.owed_to_me,
          openCount: data.debts.open_count,
        },
        goal:
          data.goal === null
            ? null
            : {
                name: data.goal.name,
                target: data.goal.target,
                saved: data.goal.saved,
                pct: data.goal.pct,
                projectedOn: data.goal.projected_on,
              },
        budget:
          data.budget === null
            ? null
            : {
                target: data.budget.target,
                spent: data.budget.spent,
                remaining: data.budget.remaining,
                used: data.budget.used,
                perDay: data.budget.per_day,
                projected: data.budget.projected,
                over: data.budget.over,
              },
        pace:
          data.pace === null
            ? null
            : {
                dailyAverage: data.pace.daily_average,
                projected: data.pace.projected,
              },
        topCategories: data.top_categories.map(toTopCategory),
        recent: data.recent.map(toMovement),
        upcoming: data.upcoming.map(toUpcomingCharge),
      };
    } catch (error) {
      throw mapApiError(error);
    }
  }
}

function toUpcomingCharge(dto: HomeOverviewResponse['upcoming'][number]): UpcomingCharge {
  return {
    subscriptionId: dto.subscription_id,
    chargeOn: dto.charge_on,
    amount: dto.amount,
    status: dto.status as UpcomingCharge['status'],
    chargeId: dto.charge_id,
  };
}

function toTopCategory(dto: HomeOverviewResponse['top_categories'][number]): TopCategory {
  return {
    categoryId: dto.category_id,
    spent: dto.spent,
    count: dto.count,
    share: dto.share,
    cap: dto.cap === null ? null : { target: dto.cap.target, used: dto.cap.used },
  };
}
