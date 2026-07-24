import * as SecureStore from 'expo-secure-store';

export const SecureStorageKeys = {
  accessToken: 'deshka.accessToken',
  refreshToken: 'deshka.refreshToken',
} as const;

export type SecureStorageKey = (typeof SecureStorageKeys)[keyof typeof SecureStorageKeys];

export const SecureStorage = {
  async get(key: SecureStorageKey): Promise<string | null> {
    return SecureStore.getItemAsync(key);
  },
  async set(key: SecureStorageKey, value: string): Promise<void> {
    await SecureStore.setItemAsync(key, value);
  },
  async remove(key: SecureStorageKey): Promise<void> {
    await SecureStore.deleteItemAsync(key);
  },
};
