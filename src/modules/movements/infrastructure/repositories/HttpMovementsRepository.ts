import { AxiosInstance } from 'axios';

import type { MovementsQuery, MovementsRepository } from '../../application';
import type {
  CategorySpend,
  Movement,
  MovementPatch,
  MovementsSummary,
  NewMovement,
} from '../../domain';
import { mapApiError } from '../mappers/mapApiError';
import { type MovementResponse, toMovement } from '../mappers/toMovement';

type MovementsListResponse = {
  movements: MovementResponse[];
};

type CategorySpendResponse = {
  category_id: string | null;
  spent: number;
  count: number;
};

type MovementSummaryResponse = {
  date_from: string;
  date_to: string;
  expense_total: number;
  income_total: number;
  count: number;
  by_category: CategorySpendResponse[];
};

export class HttpMovementsRepository implements MovementsRepository {
  constructor(private readonly http: AxiosInstance) {}

  async list(query: MovementsQuery): Promise<Movement[]> {
    try {
      const { data } = await this.http.get<MovementsListResponse>('/movements', {
        params: {
          from: query.from,
          to: query.to,
          type: query.type,
          source: query.sourceId,
          category: query.categoryId,
          limit: query.limit,
        },
      });
      return data.movements.map(toMovement);
    } catch (error) {
      throw mapApiError(error);
    }
  }

  async create(input: NewMovement, idempotencyKey?: string): Promise<Movement> {
    try {
      const { data } = await this.http.post<MovementResponse>(
        '/movements',
        {
          type: input.type,
          description: input.description,
          amount: input.amount,
          source_type: input.source.type,
          source_id: input.source.id,
          destination_type: input.destination?.type ?? null,
          destination_id: input.destination?.id ?? null,
          category_id: input.categoryId,
          occurred_on: input.occurredOn,
          captured_via: input.capturedVia ?? 'manual',
        },
        idempotencyKey ? { headers: { 'Idempotency-Key': idempotencyKey } } : undefined,
      );
      return toMovement(data);
    } catch (error) {
      throw mapApiError(error);
    }
  }

  async update(id: string, patch: MovementPatch): Promise<Movement> {
    try {
      const { data } = await this.http.patch<MovementResponse>(`/movements/${id}`, {
        description: patch.description,
        amount: patch.amount,
        source_type: patch.source?.type,
        source_id: patch.source?.id,
        destination_type: patch.destination?.type,
        destination_id: patch.destination?.id,
        category_id: patch.categoryId,
        occurred_on: patch.occurredOn,
      });
      return toMovement(data);
    } catch (error) {
      throw mapApiError(error);
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.http.delete(`/movements/${id}`);
    } catch (error) {
      throw mapApiError(error);
    }
  }

  async summarize(range: { from: string; to: string }): Promise<MovementsSummary> {
    try {
      const { data } = await this.http.get<MovementSummaryResponse>(
        '/movements/summary',
        { params: { from: range.from, to: range.to } },
      );
      return {
        from: data.date_from,
        to: data.date_to,
        expenseTotal: data.expense_total,
        incomeTotal: data.income_total,
        count: data.count,
        byCategory: data.by_category.map(toCategorySpend),
      };
    } catch (error) {
      throw mapApiError(error);
    }
  }
}

function toCategorySpend(dto: CategorySpendResponse): CategorySpend {
  return { categoryId: dto.category_id, spent: dto.spent, count: dto.count };
}
