import { Email } from '../value-objects/Email';
import { Password } from '../value-objects/Password';
import { User } from '../entities/User';

export type AuthCredentials = {
  email: Email;
  password: Password;
};

export type AuthSession = {
  user: User;
  accessToken: string;
  refreshToken: string;
};

export interface AuthRepository {
  login(credentials: AuthCredentials): Promise<AuthSession>;
  logout(): Promise<void>;
  currentSession(): Promise<AuthSession | null>;
}
