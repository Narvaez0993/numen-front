import { QueryClient } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react-native';

import { useResetOnSessionChange } from '../useResetOnSessionChange';

function setup(initial: string | null) {
  const queryClient = new QueryClient();
  const hook = renderHook(
    ({ sessionKey }: { sessionKey: string | null }) =>
      useResetOnSessionChange(queryClient, sessionKey),
    { initialProps: { sessionKey: initial } },
  );
  const seed = () => queryClient.setQueryData(['me'], { displayName: 'Ana' });
  const cached = () => queryClient.getQueryData(['me']);
  return { hook, seed, cached };
}

// HU-02 «Cierre de sesión» and HU-03: the next account on the device must not
// be shown the previous one's data, and the setup must not resume from it.
describe('useResetOnSessionChange · the cache belongs to one user', () => {
  it('drops the cached data when the user signs out', () => {
    const { hook, seed, cached } = setup('ana');
    seed();
    hook.rerender({ sessionKey: null });
    expect(cached()).toBeUndefined();
  });

  it('drops it when another account takes over without signing out first', () => {
    const { hook, seed, cached } = setup('ana');
    seed();
    hook.rerender({ sessionKey: 'laura' });
    expect(cached()).toBeUndefined();
  });

  it('keeps it when a user signs in or the session rehydrates at launch', () => {
    const { hook, seed, cached } = setup(null);
    seed();
    hook.rerender({ sessionKey: 'ana' });
    expect(cached()).toEqual({ displayName: 'Ana' });
  });

  it('keeps it while the same user stays signed in', () => {
    const { hook, seed, cached } = setup('ana');
    seed();
    hook.rerender({ sessionKey: 'ana' });
    expect(cached()).toEqual({ displayName: 'Ana' });
  });
});
