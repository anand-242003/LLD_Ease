import React from 'react';
import { Lock, X } from 'lucide-react';
import { Diagram } from '../../domain/types';
import { useAppStore } from '../../store';

interface DocumentTabProps {
  document: Diagram;
  isActive: boolean;
}

export function DocumentTab({ document, isActive }: DocumentTabProps) {
  const setActiveDocument = useAppStore((state) => state.setActiveDocument);
  const setSelectedElement = useAppStore((state) => state.setSelectedElement);
  const removeDocument = useAppStore((state) => state.removeDocument);

  const isMyDesign = document.id === 'my-design';

  const handleClick = () => {
    if (!isActive) {
      setActiveDocument(document.id);
      setSelectedElement(null); // Clear selection on tab switch per PRD §10.6
    }
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeDocument(document.id);
  };

  return (
    <div
      role="tab"
      aria-selected={isActive}
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      data-testid={`document-tab-${document.id}`}
      className={`h-[30px] px-3.5 rounded-[8px] flex items-center gap-2 text-[13px] transition-colors cursor-pointer select-none shrink-0 ${
        isActive
          ? 'bg-surface-4 text-text font-medium shadow-sm'
          : 'bg-transparent text-text-muted hover:text-text hover:bg-surface-2'
      }`}
    >
      {/* Lock glyph if read-only (PRD §10.6) */}
      {document.readOnly && (
        <Lock size={12} className="text-text-muted shrink-0" aria-label="Read-only" />
      )}

      {/* Tab title */}
      <span className="truncate max-w-[220px]">{document.title}</span>

      {/* PAST badge for attempt tabs or REF badge for reference tabs */}
      {document.readOnly && (
        document.id.startsWith('attempt-') ? (
          <span className="text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400 leading-none">
            PAST
          </span>
        ) : (
          <span className="text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-primary-soft text-primary leading-none">
            REF
          </span>
        )
      )}

      {/* Close button × (never rendered on My Design per BR01) */}
      {!isMyDesign && (
        <button
          type="button"
          onClick={handleClose}
          aria-label={`Close ${document.title}`}
          data-testid={`close-tab-${document.id}`}
          className="ml-1 p-0.5 rounded text-text-muted hover:text-text hover:bg-surface-3 transition-colors shrink-0"
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
}

export default DocumentTab;
