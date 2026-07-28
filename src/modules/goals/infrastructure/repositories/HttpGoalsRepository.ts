import { AxiosInstance } from 'axios';

import type { AccentColor } from '@/shared/domain';

import type { GoalsRepository } from '../../application';
import type { Goal, GoalPatch, GoalsSnapshot, NewGoal } from '../../domain';
import { mapApiError } from '../mappers/mapApiError';

type GoalResponse = {
  id: string;
  name: string;
  icon: string;
  color: string;
  target: number;
  target_date: string | null;
  archived: boolean;
  saved: number;
  pct: number;
  achieved: boolean;
  projected_on: string | null;
  needed_per_month: number | null;
  monthly_pace: number | null;
};

type SnapshotResponse = {
  currency: string;
  today: string;
  goals: GoalResponse[];
};

export class HttpGoalsRepository implements GoalsRepository {
  constructor(private readonly http: AxiosInstance) {}

  async getSnapshot(today: string): Promise<GoalsSnapshot> {
    try {
      const { data } = await this.http.get<SnapshotResponse>('/goals/snapshot', {
        // The device's local day: the pace projections derive from it.
        params: { today },
      });
      return {
        currency: data.currency,
        today: data.today,
        goals: data.goals.map(toGoal),
      };
    } catch (error) {
      throw mapApiError(error);
    }
  }

  async create(input: NewGoal, today: string): Promise<Goal> {
    try {
      const { data } = await this.http.post<GoalResponse>(
        '/goals',
        {
          name: input.name,
          target: input.target,
          target_date: input.targetDate ?? null,
        },
        { params: { today } },
      );
      return toGoal(data);
    } catch (error) {
      throw mapApiError(error);
    }
  }

  async update(id: string, patch: GoalPatch, today: string): Promise<Goal> {
    try {
      const body: Record<string, unknown> = {};
      if (patch.name !== undefined) body.name = patch.name;
      if (patch.target !== undefined) body.target = patch.target;
      // `null` clears the date on the server; absent leaves it untouched.
      if (patch.targetDate !== undefined) body.target_date = patch.targetDate;
      if (patch.archived !== undefined) body.archived = patch.archived;
      const { data } = await this.http.patch<GoalResponse>(`/goals/${id}`, body, {
        params: { today },
      });
      return toGoal(data);
    } catch (error) {
      throw mapApiError(error);
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.http.delete(`/goals/${id}`);
    } catch (error) {
      throw mapApiError(error);
    }
  }

  async contribute(
    id: string,
    accountId: string,
    amount: number,
    today: string,
  ): Promise<Goal> {
    try {
      const { data } = await this.http.post<GoalResponse>(
        `/goals/${id}/contributions`,
        { account_id: accountId, amount },
        { params: { today } },
      );
      return toGoal(data);
    } catch (error) {
      throw mapApiError(error);
    }
  }

  async withdraw(
    id: string,
    accountId: string,
    amount: number,
    today: string,
  ): Promise<Goal> {
    try {
      const { data } = await this.http.post<GoalResponse>(
        `/goals/${id}/withdrawals`,
        { account_id: accountId, amount },
        { params: { today } },
      );
      return toGoal(data);
    } catch (error) {
      throw mapApiError(error);
    }
  }
}

function toGoal(response: GoalResponse): Goal {
  return {
    id: response.id,
    name: response.name,
    icon: response.icon,
    color: response.color as AccentColor,
    target: response.target,
    targetDate: response.target_date,
    archived: response.archived,
    saved: response.saved,
    pct: response.pct,
    achieved: response.achieved,
    projectedOn: response.projected_on,
    neededPerMonth: response.needed_per_month,
    monthlyPace: response.monthly_pace,
  };
}
