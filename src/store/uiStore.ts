import { create } from 'zustand';

interface UIState {
  sidebarCollapsed: boolean;
  unreadNotifications: number;
  unreadMessages: number;
  toggleSidebar: () => void;
  setUnreadNotifications: (count: number) => void;
  setUnreadMessages: (count: number) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  unreadNotifications: 0,
  unreadMessages: 0,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setUnreadNotifications: (count) => set({ unreadNotifications: count }),
  setUnreadMessages: (count) => set({ unreadMessages: count }),
}));
