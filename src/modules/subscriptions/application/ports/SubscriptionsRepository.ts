import type {
  NewSubscription,
  Subscription,
  SubscriptionCharge,
  SubscriptionPatch,
  SubscriptionsOverview,
} from '../../domain';

export interface SubscriptionsRepository {
  /** `today` is the caller's local day: the server derives `nextChargeOn` from it. */
  getOverview(today: string): Promise<SubscriptionsOverview>;
  create(input: NewSubscription): Promise<Subscription>;
  update(id: string, patch: SubscriptionPatch): Promise<Subscription>;
  remove(id: string): Promise<void>;

  /** Charges of the caller, optionally filtered by status. */
  listCharges(status?: string): Promise<SubscriptionCharge[]>;
  /** Registers the expense. `amount` overrides it when the real price differs. */
  confirmCharge(id: string, amount?: number): Promise<SubscriptionCharge>;
  /** It did not happen: no movement. */
  skipCharge(id: string): Promise<SubscriptionCharge>;
}
