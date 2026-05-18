import Constants from 'expo-constants';

type Env = {
  apiUrl: string;
  environment: 'development' | 'staging' | 'production';
};

const extra = Constants.expoConfig?.extra ?? {};

function required(key: string, value: unknown): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`Missing required env variable: ${key}`);
  }
  return value;
}

export const env: Env = {
  apiUrl: required('apiUrl', extra.apiUrl),
  environment: (extra.environment as Env['environment']) ?? 'development',
};
