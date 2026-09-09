export interface AddRowButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export function AddRowButton({
  label,
  onClick,
  disabled = false,
}: AddRowButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full h-[36px] rounded-[var(--r-md)] border border-dashed border-border-strong bg-transparent text-text-muted text-[13px] font-medium flex items-center justify-center gap-1.5 transition-all duration-fast hover:border-primary hover:text-primary hover:bg-primary-soft active:scale-[0.99] disabled:opacity-40 disabled:pointer-events-none cursor-pointer select-none"
    >
      {label}
    </button>
  );
}

export default AddRowButton;
