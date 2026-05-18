import axios, { AxiosInstance } from 'axios';

import { env } from '../config/env';
import { SecureStorage, SecureStorageKeys } from '../storage/SecureStorage';

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

  return client;
}

export const httpClient = createHttpClient();
