// client/src/store/messageStore.ts

import { create } from 'zustand';

interface MessageState {
  unreadCount: number;
  
  // Actions
  setUnreadCount: (count: number) => void;
  incrementUnread: () => void;
  decrementUnread: () => void;
  resetUnread: () => void;
}

export const useMessageStore = create<MessageState>((set) => ({
  unreadCount: 0,

  setUnreadCount: (count) => set({ unreadCount: count }),

  incrementUnread: () => set((state) => ({ unreadCount: state.unreadCount + 1 })),

  // Prevent negative counts
  decrementUnread: () => set((state) => ({ 
    unreadCount: state.unreadCount > 0 ? state.unreadCount - 1 : 0 
  })),

  resetUnread: () => set({ unreadCount: 0 }),
}));