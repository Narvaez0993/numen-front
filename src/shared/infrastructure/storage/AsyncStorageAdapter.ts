import AsyncStorage from '@react-native-async-storage/async-storage';

export const AsyncStorageKeys = {
  locale: 'deshka.locale',
  themeMode: 'deshka.themeMode',
} as const;

export type AsyncStorageKey = (typeof AsyncStorageKeys)[keyof typeof AsyncStorageKeys];

export const Preferences = {
  async get(key: AsyncStorageKey): Promise<string | null> {
    return AsyncStorage.getItem(key);
  },
  async set(key: AsyncStorageKey, value: string): Promise<void> {
    await AsyncStorage.setItem(key, value);
  },
  async remove(key: AsyncStorageKey): Promise<void> {
    await AsyncStorage.removeItem(key);
  },
};
