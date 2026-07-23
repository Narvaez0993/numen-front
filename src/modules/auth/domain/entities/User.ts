import { Email } from '../value-objects/Email';

export type UserProps = {
  id: string;
  email: Email;
  displayName: string;
};

export class User {
  readonly id: string;
  readonly email: Email;
  readonly displayName: string;

  constructor(props: UserProps) {
    this.id = props.id;
    this.email = props.email;
    this.displayName = props.displayName;
  }

  equals(other: User): boolean {
    return this.id === other.id;
  }
}
