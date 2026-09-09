import { useEffect, useState } from 'react';
import { StickyNote, Plus, X } from 'lucide-react';
import { useAppStore } from '../../store';
import { ClassKind, RelationshipType } from '../../domain/types';
import PaletteRow from './PaletteRow';
import ProblemContextPanel from './ProblemContextPanel';
import { useBreakpoint } from '../../hooks/useMediaQuery';

interface PaletteKindItem {
  kind: ClassKind;
  label: string;
  dotColor: string;
}

interface PaletteRelationshipItem {
  type: RelationshipType;
  label: string;
  glyph: string;
}

const CLASS_KINDS: PaletteKindItem[] = [
  { kind: 'CLASS', label: 'Class', dotColor: 'var(--kind-class)' },
  { kind: 'ABSTRACT', label: 'Abstract', dotColor: 'var(--kind-abstract)' },
  { kind: 'INTERFACE', label: 'Interface', dotColor: 'var(--kind-interface)' },
  { kind: 'ENUM', label: 'Enum', dotColor: 'var(--kind-enum)' },
  { kind: 'RECORD', label: 'Record', dotColor: 'var(--kind-record)' },
];

const RELATIONSHIPS: PaletteRelationshipItem[] = [
  { type: 'INHERIT', label: 'Inherit', glyph: '▷' },
  { type: 'REALIZE', label: 'Realize', glyph: '▷' },
  { type: 'COMPOSE', label: 'Compose', glyph: '◆' },
  { type: 'AGGREGATE', label: 'Aggregate', glyph: '◇' },
  { type: 'ASSOCIATE', label: 'Associate', glyph: '→' },
  { type: 'DEPEND', label: 'Depend', glyph: '⇢' },
];

