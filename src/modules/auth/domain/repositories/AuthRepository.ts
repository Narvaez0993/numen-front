import type { Objective } from '@/shared/domain';

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
};

export type AuthSession = {
  user: User;
  accessToken: string;
  refreshToken: string;
};

/** Partial preferences patch; absent keys keep their stored value. */
export type PreferencesPatch = {
  currency?: string;
  language?: string;
  theme?: string;
  objective?: Objective;
};

export interface AuthRepository {
  register(credentials: RegisterCredentials): Promise<void>;
  verifyEmail(email: Email, code: string): Promise<AuthSession>;
  resendCode(email: Email): Promise<void>;
  login(credentials: AuthCredentials): Promise<AuthSession>;
  refresh(): Promise<AuthSession>;
  logout(): Promise<void>;
  updateDisplayName(displayName: string): Promise<User>;
  updatePreferences(patch: PreferencesPatch): Promise<User>;
  currentSession(): Promise<AuthSession | null>;
}
