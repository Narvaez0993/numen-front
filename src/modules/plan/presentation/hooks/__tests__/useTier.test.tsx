/**
 * The plan comes from the server, not from what the app remembers.
 *
 * This is pinned because of how it failed: an account was upgraded to Plus in
 * the database, the server started answering 201 to the very request the app
 * was refusing to send, and the app kept showing the Free gate — because the
 * tier it was reading had been stamped into the persisted session at login and
 * nothing ever asked again.
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { useTier } from '../useTier';

const mockCurrentSession = jest.fn();

jest.mock('@/core/di/container', () => ({
  getCurrentUserUseCase: { execute: () => mockCurrentSession() },
}));

let mockStoredTier: string | undefined;

jest.mock('@/modules/auth/presentation', () => ({
  useAuthStore: (select: (state: unknown) => unknown) =>
    select({ session: mockStoredTier === undefined ? null : { tier: mockStoredTier } }),
}));

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

/**
 * A request that has left but not landed. It has to be settled before the test
 * ends or the run never exits — the promise is what keeps jest alive.
 */
let settle: (() => void) | null = null;

function inFlight() {
  mockCurrentSession.mockReturnValue(
    new Promise((resolve) => {
      settle = () => resolve({ user: { tier: 'free' } });
    }),
  );
}

beforeEach(() => {
  mockStoredTier = undefined;
  settle = null;
  mockCurrentSession.mockReset();
});

afterEach(async () => {
  if (settle) await act(async () => settle?.());
});

it('answers Free before the server has replied', () => {
  inFlight();

  const { result } = renderHook(() => useTier(), { wrapper });

  expect(result.current).toBe('free');
});

it('takes the plan from the server, over the stored session', async () => {
  mockStoredTier = 'free';
  mockCurrentSession.mockResolvedValue({ user: { tier: 'plus' } });

  const { result } = renderHook(() => useTier(), { wrapper });

  await waitFor(() => expect(result.current).toBe('plus'));
});

it('falls back to the stored session while the request is in flight', () => {
  mockStoredTier = 'plus';
  inFlight();

  const { result } = renderHook(() => useTier(), { wrapper });

  expect(result.current).toBe('plus');
});

it('stays on Free when nobody can say otherwise', async () => {
  mockCurrentSession.mockRejectedValue(new Error('offline'));

  const { result } = renderHook(() => useTier(), { wrapper });

  await waitFor(() => expect(mockCurrentSession).toHaveBeenCalled());
  expect(result.current).toBe('free');
});
