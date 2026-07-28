import { AxiosInstance } from 'axios';

import type { AccentColor } from '@/shared/domain';

import type { DeudasRepository } from '../../application';
import type {
  Counterparty,
  DebtDirection,
  DebtStatus,
  DebtsSnapshot,
  Deuda,
  NewDebt,
  NewSharedEvent,
  SharedEvent,
} from '../../domain';
import { mapApiError } from '../mappers/mapApiError';

type PaymentResponse = {
  id: string;
  amount: number;
  paid_on: string;
  note: string | null;
};

type DebtResponse = {
  id: string;
  direction: string;
  counterparty_id: string;
  amount: number;
  paid_total: number;
  remaining: number;
  status: string;
  due_on: string | null;
  note: string | null;
  event_id: string | null;
  payments: PaymentResponse[];
  created_at: string;
};

type SnapshotResponse = {
  currency: string;
  today: string;
  i_owe: { total: number; count: number };
  owed_to_me: { total: number; count: number };
  counterparties: { id: string; name: string; color: string }[];
  events: { id: string; name: string; total: number; occurred_on: string }[];
  debts: DebtResponse[];
};

export class HttpDeudasRepository implements DeudasRepository {
  constructor(private readonly http: AxiosInstance) {}

  async getSnapshot(today: string): Promise<DebtsSnapshot> {
    try {
      const { data } = await this.http.get<SnapshotResponse>('/debts/snapshot', {
        // The device's local day: `status` (and so `overdue`) derive from it.
        params: { today },
      });
      return toSnapshot(data);
    } catch (error) {
      throw mapApiError(error);
    }
  }

  async create(input: NewDebt, today: string): Promise<Deuda> {
    try {
      const { data } = await this.http.post<DebtResponse>(
        '/debts',
        {
          direction: input.direction,
          counterparty_id: input.counterpartyId ?? null,
          counterparty_name: input.counterpartyName ?? null,
          amount: input.amount,
          due_on: input.dueOn ?? null,
          note: input.note ?? null,
        },
        { params: { today } },
      );
      return toDeuda(data);
    } catch (error) {
      throw mapApiError(error);
    }
  }

  async createSharedEvent(input: NewSharedEvent, today: string): Promise<DebtsSnapshot> {
    try {
      const { data } = await this.http.post<SnapshotResponse>(
        '/debts/events',
        {
          direction: input.direction,
          name: input.name,
          total: input.total,
          due_on: input.dueOn ?? null,
          splits: input.splits.map((split) => ({
            counterparty_id: split.counterpartyId ?? null,
            counterparty_name: split.counterpartyName ?? null,
            amount: split.amount,
          })),
        },
        { params: { today } },
      );
      return toSnapshot(data);
    } catch (error) {
      throw mapApiError(error);
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.http.delete(`/debts/${id}`);
    } catch (error) {
      throw mapApiError(error);
    }
  }

  async addPayment(
    id: string,
    amount: number,
    today: string,
    note?: string,
  ): Promise<Deuda> {
    try {
      const { data } = await this.http.post<DebtResponse>(
        `/debts/${id}/payments`,
        { amount, note: note ?? null },
        { params: { today } },
      );
      return toDeuda(data);
    } catch (error) {
      throw mapApiError(error);
    }
  }

  async removePayment(id: string, paymentId: string, today: string): Promise<Deuda> {
    try {
      const { data } = await this.http.delete<DebtResponse>(
        `/debts/${id}/payments/${paymentId}`,
        { params: { today } },
      );
      return toDeuda(data);
    } catch (error) {
      throw mapApiError(error);
    }
  }
}

function toDeuda(response: DebtResponse): Deuda {
  return {
    id: response.id,
    direction: response.direction as DebtDirection,
    counterpartyId: response.counterparty_id,
    amount: response.amount,
    paidTotal: response.paid_total,
    remaining: response.remaining,
    status: response.status as DebtStatus,
    dueOn: response.due_on,
    note: response.note,
    eventId: response.event_id,
    payments: response.payments.map((payment) => ({
      id: payment.id,
      amount: payment.amount,
      paidOn: payment.paid_on,
      note: payment.note,
    })),
    createdAt: response.created_at,
  };
}

function toSnapshot(response: SnapshotResponse): DebtsSnapshot {
  const counterparties: Counterparty[] = response.counterparties.map((person) => ({
    id: person.id,
    name: person.name,
    color: person.color as AccentColor,
  }));
  const events: SharedEvent[] = response.events.map((event) => ({
    id: event.id,
    name: event.name,
    total: event.total,
    occurredOn: event.occurred_on,
  }));
  return {
    currency: response.currency,
    today: response.today,
    iOwe: response.i_owe,
    owedToMe: response.owed_to_me,
    counterparties,
    events,
    debts: response.debts.map(toDeuda),
  };
}
