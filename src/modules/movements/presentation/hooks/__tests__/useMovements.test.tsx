/**
 * HU-23 «Listado del periodo en curso»: the history asks the API for the whole
 * month. It used to leave the limit out, the API answered its default of 100,
 * and a busier month lost its oldest days without a word.
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';

import { container } from '@/core/di/container';

import { HISTORY_LIMIT, useMovements } from '../useMovements';

jest.mock('@/core/di/container', () => ({
  container: { getMovementsUseCase: { execute: jest.fn(async () => []) } },
}));

const execute = container.getMovementsUseCase.execute as jest.Mock;

describe('HU-23 · Listado del periodo en curso', () => {
  it('asks for the month with the API’s maximum of 1000 movements', async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: Infinity } },
    });
    const { result } = renderHook(
      () => useMovements({ from: '2026-11-01', to: '2026-11-30' }),
      {
        wrapper: ({ children }) => (
          <QueryClientProvider client={client}>{children}</QueryClientProvider>
        ),
      },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(HISTORY_LIMIT).toBe(1000);
    expect(execute).toHaveBeenCalledWith({
      from: '2026-11-01',
      to: '2026-11-30',
      limit: 1000,
    });
    client.clear();
  });
});
