import { Email } from '../value-objects/Email';

export type Tier = 'free' | 'plus';

export type UserProps = {
  id: string;
  email: Email;
  displayName: string;
  tier?: Tier;
  emailVerified?: boolean;
};

export class User {
  readonly id: string;
  readonly email: Email;
  readonly displayName: string;
  readonly tier: Tier;
  readonly emailVerified: boolean;

  constructor(props: UserProps) {
    this.id = props.id;
    this.email = props.email;
    this.displayName = props.displayName;
    this.tier = props.tier ?? 'free';
    this.emailVerified = props.emailVerified ?? false;
  }

  equals(other: User): boolean {
    return this.id === other.id;
  }
}
