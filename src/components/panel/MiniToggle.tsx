export interface MiniToggleProps {
  label: string;
  title: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function MiniToggle({
  label,
  title,
  checked,
  onChange,
  disabled = false,
}: MiniToggleProps) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={checked}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) {
          onChange(!checked);
        }
      }}
      className={`w-[26px] h-[26px] shrink-0 rounded-[var(--r-sm)] flex items-center justify-center font-mono font-bold text-[12px] transition-all duration-fast select-none cursor-pointer ${
        checked
          ? 'bg-primary text-primary-fg border border-primary shadow-sm'
          : 'bg-surface-2 border border-border text-text-muted hover:text-text hover:border-border-strong'
      } ${disabled ? 'opacity-40 pointer-events-none cursor-not-allowed' : 'active:scale-95'}`}
    >
      {label}
    </button>
  );
}

export default MiniToggle;
