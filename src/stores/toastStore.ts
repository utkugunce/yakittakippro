import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastState {
  toasts: Toast[];
  /** Show a toast and return its id. A non-positive duration keeps it sticky. */
  show: (type: ToastType, message: string, durationMs?: number) => string;
  dismiss: (id: string) => void;
  clear: () => void;
}

const newId = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  show: (type, message, durationMs = 4000) => {
    const id = newId();
    set((s) => ({ toasts: [...s.toasts, { id, type, message }] }));
    if (durationMs > 0 && typeof window !== 'undefined') {
      window.setTimeout(() => get().dismiss(id), durationMs);
    }
    return id;
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  clear: () => set({ toasts: [] }),
}));

/**
 * Imperative toast API usable anywhere (event handlers, utils, stores) without
 * a React hook. Replaces scattered `alert()` calls with a consistent UI.
 */
export const toast = {
  success: (message: string, durationMs?: number) =>
    useToastStore.getState().show('success', message, durationMs),
  error: (message: string, durationMs?: number) =>
    useToastStore.getState().show('error', message, durationMs),
  info: (message: string, durationMs?: number) =>
    useToastStore.getState().show('info', message, durationMs),
};
