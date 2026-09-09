import React, { useRef, useEffect } from 'react';
import { X, Bold, Italic } from 'lucide-react';
import { StickyNote as StickyNoteType } from '../../domain/types';
import { sanitizeStickyHtml } from '../../domain/sanitization';
import { useAppStore } from '../../store';

export interface StickyNoteProps {
  note: StickyNoteType;
  isReadOnly?: boolean;
}

/**
 * 7 Color dot presets per DESIGN.md §2 and PRD §9.14 (S22).
 * Default note color is --sticky-default (#FDE047 yellow).
 */
export const STICKY_PALETTE = [
  { id: 'white', color: '#F8FAFC', label: 'White', varName: '--sticky-white' },
  { id: 'red', color: '#FCA5A5', label: 'Red', varName: '--sticky-red' },
  { id: 'orange', color: '#FDBA74', label: 'Orange', varName: '--sticky-orange' },
  { id: 'green', color: '#86EFAC', label: 'Green', varName: '--sticky-green' },
  { id: 'teal', color: '#5EEAD4', label: 'Teal', varName: '--sticky-teal' },
  { id: 'purple', color: '#C4B5FD', label: 'Purple', varName: '--sticky-purple' },
  { id: 'pink', color: '#F9A8D4', label: 'Pink', varName: '--sticky-pink' },
] as const;

