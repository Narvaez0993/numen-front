import type { Objective } from '@/shared/domain';

import { Email } from '../value-objects/Email';

export type Tier = 'free' | 'plus';

export type UserProps = {
  id: string;
  email: Email;
  displayName: string;
  tier?: Tier;
  emailVerified?: boolean;
  /** ISO 4217 home currency: the unit every amount stored for this user is in. */
  currency?: string;
  /** What they said they came for; Home leads with the figure that serves it. */
  objective?: Objective | null;
  /** When the account was born. Only the profile-shaped endpoints carry it —
   *  the session payload does not — so it is null until `/auth/me` answers. */
  createdAt?: Date | null;
};

export class User {
  readonly id: string;
  readonly email: Email;
  readonly displayName: string;
  readonly tier: Tier;
  readonly emailVerified: boolean;
  readonly currency: string;
  readonly objective: Objective | null;
  readonly createdAt: Date | null;

  constructor(props: UserProps) {
    this.id = props.id;
    this.email = props.email;
    this.displayName = props.displayName;
    this.tier = props.tier ?? 'free';
    this.emailVerified = props.emailVerified ?? false;
    this.currency = props.currency ?? 'USD';
    this.objective = props.objective ?? null;
    this.createdAt = props.createdAt ?? null;
  }

  equals(other: User): boolean {
    return this.id === other.id;
  }
}
