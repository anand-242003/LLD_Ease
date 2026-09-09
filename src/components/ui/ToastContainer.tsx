import { X, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { useAppStore } from '../../store';

export function ToastContainer() {
  const toasts = useAppStore((state) => state.toasts);
  const removeToast = useAppStore((state) => state.removeToast);

  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      id="toast-container"
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none max-w-[360px]"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((toast) => {
        const borderClass =
          toast.severity === 'error'
            ? 'border-l-[3px] border-l-danger'
            : toast.severity === 'success'
            ? 'border-l-[3px] border-l-success'
            : 'border-l-[3px] border-l-primary';

        const icon =
          toast.severity === 'error' ? (
            <AlertCircle size={16} className="text-danger shrink-0 mt-0.5" />
          ) : toast.severity === 'success' ? (
            <CheckCircle2 size={16} className="text-success shrink-0 mt-0.5" />
          ) : (
            <Info size={16} className="text-primary shrink-0 mt-0.5" />
          );

        return (
          <div
            key={toast.id}
            data-testid={`toast-${toast.severity}`}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-[8px] bg-surface-3 border border-border text-text shadow-md text-[13px] leading-snug transition-all ${borderClass}`}
          >
            {icon}
            <span className="flex-1 select-text">{toast.message}</span>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              aria-label="Dismiss notification"
              className="text-text-muted hover:text-text p-0.5 rounded hover:bg-surface-2 transition-colors shrink-0 cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default ToastContainer;
