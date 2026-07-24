import { Email } from '../value-objects/Email';
import { Password } from '../value-objects/Password';
import { User } from '../entities/User';

export type AuthCredentials = {
  email: Email;
  password: Password;
};

export type RegisterCredentials = {
  email: Email;
  password: Password;
  displayName: string;
};

export type AuthSession = {
  user: User;
  accessToken: string;
  refreshToken: string;
};

export interface AuthRepository {
  register(credentials: RegisterCredentials): Promise<void>;
  verifyEmail(email: Email, code: string): Promise<AuthSession>;
  resendCode(email: Email): Promise<void>;
  login(credentials: AuthCredentials): Promise<AuthSession>;
  refresh(): Promise<AuthSession>;
  logout(): Promise<void>;
  currentSession(): Promise<AuthSession | null>;
}
