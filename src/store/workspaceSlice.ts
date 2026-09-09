import { StateCreator } from 'zustand';
import { nanoid } from 'nanoid';
import { Diagram, Id } from '../domain/types';
import { getProblem } from '../domain/problems';
import { UiSlice } from './uiSlice';

export interface WorkspaceSlice {
  documents: Diagram[];
  activeDocumentId: Id;
  addDocument: (document: Diagram) => void;
  removeDocument: (id: Id) => void;
  setActiveDocument: (id: Id) => void;
  loadReferenceDiagram: (problemId: Id) => Diagram | undefined;
}

export function createInitialMyDesign(): Diagram {
  const now = new Date().toISOString();
  return {
    id: 'my-design',
    title: 'My Design',
    readOnly: false,
    nodes: [],
    edges: [],
    stickyNotes: [],
    inkStrokes: [],
    scratchNotes: '',
    viewport: { x: 0, y: 0, zoom: 1 },
    createdAt: now,
    updatedAt: now,
  };
}

export const createWorkspaceSlice: StateCreator<
  WorkspaceSlice & UiSlice & { isReadOnly: (docId?: Id) => boolean },
  [],
  [],
  WorkspaceSlice
> = (set, get) => ({
  documents: [createInitialMyDesign()],
  activeDocumentId: 'my-design',

  addDocument: (document: Diagram) => {
    set((state) => {
      // If document with this id already exists, focus it instead of duplicating
      const existing = state.documents.find((d) => d.id === document.id);
      if (existing) {
        return { activeDocumentId: existing.id };
      }
      return {
        documents: [...state.documents, document],
        activeDocumentId: document.id,
      };
    });
  },

  removeDocument: (id: Id) => {
    // BR01: My Design can never be closed
    if (id === 'my-design') {
      return;
    }

    set((state) => {
      const remainingDocs = state.documents.filter((d) => d.id !== id);
      // BR08: Closing active document activates 'my-design'
      const nextActiveId =
        state.activeDocumentId === id ? 'my-design' : state.activeDocumentId;

      return {
        documents: remainingDocs,
        activeDocumentId: nextActiveId,
        ...(state.activeDocumentId === id
          ? { ui: { ...state.ui, selectedElement: null } }
          : {}),
      };
    });
  },

  setActiveDocument: (id: Id) => {
    const { documents } = get();
    // Invariant 2: activeDocumentId must reference an existing document
    if (documents.some((d) => d.id === id)) {
      set((state) => ({
        activeDocumentId: id,
        ui: { ...state.ui, selectedElement: null },
      }));
    }
  },

  loadReferenceDiagram: (problemId: Id) => {
    const { documents, setActiveDocument } = get();

    // BR12: Idempotency check — if already loaded, focus existing tab
    const existing = documents.find(
      (d) => d.sourceProblemId === problemId && !d.id.startsWith('attempt-') && d.id !== 'my-design'
    );
    if (existing) {
      if (existing.readOnly) {
        set((state) => ({
          documents: state.documents.map((d) =>
            d.id === existing.id ? { ...d, readOnly: false } : d
          ),
        }));
      }
      setActiveDocument(existing.id);
      get().setActiveModal(null);
      get().requestFitView();
      return existing;
    }

    const problem = getProblem(problemId);
    if (!problem) {
      console.warn(`Problem not found: ${problemId}`);
      return undefined;
    }

    const now = new Date().toISOString();
    const refDoc: Diagram = {
      id: nanoid(),
      title: `${problem.title} — Reference`,
      readOnly: false,
      sourceProblemId: problem.id,
      nodes: JSON.parse(JSON.stringify(problem.referenceDiagram.nodes)),
      edges: JSON.parse(JSON.stringify(problem.referenceDiagram.edges)),
      stickyNotes: JSON.parse(JSON.stringify(problem.referenceDiagram.stickyNotes ?? [])),
      inkStrokes: JSON.parse(JSON.stringify(problem.referenceDiagram.inkStrokes ?? [])),
      scratchNotes: problem.referenceDiagram.scratchNotes ?? '',
      viewport: problem.referenceDiagram.viewport ?? { x: 0, y: 0, zoom: 1 },
      createdAt: now,
      updatedAt: now,
    };

    set((state) => ({
      documents: [...state.documents, refDoc],
      activeDocumentId: refDoc.id,
      ui: {
        ...state.ui,
        selectedElement: null,
        needsFitView: true,
        activeModal: null,
      },
    }));

    return refDoc;
  },
});
