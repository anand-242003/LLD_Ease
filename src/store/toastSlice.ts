import { StateCreator } from 'zustand';
import { nanoid } from 'nanoid';

export type ToastSeverity = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  message: string;
  severity: ToastSeverity;
  persistent?: boolean;
}

export interface ToastSlice {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
}

export const createToastSlice: StateCreator<ToastSlice, [], [], ToastSlice> = (set, get) => ({
  toasts: [],

  addToast: (toastData) => {
    const id = nanoid();
    const newToast: Toast = { ...toastData, id };

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));

    // Auto-dismiss after 4s unless error or persistent per DESIGN.md §5.9
    if (newToast.severity !== 'error' && !newToast.persistent) {
      setTimeout(() => {
        get().removeToast(id);
      }, 4000);
    }

    return id;
  },

  removeToast: (id: string) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
});
