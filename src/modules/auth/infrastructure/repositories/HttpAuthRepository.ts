import { AxiosInstance } from 'axios';

import { SecureStorage, SecureStorageKeys } from '@/shared/infrastructure/storage';

import {
  AuthCredentials,
  AuthRepository,
  AuthSession,
  Email,
  PreferencesPatch,
  RegisterCredentials,
  SessionExpiredError,
  Tier,
  User,
} from '../../domain';
import { mapApiError } from '../mappers/mapApiError';

type AuthResponse = {
  user_id: string;
  email: string;
  display_name: string;
  tier: string;
  language: string;
  currency: string;
  theme: string;
  access_token: string;
  refresh_token: string;
};

type CurrentUserResponse = {
  user_id: string;
  email: string;
  display_name: string;
  tier: string;
  email_verified: boolean;
  language: string;
  currency: string;
  theme: string;
};

function toUser(data: CurrentUserResponse): User {
  return new User({
    id: data.user_id,
    email: Email.create(data.email),
    displayName: data.display_name,
    tier: data.tier as Tier,
    emailVerified: data.email_verified,
    currency: data.currency,
  });
}

export class HttpAuthRepository implements AuthRepository {
  constructor(private readonly http: AxiosInstance) {}

  async register(credentials: RegisterCredentials): Promise<void> {
    try {
      await this.http.post('/auth/register', {
        email: credentials.email.value,
        password: credentials.password.value,
      });
    } catch (error) {
      throw mapApiError(error);
    }
  }

  async verifyEmail(email: Email, code: string): Promise<AuthSession> {
    try {
      const { data } = await this.http.post<AuthResponse>('/auth/verify-email', {
        email: email.value,
        code,
      });
      return this.persistSession(data);
    } catch (error) {
      throw mapApiError(error);
    }
  }

  async resendCode(email: Email): Promise<void> {
    try {
      await this.http.post('/auth/resend-code', { email: email.value });
    } catch (error) {
      throw mapApiError(error);
    }
  }

  async login(credentials: AuthCredentials): Promise<AuthSession> {
    try {
      const { data } = await this.http.post<AuthResponse>('/auth/login', {
        email: credentials.email.value,
        password: credentials.password.value,
      });
      return this.persistSession(data);
    } catch (error) {
      throw mapApiError(error);
    }
  }

  async refresh(): Promise<AuthSession> {
    const refreshToken = await SecureStorage.get(SecureStorageKeys.refreshToken);
    if (!refreshToken) {
      throw new SessionExpiredError();
    }
    try {
      const { data } = await this.http.post<AuthResponse>('/auth/refresh', {
        refresh_token: refreshToken,
      });
      return this.persistSession(data);
    } catch (error) {
      await this.clearTokens();
      throw mapApiError(error);
    }
  }

  async logout(): Promise<void> {
    const refreshToken = await SecureStorage.get(SecureStorageKeys.refreshToken);
    if (refreshToken) {
      try {
        await this.http.post('/auth/logout', { refresh_token: refreshToken });
      } catch {
        // Revoking best-effort; local tokens are cleared regardless.
      }
    }
    await this.clearTokens();
  }

  async updateDisplayName(displayName: string): Promise<User> {
    try {
      const { data } = await this.http.patch<CurrentUserResponse>('/auth/me', {
        display_name: displayName,
      });
      return toUser(data);
    } catch (error) {
      throw mapApiError(error);
    }
  }

  async updatePreferences(patch: PreferencesPatch): Promise<User> {
    try {
      const { data } = await this.http.patch<CurrentUserResponse>(
        '/auth/me/preferences',
        {
          currency: patch.currency,
          language: patch.language,
          theme: patch.theme,
        },
      );
      return toUser(data);
    } catch (error) {
      throw mapApiError(error);
    }
  }

  async currentSession(): Promise<AuthSession | null> {
    const [accessToken, refreshToken] = await Promise.all([
      SecureStorage.get(SecureStorageKeys.accessToken),
      SecureStorage.get(SecureStorageKeys.refreshToken),
    ]);
    if (!accessToken || !refreshToken) {
      return null;
    }
    try {
      const { data } = await this.http.get<CurrentUserResponse>('/auth/me');
      return { user: toUser(data), accessToken, refreshToken };
    } catch {
      return null;
    }
  }

  private async persistSession(data: AuthResponse): Promise<AuthSession> {
    await SecureStorage.set(SecureStorageKeys.accessToken, data.access_token);
    await SecureStorage.set(SecureStorageKeys.refreshToken, data.refresh_token);
    return {
      user: new User({
        id: data.user_id,
        email: Email.create(data.email),
        displayName: data.display_name,
        tier: data.tier as Tier,
        emailVerified: true,
        currency: data.currency,
      }),
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
    };
  }

  private async clearTokens(): Promise<void> {
    await SecureStorage.remove(SecureStorageKeys.accessToken);
    await SecureStorage.remove(SecureStorageKeys.refreshToken);
  }
}
