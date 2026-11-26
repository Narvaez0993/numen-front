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
    backgroundColor: '#F4F2F7',
  },
  ios: {
    supportsTablet: true,
    // Reverse-DNS of the real domain (deshka.app). Baked into every build and
    // painful to change once distributed — do not touch casually.
    bundleIdentifier: 'app.deshka',
  },
  android: {
    package: 'app.deshka',
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundImage: './assets/adaptive-icon-background.png',
      backgroundColor: '#F4F2F7',
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
  },
  web: {
    favicon: './assets/favicon.png',
    bundler: 'metro',
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    'expo-localization',
    'expo-font',
    [
      'expo-speech-recognition',
      {
        microphonePermission:
          'Deshka usa el micrófono para registrar tus gastos por voz.',
        speechRecognitionPermission:
          'Deshka usa reconocimiento de voz para entender lo que dijiste.',
      },
    ],
  ],
  extra: {
    apiUrl,
    environment,
  },
};

export default config;
