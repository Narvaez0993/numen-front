import type { ExpoConfig } from 'expo/config';

const apiUrl = process.env.API_URL ?? 'http://localhost:8000';
const environment =
  (process.env.ENVIRONMENT as 'development' | 'staging' | 'production') ?? 'development';

const config: ExpoConfig = {
  name: 'Deshka',
  slug: 'deshka',
  scheme: 'deshka',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  experiments: {
    typedRoutes: true,
  },
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  ios: {
    supportsTablet: true,
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
  },
  web: {
    favicon: './assets/favicon.png',
    bundler: 'metro',
  },
  plugins: ['expo-router', 'expo-secure-store', 'expo-localization', 'expo-font'],
  extra: {
    apiUrl,
    environment,
  },
};

export default config;
