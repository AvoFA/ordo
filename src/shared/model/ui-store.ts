import { create } from "zustand";

export type Toast = {
  id: string;
  message: string;
  description?: string;
  type?: "success" | "info" | "error";
};

type UiState = {
  isSidebarCollapsed: boolean;
  isCommandMenuOpen: boolean;
  isEditMode: boolean;
  toasts: Toast[];
  setSidebarCollapsed: (isSidebarCollapsed: boolean) => void;
  setCommandMenuOpen: (isCommandMenuOpen: boolean) => void;
  setEditMode: (isEditMode: boolean) => void;
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
};

// TanStack Query owns server state. Zustand is only for small UI flags.
// Do not store server data in this store.
export const useUiStore = create<UiState>((set) => ({
  isSidebarCollapsed: false,
  isCommandMenuOpen: false,
  isEditMode: false, // Study/Learning Mode is the default
  toasts: [],
  setSidebarCollapsed: (isSidebarCollapsed) => set({ isSidebarCollapsed }),
  setCommandMenuOpen: (isCommandMenuOpen) => set({ isCommandMenuOpen }),
  setEditMode: (isEditMode) => set({ isEditMode }),
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));
