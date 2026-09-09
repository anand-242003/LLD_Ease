import { Trash2 } from 'lucide-react';

export interface DangerButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export function DangerButton({
  label,
  onClick,
  disabled = false,
}: DangerButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full h-[38px] px-4 rounded-[var(--r-md)] border border-danger text-danger bg-transparent text-[14px] font-medium flex items-center justify-center gap-2 transition-all duration-fast hover:bg-danger-soft active:translate-y-[1px] disabled:opacity-40 disabled:pointer-events-none cursor-pointer select-none"
    >
      <Trash2 size={16} className="shrink-0" />
      <span>{label}</span>
    </button>
  );
}

export default DangerButton;
