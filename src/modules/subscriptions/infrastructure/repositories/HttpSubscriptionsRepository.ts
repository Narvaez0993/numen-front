import { AxiosInstance } from 'axios';

import type { SourceType } from '@/modules/movements/domain';
import type { AccentColor, CurrencyCode } from '@/shared/domain';

import type { SubscriptionsRepository } from '../../application';
import type {
  ChargeStatus,
  Frequency,
  NewSubscription,
  Subscription,
  SubscriptionCharge,
  SubscriptionPatch,
  SubscriptionsOverview,
} from '../../domain';
import { mapApiError } from '../mappers/mapApiError';

type SubscriptionResponse = {
  id: string;
  name: string;
  amount: number;
  currency: string;
  frequency: string;
  first_charge_on: string;
  next_charge_on: string | null;
  source_type: string;
  source_id: string;
  category_id: string | null;
  icon: string;
  color: string;
  active: boolean;
};

type OverviewResponse = {
  currency: string;
  subscriptions: SubscriptionResponse[];
  monthly: number;
  yearly: number;
  count: number;
};

type ChargeResponse = {
  id: string;
  subscription_id: string;
  due_on: string;
  amount: number;
  currency: string;
  status: string;
  movement_id: string | null;
};

export class HttpSubscriptionsRepository implements SubscriptionsRepository {
  constructor(private readonly http: AxiosInstance) {}

  async getOverview(today: string): Promise<SubscriptionsOverview> {
    try {
      const { data } = await this.http.get<OverviewResponse>('/subscriptions', {
        // The device's local day: the server derives every `next_charge_on` from it.
        params: { today },
      });
      return {
        currency: data.currency as CurrencyCode,
        subscriptions: data.subscriptions.map(toSubscription),
        monthly: data.monthly,
        yearly: data.yearly,
        count: data.count,
      };
    } catch (error) {
      throw mapApiError(error);
    }
  }

  async create(input: NewSubscription): Promise<Subscription> {
    try {
      const { data } = await this.http.post<SubscriptionResponse>('/subscriptions', {
        name: input.name,
        amount: input.amount,
        frequency: input.frequency,
        first_charge_on: input.firstChargeOn,
        source_type: input.source.type,
        source_id: input.source.id,
        category_id: input.categoryId,
        icon: input.icon,
        color: input.color,
      });
      return toSubscription(data);
    } catch (error) {
      throw mapApiError(error);
    }
  }

  async update(id: string, patch: SubscriptionPatch): Promise<Subscription> {
    try {
      const { data } = await this.http.patch<SubscriptionResponse>(
        `/subscriptions/${id}`,
        {
          name: patch.name,
          amount: patch.amount,
          frequency: patch.frequency,
          first_charge_on: patch.firstChargeOn,
          source_type: patch.source?.type,
          source_id: patch.source?.id,
          category_id: patch.categoryId,
          icon: patch.icon,
          color: patch.color,
          active: patch.active,
        },
      );
      return toSubscription(data);
    } catch (error) {
      throw mapApiError(error);
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.http.delete(`/subscriptions/${id}`);
    } catch (error) {
      throw mapApiError(error);
    }
  }

  async listCharges(status?: string): Promise<SubscriptionCharge[]> {
    try {
      const { data } = await this.http.get<{ charges: ChargeResponse[] }>(
        '/subscription-charges',
        { params: { status } },
      );
      return data.charges.map(toCharge);
    } catch (error) {
      throw mapApiError(error);
    }
  }

  async confirmCharge(id: string, amount?: number): Promise<SubscriptionCharge> {
    try {
      const { data } = await this.http.post<ChargeResponse>(
        `/subscription-charges/${id}/confirm`,
        { amount },
      );
      return toCharge(data);
    } catch (error) {
      throw mapApiError(error);
    }
  }

  async skipCharge(id: string): Promise<SubscriptionCharge> {
    try {
      const { data } = await this.http.post<ChargeResponse>(
        `/subscription-charges/${id}/skip`,
      );
      return toCharge(data);
    } catch (error) {
      throw mapApiError(error);
    }
  }
}

function toSubscription(dto: SubscriptionResponse): Subscription {
  return {
    id: dto.id,
    name: dto.name,
    amount: dto.amount,
    currency: dto.currency as CurrencyCode,
    frequency: dto.frequency as Frequency,
    firstChargeOn: dto.first_charge_on,
    nextChargeOn: dto.next_charge_on,
    source: { type: dto.source_type as SourceType, id: dto.source_id },
    categoryId: dto.category_id,
    icon: dto.icon,
    color: dto.color as AccentColor,
    active: dto.active,
  };
}

function toCharge(dto: ChargeResponse): SubscriptionCharge {
  return {
    id: dto.id,
    subscriptionId: dto.subscription_id,
    dueOn: dto.due_on,
    amount: dto.amount,
    currency: dto.currency as CurrencyCode,
    status: dto.status as ChargeStatus,
    movementId: dto.movement_id,
  };
}
