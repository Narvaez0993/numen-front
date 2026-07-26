import { AxiosInstance } from 'axios';

import type { CurrencyCode } from '@/shared/domain';

import type { MovementsQuery, MovementsRepository } from '../../application';
import type {
  CapturedVia,
  CategorySpend,
  Movement,
  MovementPatch,
  MovementsSummary,
  MovementType,
  NewMovement,
  SourceRef,
  SourceType,
} from '../../domain';
import { mapApiError } from '../mappers/mapApiError';

type MovementResponse = {
  id: string;
  type: string;
  description: string;
  amount: number;
  currency: string;
  source_type: string;
  source_id: string;
  destination_type: string | null;
  destination_id: string | null;
  category_id: string | null;
  occurred_on: string;
  captured_via: string;
};

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

function toSourceRef(type: string | null, id: string | null): SourceRef | null {
  if (type === null || id === null) return null;
  return { type: type as SourceType, id };
}

function toMovement(dto: MovementResponse): Movement {
  return {
    id: dto.id,
    type: dto.type as MovementType,
    description: dto.description,
    amount: dto.amount,
    currency: dto.currency as CurrencyCode,
    source: { type: dto.source_type as SourceType, id: dto.source_id },
    destination: toSourceRef(dto.destination_type, dto.destination_id),
    categoryId: dto.category_id,
    occurredOn: dto.occurred_on,
    capturedVia: dto.captured_via as CapturedVia,
  };
}
