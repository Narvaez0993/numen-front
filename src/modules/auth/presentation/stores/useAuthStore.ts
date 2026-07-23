import { create } from 'zustand';

export type AuthSessionState = {
  userId: string;
  email: string;
  displayName: string;
  accessToken: string;
};

type AuthStoreState = {
  session: AuthSessionState | null;
  setSession: (session: AuthSessionState) => void;
  clear: () => void;
};

export const useAuthStore = create<AuthStoreState>((set) => ({
  session: null,
  setSession: (session) => set({ session }),
  clear: () => set({ session: null }),
}));
