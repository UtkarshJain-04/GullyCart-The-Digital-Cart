import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      hydrated: false,
      setHydrated: () => set({ hydrated: true }),
      setSession: (session) => set({ token: session.token, user: session.user }),
      clearSession: () => set({ token: null, user: null }),
      
      // Added logout method
      logout: () => set({ token: null, user: null }),
    }),
    {
      name: 'gullycart-auth',
      onRehydrateStorage: () => (state) => state?.setHydrated?.(),
      partialize: (state) => ({ token: state.token, user: state.user }),
    },
  ),
)