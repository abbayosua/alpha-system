import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Role } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      setToken: (token) => set({ token }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      login: (user, token) => set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      }),
      
      logout: () => set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      }),
      
      updateUser: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null,
      })),
    }),
    {
      name: 'saksi-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Role-based route helpers
export const getDashboardRoute = (role: Role): string => {
  switch (role) {
    case 'ADMIN':
      return '/admin/dashboard';
    case 'ADMIN_KEUANGAN':
      return '/keuangan/dashboard';
    case 'SAKSI':
    default:
      return '/saksi/dashboard';
  }
};

export const getRoleLabel = (role: Role): string => {
  switch (role) {
    case 'ADMIN':
      return 'Administrator';
    case 'ADMIN_KEUANGAN':
      return 'Admin Keuangan';
    case 'SAKSI':
    default:
      return 'Saksi';
  }
};

export const getRoleColor = (role: Role): string => {
  switch (role) {
    case 'ADMIN':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    case 'ADMIN_KEUANGAN':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'SAKSI':
    default:
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
  }
};
