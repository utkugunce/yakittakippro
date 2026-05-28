import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useToastStore, type ToastType } from '../../stores/toastStore';

const STYLES: Record<ToastType, { icon: React.ReactNode; ring: string; iconColor: string }> = {
  success: {
    icon: <CheckCircle2 className="w-5 h-5" />,
    ring: 'border-emerald-200 dark:border-emerald-800',
    iconColor: 'text-emerald-500',
  },
  error: {
    icon: <AlertCircle className="w-5 h-5" />,
    ring: 'border-red-200 dark:border-red-800',
    iconColor: 'text-red-500',
  },
  info: {
    icon: <Info className="w-5 h-5" />,
    ring: 'border-blue-200 dark:border-blue-800',
    iconColor: 'text-blue-500',
  },
};

/**
 * Global toast viewport. Mount once near the app root. Reads from toastStore so
 * any code can trigger toasts via the imperative `toast` helper.
 */
export const Toaster: React.FC = () => {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm pointer-events-none"
      role="region"
      aria-live="polite"
      aria-label="Bildirimler"
    >
      {toasts.map((t) => {
        const style = STYLES[t.type];
        return (
          <div
            key={t.id}
            role="alert"
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border bg-white dark:bg-gray-800 px-4 py-3 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200 ${style.ring}`}
          >
            <span className={`mt-0.5 shrink-0 ${style.iconColor}`}>{style.icon}</span>
            <p className="flex-1 text-sm text-gray-800 dark:text-gray-100 whitespace-pre-line">
              {t.message}
            </p>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Bildirimi kapat"
              className="shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
