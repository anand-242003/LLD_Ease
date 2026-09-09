import { useState, useEffect } from 'react';
import { Pen, Eraser, Trash2 } from 'lucide-react';
import { useAppStore } from '../../store';
import { useActiveDocument } from '../../store/selectors';
import ConfirmDialog from '../ui/ConfirmDialog';

const INK_COLORS = [
  { id: 'cyan', hex: '#22D3EE', tooltip: '#22d3ee', label: 'Cyan' },
  { id: 'red', hex: '#f43f5e', tooltip: '#f43f5e', label: 'Red' },
  { id: 'amber', hex: '#FBBF24', tooltip: '#fbbf24', label: 'Amber' },
  { id: 'purple', hex: '#A78BFA', tooltip: '#a78bfa', label: 'Purple' },
  { id: 'white', hex: '#F8FAFC', tooltip: '#f8fafc', label: 'White' },
];

const INK_WIDTHS = [
  { value: 2, label: 'Small', dotSize: 4 },
  { value: 4, label: 'Medium', dotSize: 7 },
  { value: 8, label: 'Large', dotSize: 10 },
];

export function InkToolbar() {
  const activeDoc = useActiveDocument();
  const inkTool = useAppStore((state) => state.ui.inkTool);
  const inkColor = useAppStore((state) => state.ui.inkColor);
  const inkWidth = useAppStore((state) => state.ui.inkWidth);
  const setInkTool = useAppStore((state) => state.setInkTool);
  const setInkColor = useAppStore((state) => state.setInkColor);
  const setInkWidth = useAppStore((state) => state.setInkWidth);
  const clearInkStrokes = useAppStore((state) => state.clearInkStrokes);

  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const isReadOnly = Boolean(activeDoc?.readOnly);
  const hasStrokes = (activeDoc?.inkStrokes?.length ?? 0) > 0;

  // Disarm on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && inkTool) {
        setInkTool(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inkTool, setInkTool]);

  // If document is read-only, disarm automatically
  useEffect(() => {
    if (isReadOnly && inkTool) {
      setInkTool(null);
    }
  }, [isReadOnly, inkTool, setInkTool]);

  // Per PRD §8.2: Toolbar is hidden entirely on read-only tabs
  if (isReadOnly) return null;

  const isExpanded = inkTool === 'pen';

  const handleTogglePen = () => {
    if (inkTool === 'pen') {
      setInkTool(null);
    } else {
      setInkTool('pen');
    }
  };

  const handleToggleEraser = () => {
    if (inkTool === 'eraser') {
      setInkTool(null);
    } else {
      setInkTool('eraser');
    }
  };

  const handleConfirmClear = () => {
    if (activeDoc?.id) {
      clearInkStrokes(activeDoc.id);
    }
    setShowClearConfirm(false);
  };

  return (
    <>
      <div
        id="ink-toolbar"
        data-testid="ink-toolbar"
        className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 bg-surface-1/95 backdrop-blur-md border border-border/80 shadow-lg rounded-full px-3 py-1.5 flex items-center gap-2 select-none transition-all duration-200"
      >
        {/* Pen Button */}
        <button
          type="button"
          id="ink-tool-pen"
          data-testid="ink-tool-pen"
          title={inkTool === 'pen' ? 'Disarm pen (Esc)' : 'Draw with pen'}
          aria-label={inkTool === 'pen' ? 'Disarm pen (Esc)' : 'Draw with pen'}
          onClick={handleTogglePen}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
            inkTool === 'pen'
              ? 'bg-primary/20 text-primary border border-primary/50 shadow-xs'
              : 'text-text-muted hover:text-text hover:bg-surface-2'
          }`}
        >
          <Pen size={15} />
        </button>

        {/* Eraser Button (Red-tinted active state per DESIGN.md §10.4.3) */}
        <button
          type="button"
          id="ink-tool-eraser"
          data-testid="ink-tool-eraser"
          title={inkTool === 'eraser' ? 'Disarm eraser (Esc)' : 'Erase strokes'}
          aria-label={inkTool === 'eraser' ? 'Disarm eraser (Esc)' : 'Erase strokes'}
          onClick={handleToggleEraser}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
            inkTool === 'eraser'
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-xs'
              : 'text-text-muted hover:text-text hover:bg-surface-2'
          }`}
        >
          <Eraser size={15} />
        </button>

        {/* Expanded Controls (Shown when pen is armed) */}
        {isExpanded && (
          <>
            <div className="w-px h-5 bg-border" />

            {/* 5 Color Swatches */}
            <div className="flex items-center gap-1.5 px-1">
              {INK_COLORS.map((swatch) => {
                const isSelected = inkColor.toLowerCase() === swatch.hex.toLowerCase();
                return (
                  <div key={swatch.id} className="relative group flex items-center justify-center">
                    <button
                      type="button"
                      id={`ink-color-${swatch.id}`}
                      data-testid={`ink-color-${swatch.id}`}
                      title={swatch.tooltip}
                      aria-label={`Ink color ${swatch.label}`}
                      onClick={() => setInkColor(swatch.hex)}
                      className={`w-5 h-5 rounded-full transition-all cursor-pointer border ${
                        isSelected
                          ? 'scale-115 ring-2 ring-primary border-white'
                          : 'border-white/20 hover:scale-110'
                      }`}
                      style={{ backgroundColor: swatch.hex }}
                    />
                    {/* Hover Hex Tooltip */}
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-[#141419] text-text font-mono text-[11px] px-1.5 py-0.5 rounded shadow border border-border whitespace-nowrap z-40">
                      {swatch.tooltip}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="w-px h-5 bg-border" />

            {/* 3 Width Dots */}
            <div className="flex items-center gap-1 bg-surface-2/70 p-1 rounded-full border border-border/60">
              {INK_WIDTHS.map((w) => {
                const isSelected = inkWidth === w.value;
                return (
                  <button
                    key={w.value}
                    type="button"
                    id={`ink-width-${w.value}`}
                    data-testid={`ink-width-${w.value}`}
                    title={`${w.label} width (${w.value}px)`}
                    aria-label={`${w.label} line width`}
                    onClick={() => setInkWidth(w.value)}
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                      isSelected ? 'bg-surface-1 text-primary shadow-xs' : 'hover:bg-surface-1/50'
                    }`}
                  >
                    <span
                      className={`rounded-full ${isSelected ? 'bg-primary' : 'bg-text-muted'}`}
                      style={{ width: w.dotSize, height: w.dotSize }}
                    />
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* Trash Icon (Appears only once inkStrokes.length > 0 per PRD §10.4.3 / §12.6) */}
        {hasStrokes && (
          <>
            <div className="w-px h-5 bg-border" />
            <button
              type="button"
              id="ink-clear-all"
              data-testid="ink-clear-all"
              title="Clear all ink"
              aria-label="Clear all ink"
              onClick={() => setShowClearConfirm(true)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
            >
              <Trash2 size={15} />
            </button>
          </>
        )}
      </div>

      {/* Confirmation Dialog for Clearing Ink */}
      <ConfirmDialog
        isOpen={showClearConfirm}
        title="Clear ink"
        message="Are you sure you want to clear all ink strokes on this diagram?"
        confirmLabel="Clear ink"
        variant="danger"
        onConfirm={handleConfirmClear}
        onCancel={() => setShowClearConfirm(false)}
      />
    </>
  );
}

export default InkToolbar;
