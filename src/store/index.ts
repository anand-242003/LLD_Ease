import { create } from 'zustand';
import { temporal } from 'zundo';
import { createWorkspaceSlice, WorkspaceSlice } from './workspaceSlice';
import { createDocumentSlice, DocumentSlice } from './documentSlice';
import { createUiSlice, UiSlice } from './uiSlice';
import { createPracticeSlice, PracticeSlice } from './practiceSlice';
import { createProfileSlice, ProfileSlice } from './profileSlice';
import { createToastSlice, ToastSlice } from './toastSlice';
import { initPersistence } from './persist';

export type AppStoreState = WorkspaceSlice &
  DocumentSlice &
  UiSlice &
  PracticeSlice &
  ProfileSlice &
  ToastSlice;

// Helper to compare document model state while ignoring viewport and timestamps
function areDocumentModelsEqual(
  a: { documents: any[]; activeDocumentId?: string },
  b: { documents: any[]; activeDocumentId?: string }
): boolean {
  if (!a.documents || !b.documents) return a.documents === b.documents;
  if (a.documents.length !== b.documents.length) return false;

  for (let i = 0; i < a.documents.length; i++) {
    const docA = a.documents[i];
    const docB = b.documents[i];
    if (!docA || !docB) return false;
    if (docA.id !== docB.id) return false;
    if (docA.title !== docB.title) return false;
    if (docA.readOnly !== docB.readOnly) return false;
    if (docA.scratchNotes !== docB.scratchNotes) return false;
    if (docA.nodes !== docB.nodes && JSON.stringify(docA.nodes) !== JSON.stringify(docB.nodes))
      return false;
    if (docA.edges !== docB.edges && JSON.stringify(docA.edges) !== JSON.stringify(docB.edges))
      return false;
    if (
      docA.stickyNotes !== docB.stickyNotes &&
      JSON.stringify(docA.stickyNotes) !== JSON.stringify(docB.stickyNotes)
    )
      return false;
    if (
      docA.inkStrokes !== docB.inkStrokes &&
      JSON.stringify(docA.inkStrokes) !== JSON.stringify(docB.inkStrokes)
    )
      return false;
  }

  return true;
}

export const useAppStore = create<AppStoreState>()(
  temporal(
    (...a) => ({
      ...createWorkspaceSlice(...a),
      ...createDocumentSlice(...a),
      ...createUiSlice(...a),
      ...createPracticeSlice(...a),
      ...createProfileSlice(...a),
      ...createToastSlice(...a),
    }),
    {
      // Only track undo/redo for diagram documents mutations
      partialize: (state) => ({
        documents: state.documents,
        activeDocumentId: state.activeDocumentId,
      }),
      equality: areDocumentModelsEqual,
      handleSet: (handleSet) => (pastState, replace, _currentState, _deltaState) => {
        const currentDocs = useAppStore?.getState?.()?.documents || [];
        const currentViewports = new Map(currentDocs.map((d) => [d.id, d.viewport]));

        if (
          pastState &&
          typeof pastState === 'object' &&
          'documents' in pastState &&
          Array.isArray((pastState as any).documents)
        ) {
          const updatedDocs = (pastState as any).documents.map((doc: any) => ({
            ...doc,
            viewport: currentViewports.get(doc.id) ?? doc.viewport,
          }));
          handleSet({ ...(pastState as any), documents: updatedDocs }, replace);
        } else {
          handleSet(pastState, replace);
        }
      },
      limit: 50,
    }
  )
);

// Initialize localStorage persistence (auto-hydration + debounced auto-save)
if (typeof window !== 'undefined') {
  initPersistence(useAppStore);
}

// Expose window.__store in dev builds for white-box inspection per PHASES.md §0.4
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  (window as unknown as { __store: typeof useAppStore }).__store = useAppStore;
}

export * from './workspaceSlice';
export * from './documentSlice';
export * from './uiSlice';
export * from './practiceSlice';
export * from './profileSlice';
export * from './toastSlice';
export * from './persist';
export * from './selectors';
