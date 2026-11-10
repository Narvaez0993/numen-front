/**
 * HU-07: the count behind the warning. It asks the API for the source's
 * movements (the list already filters by `source`) and stops one past 200, so
 * «exactly 200» and «more than 200» are told apart.
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';

import { container } from '@/core/di/container';

import { useSourceMovementCount } from '../useSourceMovementCount';

jest.mock('@/core/di/container', () => ({
  container: { getMovementsUseCase: { execute: jest.fn() } },
}));

const execute = container.getMovementsUseCase.execute as jest.Mock;

function countFor(sourceId: string | null) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  const view = renderHook(() => useSourceMovementCount(sourceId), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    ),
  });
  return { ...view, client };
}

beforeEach(() => execute.mockReset());

describe('HU-07 · counting a source’s movements before deleting it', () => {
  it('asks the API for that source, one past the limit', async () => {
    execute.mockResolvedValue(Array.from({ length: 12 }, (_, i) => ({ id: `m${i}` })));

    const { result, client } = countFor('acc-nomina');

    expect(result.current.checking).toBe(true);
    await waitFor(() => expect(result.current.checking).toBe(false));
    expect(execute).toHaveBeenCalledWith({ sourceId: 'acc-nomina', limit: 201 });
    expect(result.current).toEqual({
      checking: false,
      count: 12,
      more: false,
      failed: false,
    });
    client.clear();
  });

  it('reports «more» when the API returns more than 200', async () => {
    execute.mockResolvedValue(Array.from({ length: 201 }, (_, i) => ({ id: `m${i}` })));

    const { result, client } = countFor('acc-nomina');

    await waitFor(() => expect(result.current.checking).toBe(false));
    expect(result.current.count).toBe(200);
    expect(result.current.more).toBe(true);
    client.clear();
  });

  it('asks nothing until a source is being deleted', () => {
    const { result, client } = countFor(null);

    expect(execute).not.toHaveBeenCalled();
    expect(result.current.checking).toBe(false);
    client.clear();
  });
});
