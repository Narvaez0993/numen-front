import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type AuthSessionState = {
  userId: string;
  email: string;
  displayName: string;
  tier: string;
  emailVerified: boolean;
};

type AuthStoreState = {
  session: AuthSessionState | null;
  hydrated: boolean;
  setSession: (session: AuthSessionState) => void;
  clear: () => void;
};

/**
 * Session metadata only — never tokens. Access/refresh tokens live in
 * SecureStore (see `HttpAuthRepository`). This store is the routing source of
 * truth; an invalid token self-heals on the first request via the refresh
 * interceptor, which clears state through the registered expiry handler.
 */
export const useAuthStore = create<AuthStoreState>()(
  persist(
    (set) => ({
      session: null,
      hydrated: false,
      setSession: (session) => set({ session }),
      clear: () => set({ session: null }),
    }),
    {
      name: 'numen.auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ session: state.session }),
      onRehydrateStorage: () => () => {
        // Triggers re-renders for subscribers reading `hydrated`.
        useAuthStore.setState({ hydrated: true });
      },
    },
  ),
);
