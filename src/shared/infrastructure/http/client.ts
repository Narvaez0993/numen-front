import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

import { env } from '../config/env';
import { SecureStorage, SecureStorageKeys } from '../storage/SecureStorage';

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

type RefreshResponse = { access_token: string; refresh_token: string };

// Auth endpoints whose 401 is a real credential/token error, not an expired
// access token — refreshing on these would loop or mask the real failure.
const NO_REFRESH = [
  '/auth/login',
  '/auth/register',
  '/auth/verify-email',
  '/auth/resend-code',
  '/auth/refresh',
];

let onSessionExpired: (() => void) | null = null;

/** Registered by the auth module so the client can clear session state on a
 *  failed refresh without importing the module (keeps shared decoupled). */
export function setOnSessionExpired(handler: () => void): void {
  onSessionExpired = handler;
}

export function createHttpClient(baseURL: string = env.apiUrl): AxiosInstance {
  const client = axios.create({
    baseURL,
    timeout: 15_000,
    headers: { 'Content-Type': 'application/json' },
  });

  client.interceptors.request.use(async (config) => {
    const token = await SecureStorage.get(SecureStorageKeys.accessToken);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Single-flight refresh: concurrent 401s share one /auth/refresh call.
  let refreshPromise: Promise<string | null> | null = null;

  const runRefresh = async (): Promise<string | null> => {
    const refreshToken = await SecureStorage.get(SecureStorageKeys.refreshToken);
    if (!refreshToken) {
      return null;
    }
    try {
      const { data } = await axios.post<RefreshResponse>(
        `${baseURL}/auth/refresh`,
        { refresh_token: refreshToken },
        { headers: { 'Content-Type': 'application/json' } },
      );
      await SecureStorage.set(SecureStorageKeys.accessToken, data.access_token);
      await SecureStorage.set(SecureStorageKeys.refreshToken, data.refresh_token);
      return data.access_token;
    } catch {
      await SecureStorage.remove(SecureStorageKeys.accessToken);
      await SecureStorage.remove(SecureStorageKeys.refreshToken);
      return null;
    }
  };

  client.interceptors.response.use(
    (response) => response,
    async (error: unknown) => {
      if (!axios.isAxiosError(error) || !error.config) {
        return Promise.reject(error);
      }
      const original = error.config as RetriableConfig;
      const url = original.url ?? '';
      const skip = NO_REFRESH.some((path) => url.includes(path));

      if (error.response?.status !== 401 || original._retry || skip) {
        return Promise.reject(error);
      }

      original._retry = true;
      refreshPromise = refreshPromise ?? runRefresh();
      const newToken = await refreshPromise;
      refreshPromise = null;

      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`;
        return client(original);
      }

      onSessionExpired?.();
      return Promise.reject(error);
    },
  );

  return client;
}

export const httpClient = createHttpClient();