export function StickyNote({ note, isReadOnly = false }: StickyNoteProps) {
  const updateStickyNote = useAppStore((state) => state.updateStickyNote);
  const removeStickyNote = useAppStore((state) => state.removeStickyNote);
  const activeDocumentId = useAppStore((state) => state.activeDocumentId);
  const selectedElement = useAppStore((state) => state.ui.selectedElement);
  const setSelectedElement = useAppStore((state) => state.setSelectedElement);

  const isSelected = selectedElement?.type === 'sticky' && selectedElement.id === note.id;

  const bodyRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Synchronize contentEditable with sanitized note.content on initial mount or when note content changes externally
  useEffect(() => {
    if (bodyRef.current) {
      const sanitized = sanitizeStickyHtml(note.content);
      if (bodyRef.current.innerHTML !== sanitized) {
        bodyRef.current.innerHTML = sanitized;
      }
    }
  }, [note.content]);

  // Click outside to deselect
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        if (isSelected) {
          setSelectedElement(null);
        }
      }
    };
    document.addEventListener('pointerdown', handleDocumentClick);
    return () => document.removeEventListener('pointerdown', handleDocumentClick);
  }, [isSelected, setSelectedElement]);

  // Format Bold / Italic
  const applyFormat = (command: 'bold' | 'italic') => {
    if (isReadOnly) return;
    if (bodyRef.current) {
      bodyRef.current.focus();
      document.execCommand(command, false);
      updateStickyNote(note.id, { content: bodyRef.current.innerHTML }, activeDocumentId);
    }
  };

  // Keyboard shortcut handler for Bold/Italic
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
      e.preventDefault();
      applyFormat('bold');
    } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'i') {
      e.preventDefault();
      applyFormat('italic');
    }
  };

  const handleInput = () => {
    if (isReadOnly || !bodyRef.current) return;
    updateStickyNote(note.id, { content: bodyRef.current.innerHTML }, activeDocumentId);
  };

  // Intercept paste to sanitize malicious HTML before inserting into live DOM
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    if (isReadOnly) return;
    e.preventDefault();
    const html = e.clipboardData.getData('text/html');
    const text = e.clipboardData.getData('text/plain');
    const clean = sanitizeStickyHtml(html || text);
    document.execCommand('insertHTML', false, clean);
    if (bodyRef.current) {
      updateStickyNote(note.id, { content: bodyRef.current.innerHTML }, activeDocumentId);
    }
  };

  // Dragging the header to reposition
  const handleHeaderPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isReadOnly || e.button !== 0) return;
    // Don't drag if clicking buttons inside header
    if ((e.target as HTMLElement).closest('button')) return;

    e.preventDefault();
    e.stopPropagation();
    setSelectedElement({ type: 'sticky', id: note.id });

    const startX = e.clientX;
    const startY = e.clientY;
    const initialPosX = note.position.x;
    const initialPosY = note.position.y;

    // Current zoom scale from React Flow viewport
    const viewportElem = containerRef.current?.closest('.react-flow__viewport') as HTMLElement | null;
    let zoom = 1;
    if (viewportElem) {
      const match = /scale\(([^)]+)\)/.exec(viewportElem.style.transform);
      if (match && match[1]) {
        zoom = parseFloat(match[1]) || 1;
      }
    }

    const onPointerMove = (moveEvent: PointerEvent) => {
      const dx = (moveEvent.clientX - startX) / zoom;
      const dy = (moveEvent.clientY - startY) / zoom;
      updateStickyNote(
        note.id,
        {
          position: {
            x: Math.round(initialPosX + dx),
            y: Math.round(initialPosY + dy),
          },
        },
        activeDocumentId
      );
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  // Corner resize handler (handles nw, ne, sw, se)
  const handleResizePointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    corner: 'se' | 'sw' | 'ne' | 'nw'
  ) => {
    if (isReadOnly || e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startY = e.clientY;
    const initialWidth = note.size.width;
    const initialHeight = note.size.height;
    const initialX = note.position.x;
    const initialY = note.position.y;

    const viewportElem = containerRef.current?.closest('.react-flow__viewport') as HTMLElement | null;
    let zoom = 1;
    if (viewportElem) {
      const match = /scale\(([^)]+)\)/.exec(viewportElem.style.transform);
      if (match && match[1]) {
        zoom = parseFloat(match[1]) || 1;
      }
    }

    const onPointerMove = (moveEvent: PointerEvent) => {
      const dx = (moveEvent.clientX - startX) / zoom;
      const dy = (moveEvent.clientY - startY) / zoom;

      let newWidth = initialWidth;
      let newHeight = initialHeight;
      let newX = initialX;
      let newY = initialY;

      if (corner === 'se') {
        newWidth = Math.max(180, Math.round(initialWidth + dx));
        newHeight = Math.max(120, Math.round(initialHeight + dy));
      } else if (corner === 'sw') {
        newWidth = Math.max(180, Math.round(initialWidth - dx));
        newX = Math.round(initialX + (initialWidth - newWidth));
        newHeight = Math.max(120, Math.round(initialHeight + dy));
      } else if (corner === 'ne') {
        newWidth = Math.max(180, Math.round(initialWidth + dx));
        newHeight = Math.max(120, Math.round(initialHeight - dy));
        newY = Math.round(initialY + (initialHeight - newHeight));
      } else if (corner === 'nw') {
        newWidth = Math.max(180, Math.round(initialWidth - dx));
        newX = Math.round(initialX + (initialWidth - newWidth));
        newHeight = Math.max(120, Math.round(initialHeight - dy));
        newY = Math.round(initialY + (initialHeight - newHeight));
      }

      updateStickyNote(
        note.id,
        {
          position: { x: newX, y: newY },
          size: { width: newWidth, height: newHeight },
        },
        activeDocumentId
      );
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const isEmpty = !note.content || note.content.trim() === '' || note.content === '<br>';
  const noteBg = note.color || 'var(--sticky-default, #FDE047)';

  return (
    <div
      ref={containerRef}
      id={`sticky-note-${note.id}`}
      data-testid={`sticky-note-${note.id}`}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedElement({ type: 'sticky', id: note.id });
      }}
      className={`absolute flex flex-col rounded-[14px] shadow-lg border border-black/10 overflow-visible select-none transition-shadow ${
        isSelected ? 'ring-2 ring-primary/90 shadow-2xl' : 'hover:shadow-xl'
      }`}
      style={{
        left: note.position.x,
        top: note.position.y,
        width: note.size.width,
        height: note.size.height,
        backgroundColor: noteBg,
        zIndex: isSelected ? 40 : 30,
      }}
    >
      {/* Header Strip */}
      <div
        onPointerDown={handleHeaderPointerDown}
        className={`h-[34px] px-2.5 bg-black/10 flex items-center justify-between gap-1.5 shrink-0 rounded-t-[14px] ${
          isReadOnly ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'
        }`}
      >
        {/* Exactly 7 Color preset dots (PRD §9.14 / AC 28) */}
        {!isReadOnly ? (
          <div className="flex items-center gap-1">
            {STICKY_PALETTE.map((item) => {
              const currentColor = (note.color || 'var(--sticky-default)').toLowerCase();
              const isActive =
                currentColor === item.color.toLowerCase() ||
                currentColor.includes(item.varName) ||
                currentColor === `var(${item.varName})`.toLowerCase();

              return (
                <button
                  key={item.id}
                  type="button"
                  title={item.label}
                  aria-label={`Set sticky note color to ${item.label}`}
                  data-testid={`sticky-color-${item.id}`}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    updateStickyNote(note.id, { color: item.color }, activeDocumentId);
                  }}
                  className={`w-3.5 h-3.5 rounded-full border transition-transform cursor-pointer ${
                    isActive
                      ? 'scale-125 border-slate-900 ring-1 ring-slate-900 shadow-xs'
                      : 'border-black/20 hover:scale-110'
                  }`}
                  style={{ backgroundColor: item.color }}
                />
              );
            })}
          </div>
        ) : (
          <span className="text-[11px] font-semibold text-slate-700/60 uppercase tracking-wider">
            NOTE
          </span>
        )}

        {/* Action buttons (Bold, Italic, Close) */}
        {!isReadOnly && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              title="Bold (⌘B)"
              aria-label="Format bold"
              data-testid="sticky-btn-bold"
              onPointerDown={(e) => {
                // Prevent button click from stealing contenteditable text selection
                e.preventDefault();
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.stopPropagation();
                applyFormat('bold');
              }}
              className="w-5 h-5 flex items-center justify-center rounded hover:bg-black/15 text-slate-800 transition-colors cursor-pointer"
            >
              <Bold size={12} strokeWidth={2.5} />
            </button>
            <button
              type="button"
              title="Italic (⌘I)"
              aria-label="Format italic"
              data-testid="sticky-btn-italic"
              onPointerDown={(e) => {
                // Prevent button click from stealing contenteditable text selection
                e.preventDefault();
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.stopPropagation();
                applyFormat('italic');
              }}
              className="w-5 h-5 flex items-center justify-center rounded hover:bg-black/15 text-slate-800 transition-colors cursor-pointer"
            >
              <Italic size={12} strokeWidth={2.5} />
            </button>
            <button
              type="button"
              title="Delete note"
              aria-label="Delete note"
              data-testid="sticky-btn-delete"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                removeStickyNote(note.id, activeDocumentId);
                setSelectedElement(null);
              }}
              className="w-5 h-5 flex items-center justify-center rounded hover:bg-black/15 text-slate-800 transition-colors cursor-pointer ml-1"
            >
              <X size={13} strokeWidth={2.2} />
            </button>
          </div>
        )}
      </div>

      {/* Body Content */}
      <div className="relative flex-1 p-3 overflow-y-auto cursor-text text-slate-900 rounded-b-[14px]">
        <div
          ref={bodyRef}
          contentEditable={!isReadOnly}
          suppressContentEditableWarning
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          className="min-h-full outline-hidden text-[13px] leading-relaxed select-text font-sans font-normal break-words"
        />
        {/* Placeholder when empty */}
        {isEmpty && !isReadOnly && (
          <div
            onClick={() => bodyRef.current?.focus()}
            className="absolute top-3 left-3 right-3 text-[12px] text-slate-500/70 italic pointer-events-none select-none leading-relaxed"
          >
            Write a note… (⌘/Ctrl+B bold · ⌘/Ctrl+I italic)
          </div>
        )}
      </div>

      {/* Corner Resize Handles (AC 29 & S24) */}
      {isSelected && !isReadOnly && (
        <>
          {/* Top-Left */}
          <div
            onPointerDown={(e) => handleResizePointerDown(e, 'nw')}
            title="Resize note"
            data-testid="sticky-resize-handle-nw"
            className="sticky-resize-handle absolute -top-1 -left-1 w-3 h-3 cursor-nwse-resize flex items-center justify-center z-50"
          >
            <div className="w-2 h-2 bg-white border border-slate-900/60 rounded-[1px] shadow-xs" />
          </div>

          {/* Top-Right */}
          <div
            onPointerDown={(e) => handleResizePointerDown(e, 'ne')}
            title="Resize note"
            data-testid="sticky-resize-handle-ne"
            className="sticky-resize-handle absolute -top-1 -right-1 w-3 h-3 cursor-nesw-resize flex items-center justify-center z-50"
          >
            <div className="w-2 h-2 bg-white border border-slate-900/60 rounded-[1px] shadow-xs" />
          </div>

          {/* Bottom-Left */}
          <div
            onPointerDown={(e) => handleResizePointerDown(e, 'sw')}
            title="Resize note"
            data-testid="sticky-resize-handle-sw"
            className="sticky-resize-handle absolute -bottom-1 -left-1 w-3 h-3 cursor-nesw-resize flex items-center justify-center z-50"
          >
            <div className="w-2 h-2 bg-white border border-slate-900/60 rounded-[1px] shadow-xs" />
          </div>

          {/* Bottom-Right */}
          <div
            onPointerDown={(e) => handleResizePointerDown(e, 'se')}
            title="Resize note"
            data-testid="sticky-resize-handle-se"
            className="sticky-resize-handle absolute -bottom-1 -right-1 w-3 h-3 cursor-nwse-resize flex items-center justify-center z-50"
          >
            <div className="w-2 h-2 bg-white border border-slate-900/60 rounded-[1px] shadow-xs" />
          </div>
        </>
      )}
    </div>
  );
}

export default StickyNote;
