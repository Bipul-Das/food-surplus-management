// client/src/store/userStore.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Define the shape of the User object
interface User {
  id: string;
  name: string;
  email: string;
  role: 'LEAD_DEV' | 'COORDINATOR' | 'DONOR' | 'RECEIVER' | 'DELIVERY_MAN';
  organization?: string | null;
  avatar?: string | null;
}

// Define the Store's State & Actions
interface UserState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  
  // Actions
  login: (userData: User, token: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (userData, token) => {
        // Also sync with API headers handled by interceptor, 
        // but store here for React reactivity
        set({
          user: userData,
          token: token,
          isAuthenticated: true,
        });
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
        localStorage.removeItem('user-storage'); // Clean up persistence
      },
      
      updateUser: (updates) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        }));
      }
    }),
    {
      name: 'user-storage', // Key name in localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
);