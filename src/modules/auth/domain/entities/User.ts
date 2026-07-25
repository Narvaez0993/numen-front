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
};

export class User {
  readonly id: string;
  readonly email: Email;
  readonly displayName: string;
  readonly tier: Tier;
  readonly emailVerified: boolean;
  readonly currency: string;

  constructor(props: UserProps) {
    this.id = props.id;
    this.email = props.email;
    this.displayName = props.displayName;
    this.tier = props.tier ?? 'free';
    this.emailVerified = props.emailVerified ?? false;
    this.currency = props.currency ?? 'USD';
  }

  equals(other: User): boolean {
    return this.id === other.id;
  }
}
