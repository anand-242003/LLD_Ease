import { ViewportPortal } from '@xyflow/react';
import { useActiveDocument } from '../../store/selectors';
import StickyNote from './StickyNote';

export function StickyNoteLayer() {
  const activeDoc = useActiveDocument();
  const stickyNotes = activeDoc?.stickyNotes ?? [];
  const isReadOnly = Boolean(activeDoc?.readOnly);

  if (stickyNotes.length === 0) return null;

  return (
    <ViewportPortal>
      <div
        id="sticky-note-layer"
        data-testid="sticky-note-layer"
        className="pointer-events-none absolute inset-0 z-30 overflow-visible"
      >
        {stickyNotes.map((note) => (
          <div key={note.id} className="pointer-events-auto">
            <StickyNote note={note} isReadOnly={isReadOnly} />
          </div>
        ))}
      </div>
    </ViewportPortal>
  );
}

export default StickyNoteLayer;