export function PaletteSidebar() {
  const armedTool = useAppStore((state) => state.ui.armedTool);
  const setArmedTool = useAppStore((state) => state.setArmedTool);
  const activeDocument = useAppStore((state) =>
    state.documents.find((d) => d.id === state.activeDocumentId)
  );
  const isReadOnly = Boolean(activeDocument?.readOnly);

  const { isMobile, isTablet } = useBreakpoint();
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);

  // Disarm on Escape key per PRD §12.2 and Phase 9 Step 1
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && armedTool) {
        setArmedTool(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [armedTool, setArmedTool]);

  // If active document switches to read-only, disarm automatically
  useEffect(() => {
    if (isReadOnly && armedTool) {
      setArmedTool(null);
    }
  }, [isReadOnly, armedTool, setArmedTool]);

  // Render mobile FAB and bottom sheet (<768px, PRD §18.4)
  if (isMobile) {
    return (
      <>
        {/* Floating + FAB for Palette (PRD §18.4) */}
        <button
          id="palette-mobile-fab"
          data-testid="palette-mobile-fab"
          type="button"
          aria-label={isMobileSheetOpen ? 'Close tools palette' : 'Add class or tool'}
          onClick={() => setIsMobileSheetOpen((prev) => !prev)}
          className="fixed bottom-6 left-6 z-40 w-12 h-12 rounded-full bg-primary text-primary-fg shadow-lg flex items-center justify-center font-bold text-2xl hover:scale-105 active:scale-95 transition-transform cursor-pointer border border-primary/30"
        >
          {isMobileSheetOpen ? <X size={22} /> : <Plus size={22} />}
        </button>

        {/* Bottom Sheet for Palette */}
        {isMobileSheetOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end select-none">
            <div className="bg-surface-1 border-t border-border rounded-t-2xl p-4 max-h-[75vh] overflow-y-auto flex flex-col gap-4 shadow-2xl">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <span className="text-[14px] font-semibold text-text">Tools & Classes</span>
                <button
                  type="button"
                  aria-label="Close tools sheet"
                  onClick={() => setIsMobileSheetOpen(false)}
                  className="p-1.5 rounded-md text-text-muted hover:text-text hover:bg-surface-2 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <ProblemContextPanel />

              {/* Tools list in mobile sheet */}
              <div className="flex flex-col gap-3">
                <span className="text-[11px] font-semibold text-text-muted tracking-wider uppercase">
                  Add Class
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {CLASS_KINDS.map((item) => (
                    <PaletteRow
                      key={item.kind}
                      id={`palette-kind-${item.kind.toLowerCase()}`}
                      label={item.label}
                      isArmed={armedTool?.type === 'kind' && armedTool.kind === item.kind}
                      isDisabled={isReadOnly}
                      onClick={() => {
                        setArmedTool({ type: 'kind', kind: item.kind });
                        setIsMobileSheetOpen(false);
                      }}
                      icon={
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: item.dotColor }}
                        />
                      }
                    />
                  ))}
                </div>

                <span className="text-[11px] font-semibold text-text-muted tracking-wider uppercase mt-2">
                  Relationships
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {RELATIONSHIPS.map((item) => (
                    <PaletteRow
                      key={item.type}
                      id={`palette-rel-${item.type.toLowerCase()}`}
                      label={item.label}
                      isArmed={
                        armedTool?.type === 'relationship' && armedTool.relType === item.type
                      }
                      isDisabled={isReadOnly}
                      onClick={() => {
                        setArmedTool({ type: 'relationship', relType: item.type });
                        setIsMobileSheetOpen(false);
                      }}
                      icon={
                        <span className="w-5 text-center font-mono text-[16px]">{item.glyph}</span>
                      }
                    />
                  ))}
                </div>

                <span className="text-[11px] font-semibold text-text-muted tracking-wider uppercase mt-2">
                  Annotations
                </span>
                <PaletteRow
                  id="palette-annotate-sticky"
                  data-testid="palette-annotate-sticky"
                  label="Sticky note"
                  isArmed={armedTool?.type === 'sticky'}
                  isDisabled={isReadOnly}
                  onClick={() => {
                    setArmedTool({ type: 'sticky' });
                    setIsMobileSheetOpen(false);
                  }}
                  icon={<StickyNote size={18} className="text-sticky-default" />}
                />
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <aside
      id="palette-sidebar"
      className={`${
        isTablet ? 'w-[64px] px-2 py-3 gap-3 items-center' : 'w-[265px] p-4 gap-6'
      } bg-surface-1 border-r border-border h-full flex flex-col select-none overflow-y-auto shrink-0 transition-all duration-200`}
    >
      {/* Problem Context Panel (Phase 31) — full-width sidebar only, not the tablet icon rail */}
      {!isTablet && <ProblemContextPanel />}

      {/* Group 1: Class Kinds */}
      <section className="flex flex-col gap-2 w-full items-center">
        {!isTablet && (
          <h3 className="text-[11px] font-semibold text-text-muted tracking-[0.08em] uppercase w-full">
            ADD CLASS · DRAG ONTO CANVAS
          </h3>
        )}
        <div className={`flex flex-col gap-1.5 w-full ${isTablet ? 'items-center' : ''}`}>
          {CLASS_KINDS.map((item) => {
            const isArmed = armedTool?.type === 'kind' && armedTool.kind === item.kind;
            return (
              <PaletteRow
                key={item.kind}
                id={`palette-kind-${item.kind.toLowerCase()}`}
                data-testid={`palette-kind-${item.kind.toLowerCase()}`}
                label={item.label}
                isArmed={isArmed}
                isDisabled={isReadOnly}
                isDraggable={!isReadOnly}
                isCompact={isTablet}
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/reactflow/kind', item.kind);
                  e.dataTransfer.effectAllowed = 'move';
                }}
                onClick={() => {
                  setArmedTool({ type: 'kind', kind: item.kind });
                }}
                icon={
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: item.dotColor }}
                  />
                }
              />
            );
          })}
        </div>
      </section>

      {/* Group 2: Relationships */}
      <section className="flex flex-col gap-2 w-full items-center">
        {!isTablet && (
          <h3 className="text-[11px] font-semibold text-text-muted tracking-[0.08em] uppercase w-full">
            RELATIONSHIP · DRAG NODE → NODE
          </h3>
        )}
        <div className={`flex flex-col gap-1.5 w-full ${isTablet ? 'items-center' : ''}`}>
          {RELATIONSHIPS.map((item) => {
            const isArmed = armedTool?.type === 'relationship' && armedTool.relType === item.type;
            return (
              <PaletteRow
                key={item.type}
                id={`palette-rel-${item.type.toLowerCase()}`}
                data-testid={`palette-rel-${item.type.toLowerCase()}`}
                label={item.label}
                isArmed={isArmed}
                isDisabled={isReadOnly}
                isDraggable={false}
                isCompact={isTablet}
                onClick={() => {
                  setArmedTool({ type: 'relationship', relType: item.type });
                }}
                icon={
                  <span
                    className={`w-5 text-center font-mono text-[16px] shrink-0 transition-colors ${
                      isArmed ? 'text-primary' : 'text-text-muted'
                    }`}
                  >
                    {item.glyph}
                  </span>
                }
              />
            );
          })}
        </div>
        {!isTablet && (
          <p className="text-[12px] text-text-muted leading-relaxed mt-1 px-1">
            Pick a type, then drag from one class's edge to another to connect them.
          </p>
        )}
      </section>

      {/* Group 3: Annotate */}
      <section className="flex flex-col gap-2 w-full items-center">
        {!isTablet && (
          <h3 className="text-[11px] font-semibold text-text-muted tracking-[0.08em] uppercase w-full">
            ANNOTATE
          </h3>
        )}
        <div className={`flex flex-col gap-1.5 w-full ${isTablet ? 'items-center' : ''}`}>
          <PaletteRow
            id="palette-annotate-sticky"
            data-testid="palette-annotate-sticky"
            label="Sticky note"
            isArmed={armedTool?.type === 'sticky'}
            isDisabled={isReadOnly}
            isDraggable={!isReadOnly}
            isCompact={isTablet}
            onDragStart={(e) => {
              e.dataTransfer.setData('application/reactflow/type', 'sticky');
              e.dataTransfer.effectAllowed = 'move';
            }}
            onClick={() => {
              setArmedTool({ type: 'sticky' });
            }}
            icon={<StickyNote size={18} className="text-sticky-default shrink-0" />}
          />
        </div>
      </section>
    </aside>
  );
}

export default PaletteSidebar;
