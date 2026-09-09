import React, { useState } from 'react';

export interface PaletteRowProps {
  id?: string;
  label: string;
  icon: React.ReactNode;
  isArmed?: boolean;
  isDisabled?: boolean;
  isDraggable?: boolean;
  isCompact?: boolean;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd?: (e: React.DragEvent<HTMLDivElement>) => void;
  onClick?: () => void;
  'data-testid'?: string;
}

export function PaletteRow({
  id,
  label,
  icon,
  isArmed = false,
  isDisabled = false,
  isDraggable = false,
  isCompact = false,
  onDragStart,
  onDragEnd,
  onClick,
  'data-testid': testId,
}: PaletteRowProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    if (isDisabled || !isDraggable) {
      e.preventDefault();
      return;
    }
    setIsDragging(true);
    onDragStart?.(e);
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    setIsDragging(false);
    onDragEnd?.(e);
  };

  return (
    <div
      id={id}
      data-testid={testId}
      role="button"
      tabIndex={isDisabled ? -1 : 0}
      aria-pressed={isArmed}
      aria-disabled={isDisabled}
      aria-label={label}
      title={label}
      draggable={!isDisabled && isDraggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={() => {
        if (!isDisabled) {
          onClick?.();
        }
      }}
      onKeyDown={(e) => {
        if (!isDisabled && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={`${
        isCompact
          ? 'w-[44px] h-[44px] justify-center px-0'
          : 'w-full h-[46px] px-[14px] justify-start'
      } rounded-[var(--r-md)] flex items-center gap-3 font-sans text-[15px] select-none transition-all duration-fast ${
        isDisabled
          ? 'opacity-40 cursor-not-allowed bg-surface-2 border border-border text-text pointer-events-none'
          : isArmed
          ? 'border border-primary text-primary bg-primary-soft shadow-[inset_0_0_0_1px_var(--primary)] cursor-pointer'
          : `bg-surface-2 border border-border text-text hover:bg-surface-3 cursor-${
              isDraggable ? 'grab' : 'pointer'
            }`
      } ${isDragging ? 'opacity-60' : ''}`}
    >
      <span className="shrink-0 flex items-center justify-center">
        {icon}
      </span>
      {!isCompact && <span className="font-normal truncate">{label}</span>}
    </div>
  );
}

export default PaletteRow;
