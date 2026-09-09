import { useEffect } from 'react';
import { useAppStore } from '../store';
import { useActiveDocument } from '../store/selectors';

function isInputElement(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;
  const tagName = target.tagName.toLowerCase();
  return (
    tagName === 'input' ||
    tagName === 'textarea' ||
    tagName === 'select' ||
    target.isContentEditable ||
    Boolean(target.closest('[contenteditable="true"]')) ||
    Boolean(target.closest('input, textarea, select'))
  );
}

export function useKeyboardShortcuts(): void {
  const activeDoc = useActiveDocument();
  const setArmedTool = useAppStore((state) => state.setArmedTool);
  const setSelectedElement = useAppStore((state) => state.setSelectedElement);
  const setInkTool = useAppStore((state) => state.setInkTool);
  const setActiveModal = useAppStore((state) => state.setActiveModal);
  const requestFitView = useAppStore((state) => state.requestFitView);
  const removeNode = useAppStore((state) => state.removeNode);
  const removeEdge = useAppStore((state) => state.removeEdge);
  const removeStickyNote = useAppStore((state) => state.removeStickyNote);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput = isInputElement(e.target);
      const modifier = e.metaKey || e.ctrlKey;
      const isZ = e.key === 'z' || e.key === 'Z';
      const isY = e.key === 'y' || e.key === 'Y';

      // ─── 1. Escape Key (Centralized dismiss: closes modal, blurs input, disarms, deselects) ───
      if (e.key === 'Escape') {
        const state = useAppStore.getState();

        if (state.ui.activeModal) {
          e.preventDefault();
          setActiveModal(null);
          return;
        }

        if (isInput && document.activeElement instanceof HTMLElement) {
          e.preventDefault();
          document.activeElement.blur();
          return;
        }

        if (state.ui.inkTool) {
          e.preventDefault();
          setInkTool(null);
          return;
        }

        if (state.ui.armedTool) {
          e.preventDefault();
          setArmedTool(null);
          return;
        }

        if (state.ui.selectedElement) {
          e.preventDefault();
          setSelectedElement(null);
          return;
        }

        return;
      }

      // ─── 2. Text Input Isolation Guard (PRD §10.1 & Phase 27 Step 4) ───
      // If the user is typing inside an input/textarea/contenteditable, suppress non-native shortcuts
      if (isInput) {
        return;
      }

      // ─── 3. Undo / Redo (Cmd/Ctrl+Z, Cmd/Ctrl+Shift+Z, Ctrl+Y) ───
      if (modifier && isZ) {
        e.preventDefault();
        if (activeDoc?.readOnly) return;
        const temporal = (useAppStore as any).temporal;
        if (!temporal) return;

        if (e.shiftKey) {
          temporal.getState().redo();
        } else {
          temporal.getState().undo();
        }
        return;
      }

      if (e.ctrlKey && isY) {
        e.preventDefault();
        if (activeDoc?.readOnly) return;
        const temporal = (useAppStore as any).temporal;
        if (temporal) {
          temporal.getState().redo();
        }
        return;
      }

      // ─── 5. Fit View (Cmd/Ctrl+0) ───
      if (modifier && (e.key === '0' || e.code === 'Digit0' || e.code === 'Numpad0')) {
        e.preventDefault();
        requestFitView();
        return;
      }

      // ─── 6. Delete / Backspace (Delete selected node / edge / sticky) ───
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const state = useAppStore.getState();
        const sel = state.ui.selectedElement;
        const currentDocId = state.activeDocumentId;

        if (sel && currentDocId && !state.isReadOnly(currentDocId)) {
          e.preventDefault();
          if (sel.type === 'node') {
            removeNode(sel.id, currentDocId);
          } else if (sel.type === 'edge') {
            removeEdge(sel.id, currentDocId);
          } else if (sel.type === 'sticky') {
            removeStickyNote(sel.id, currentDocId);
          }
          setSelectedElement(null);
        }
        return;
      }

      // ─── 7. Node Kind Arming (1 – 5 per PRD §10.1) ───
      if (!modifier && !e.altKey && !e.shiftKey && !activeDoc?.readOnly) {
        switch (e.key) {
          case '1':
            e.preventDefault();
            setArmedTool({ type: 'kind', kind: 'CLASS' });
            break;
          case '2':
            e.preventDefault();
            setArmedTool({ type: 'kind', kind: 'ABSTRACT' });
            break;
          case '3':
            e.preventDefault();
            setArmedTool({ type: 'kind', kind: 'INTERFACE' });
            break;
          case '4':
            e.preventDefault();
            setArmedTool({ type: 'kind', kind: 'ENUM' });
            break;
          case '5':
            e.preventDefault();
            setArmedTool({ type: 'kind', kind: 'RECORD' });
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    activeDoc,
    setArmedTool,
    setSelectedElement,
    setInkTool,
    setActiveModal,
    requestFitView,
    removeNode,
    removeEdge,
    removeStickyNote,
  ]);
}

export default useKeyboardShortcuts;
