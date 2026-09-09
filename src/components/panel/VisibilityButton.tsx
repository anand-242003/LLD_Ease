import { Visibility } from '../../domain/types';

export interface VisibilityButtonProps {
  visibility: Visibility;
  onChange: (vis: Visibility) => void;
  disabled?: boolean;
}

const VISIBILITY_SIGNS: Record<Visibility, string> = {
  private: '-',
  public: '+',
  protected: '#',
  package: '~',
};

const NEXT_VISIBILITY: Record<Visibility, Visibility> = {
  private: 'public',
  public: 'protected',
  protected: 'package',
  package: 'private',
};

export function VisibilityButton({
  visibility,
  onChange,
  disabled = false,
}: VisibilityButtonProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    const next = NEXT_VISIBILITY[visibility] || 'private';
    onChange(next);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      title={`Visibility: ${visibility} (click to cycle)`}
      aria-label={`Visibility: ${visibility}`}
      className="w-[32px] h-[32px] shrink-0 rounded-[var(--r-sm)] bg-surface-2 border border-border flex items-center justify-center font-mono font-bold text-[15px] text-text-muted hover:text-text hover:bg-surface-3 hover:border-border-strong active:scale-95 transition-all duration-fast disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
    >
      {VISIBILITY_SIGNS[visibility] || '-'}
    </button>
  );
}

export default VisibilityButton;
