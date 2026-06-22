import { create } from "zustand";

export interface GlobalAlertConfig {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface AppState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  globalAlert: GlobalAlertConfig | null;
  showGlobalAlert: (config: GlobalAlertConfig) => void;
  hideGlobalAlert: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  globalAlert: null,
  showGlobalAlert: (config) => set({ globalAlert: config }),
  hideGlobalAlert: () => set({ globalAlert: null }),
}));
