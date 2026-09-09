import React from 'react';
import { useAppStore } from '../../store';
import { useActiveDocument } from '../../store/selectors';

const PLACEHOLDER_COPY = `Jot down your approach, trade-offs, edge cases, patterns to remember…\n\nThese notes are saved with this diagram and persist across reloads.`;

export function NotesPanel() {
  const activeDoc = useActiveDocument();
  const updateScratchNotes = useAppStore((state) => state.updateScratchNotes);
  const isReadOnly = activeDoc?.readOnly ?? false;

  const notes = activeDoc?.scratchNotes ?? '';

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isReadOnly || !activeDoc) return;
    // Cap at 100k characters for storage safety per PRD §10.5.4
    const value = e.target.value.slice(0, 100000);
    updateScratchNotes(activeDoc.id, value);
  };

  return (
    <div className="flex flex-col h-full flex-1">
      {/* Header row: SCRATCH NOTES (left) and saved automatically (right) */}
      <div className="flex items-center justify-between mb-3 shrink-0">
        <span className="text-[11px] font-semibold tracking-[0.08em] text-text-muted uppercase">
          SCRATCH NOTES
        </span>
        <span className="text-[12px] text-text-faint">
          saved automatically
        </span>
      </div>

      {/* Monospace textarea filling the panel */}
      <textarea
        value={notes}
        onChange={handleChange}
        readOnly={isReadOnly}
        placeholder={PLACEHOLDER_COPY}
        aria-label="Scratch notes"
        data-testid="notes-textarea"
        className={`w-full flex-1 p-3.5 rounded-[10px] bg-surface-2 border border-border text-text font-mono text-[13px] leading-relaxed resize-none outline-none transition-colors duration-fast ${
          isReadOnly
            ? 'opacity-60 bg-surface-1 cursor-default'
            : 'hover:border-border-strong focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-ring)]'
        }`}
      />
    </div>
  );
}

export default NotesPanel;
