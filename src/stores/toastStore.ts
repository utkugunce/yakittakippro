import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  action?: ToastAction;
}

export interface ToastOptions {
  /** Auto-dismiss delay in ms. Non-positive keeps it sticky. */
  durationMs?: number;
  /** Optional inline action button (e.g. "Geri Al"). */
  action?: ToastAction;
}

interface ToastState {
  toasts: Toast[];
  show: (type: ToastType, message: string, options?: ToastOptions) => string;
  dismiss: (id: string) => void;
  clear: () => void;
}

const newId = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  show: (type, message, options = {}) => {
    const { durationMs = 4000, action } = options;
    const id = newId();
    set((s) => ({ toasts: [...s.toasts, { id, type, message, action }] }));
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
  success: (message: string, options?: ToastOptions) =>
    useToastStore.getState().show('success', message, options),
  error: (message: string, options?: ToastOptions) =>
    useToastStore.getState().show('error', message, options),
  info: (message: string, options?: ToastOptions) =>
    useToastStore.getState().show('info', message, options),
};
