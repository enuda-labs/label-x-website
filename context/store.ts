import { create } from 'zustand';
import { GlobalState } from './store.types';

export const useGlobalStore = create<GlobalState>(set => ({
  isLoggedIn: false,
  setIsLoggedIn: isLoggedIn => set({ isLoggedIn }),
  isRefreshingToken: false,
  setIsRefreshingToken: isRefreshingToken => set({ isRefreshingToken }),
  loading: false,
  setLoading: loading => set({ loading }),
  user: null,
  setUser: user => set({ user }),
  reset: () =>
    set({
      isLoggedIn: false,
      user: null,
    }),
}));
