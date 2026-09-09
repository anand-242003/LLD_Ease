import { useEffect, useRef, MouseEvent } from 'react';
import { AlertTriangle } from 'lucide-react';

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary' | 'warning';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Proceed',
  cancelLabel = 'Cancel',
  variant = 'warning',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const primaryBtn = dialogRef.current?.querySelector<HTMLButtonElement>('#confirm-dialog-confirm-btn');
    primaryBtn?.focus();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const handleScrimClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  const confirmBtnStyle =
    variant === 'danger'
      ? 'bg-danger text-white hover:bg-red-600'
      : variant === 'primary'
      ? 'bg-primary text-primary-fg hover:bg-primary-hover'
      : 'bg-amber-500 text-black hover:bg-amber-400 font-semibold';

  return (
    <div
      id="confirm-dialog-scrim"
      onClick={handleScrimClick}
      className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-[60] flex items-center justify-center p-4 animate-in fade-in duration-fast"
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
        className="bg-surface-3 border border-border rounded-[14px] max-w-md w-full p-6 shadow-2xl flex flex-col gap-4 text-text"
      >
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400 mt-0.5">
            <AlertTriangle size={20} />
          </div>
          <div className="flex flex-col gap-1">
            <h2 id="confirm-dialog-title" className="text-[17px] font-semibold text-text">
              {title}
            </h2>
            <p id="confirm-dialog-message" className="text-[13px] text-text-muted leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-2">
          <button
            type="button"
            id="confirm-dialog-cancel-btn"
            onClick={onCancel}
            className="px-4 py-2 text-[13px] font-medium text-text-muted hover:text-text rounded-[8px] border border-border hover:bg-surface-2 transition-colors cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            id="confirm-dialog-confirm-btn"
            onClick={onConfirm}
            className={`px-4 py-2 text-[13px] rounded-[8px] transition-colors cursor-pointer shadow-sm ${confirmBtnStyle}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
