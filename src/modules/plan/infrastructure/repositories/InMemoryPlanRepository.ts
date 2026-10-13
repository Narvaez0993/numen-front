import type { PlusOffer } from '../../domain';
import type { PlanRepository } from '../../application';

/**
 * The price list, until a store owns it.
 *
 * `$7.99` a month and `$49.99` a year are the figures the monetisation plan
 * settled on (docs/07), and they live here — one place — because when RevenueCat
 * lands this class is what gets replaced, not the screen.
 */
const PLUS: PlusOffer = {
  currency: 'USD',
  monthly: 799,
  annual: 4999,
  trialDays: 7,
};

export class InMemoryPlanRepository implements PlanRepository {
  async getPlusOffer(): Promise<PlusOffer> {
    return PLUS;
  }
}
