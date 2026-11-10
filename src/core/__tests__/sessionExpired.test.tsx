/**
 * HU-02 «Petición sin token vigente», end to end inside the app: a private
 * request answered with 401 whose refresh fails too ends the session, and the
 * root layout sends the user back to the login screen.
 *
 * It mounts the real `app/_layout` (its gate registers the expiry handler) and
 * drives a real HTTP client into the expiry; only the navigator and the network
 * are stood in for.
 */

import axios, { AxiosError, AxiosHeaders, type InternalAxiosRequestConfig } from 'axios';
import { act, render } from '@testing-library/react-native';

import { useAuthStore } from '@/modules/auth/presentation';
import { useOnboardingStore } from '@/modules/onboarding/presentation/stores/useOnboardingStore';
import { createHttpClient } from '@/shared/infrastructure/http/client';

import RootLayout from '../../../app/_layout';

jest.mock('@/shared/infrastructure/config/env', () => ({
  env: { apiUrl: 'http://api.test', environment: 'development' },
}));

jest.mock('@/shared/infrastructure/storage/SecureStorage', () => ({
  SecureStorageKeys: {
    accessToken: 'deshka.accessToken',
    refreshToken: 'deshka.refreshToken',
  },
  SecureStorage: {
    get: jest.fn(async () => 'stale-token'),
    set: jest.fn(async () => undefined),
    remove: jest.fn(async () => undefined),
  },
}));

// The real provider waits for the native view to measure the screen, which
// never happens under jest; the library's own mock hands it fixed metrics.
jest.mock(
  'react-native-safe-area-context',
  () => jest.requireActual('react-native-safe-area-context/jest/mock').default,
);

const mockReplace = jest.fn();
jest.mock('expo-router', () => {
  const Stack = Object.assign(() => null, { Screen: () => null });
  return {
    Stack,
    useRouter: () => ({ replace: mockReplace }),
    useSegments: () => ['(tabs)'],
  };
});

// The real providers wait for the fonts to load; the theme is all the gate needs.
jest.mock('@/shared/presentation/providers', () => {
  const { ThemeProvider } = jest.requireActual('@/shared/presentation/theme');
  return {
    AppProviders: ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    ),
  };
});

/** Every request is refused: the access token expired. */
function expiredApi() {
  return jest.fn(async (config: InternalAxiosRequestConfig) => {
    throw new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', config, null, {
      status: 401,
      statusText: 'Unauthorized',
      headers: new AxiosHeaders(),
      config,
      data: { code: 'auth.invalid_token' },
    });
  });
}

describe('HU-02 · Petición sin token vigente', () => {
  it('sends the user back to login when the session cannot be renewed', async () => {
    jest.spyOn(axios, 'post').mockRejectedValue(new Error('refresh token expired'));
    useAuthStore.setState({
      hydrated: true,
      session: {
        userId: 'u-1',
        email: 'laura@example.com',
        displayName: 'Laura',
        tier: 'free',
        emailVerified: true,
        currency: 'COP',
        objective: 'gastos',
      },
    });
    useOnboardingStore.setState({ hydrated: true, introSeen: true, profileDone: true });

    render(<RootLayout />);
    // Signed in and set up, inside the app: the gate leaves it where it is.
    expect(mockReplace).not.toHaveBeenCalledWith('/(auth)/login');

    const client = createHttpClient('http://api.test');
    client.defaults.adapter = expiredApi();
    await act(async () => {
      await expect(client.get('/home/overview')).rejects.toBeTruthy();
    });

    expect(useAuthStore.getState().session).toBeNull();
    expect(mockReplace).toHaveBeenLastCalledWith('/(auth)/login');
  });
});
