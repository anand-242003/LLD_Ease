import { StateCreator } from 'zustand';
import { nanoid } from 'nanoid';
import { sanitizeStickyHtml } from '../domain/sanitization';
import {
  Attribute,
  ClassKind,
  ClassNode,
  Diagram,
  Id,
  InkStroke,
  Method,
  Relationship,
  RelationshipType,
  StickyNote,
} from '../domain/types';
import { WorkspaceSlice } from './workspaceSlice';
import { UiSlice } from './uiSlice';

export type NodePosition = { x: number; y: number };

export interface DocumentSlice {
  // Read-only checker
  isReadOnly: (docId?: Id) => boolean;

  // Node actions (supports both (node, docId?) and (docId, node))
  addNode: {
    (node: ClassNode, docId?: Id): void;
    (docId: Id, node: ClassNode): void;
  };
  createNode: (
    docIdOrKind: Id | ClassKind,
    kindOrPos?: ClassKind | NodePosition,
    maybePos?: NodePosition
  ) => ClassNode | undefined;
  updateNode: (nodeId: Id, patch: Partial<ClassNode>, docId?: Id) => void;
  removeNode: {
    (nodeId: Id, docId?: Id): void;
    (docId: Id, nodeId: Id): void;
  };

  // Edge actions
  addEdge: (edge: Relationship, docId?: Id) => void;
  createEdge: (
    docId: Id,
    sourceId: Id,
    targetId: Id,
    relType: RelationshipType
  ) => Relationship | undefined;
  updateEdge: (edgeId: Id, patch: Partial<Relationship>, docId?: Id) => void;
  removeEdge: (edgeId: Id, docId?: Id) => void;

  // Document metadata / scratch notes / viewport patch
  updateDocument: (docId: Id, patch: Partial<Diagram>) => void;
  updateScratchNotes: (docId: Id, scratchNotes: string) => void;

  // Clear canvas (preserves stickies, scratch notes, viewport per PRD §9.11 / BR32)
  clearCanvas: (docId?: Id) => void;

  // Sticky note actions
  addStickyNote: (
    docId: Id,
    position: { x: number; y: number },
    color?: string,
    initialContent?: string
  ) => StickyNote | undefined;
  updateStickyNote: (
    noteId: Id,
    patch: Partial<StickyNote>,
    docId?: Id
  ) => void;
  removeStickyNote: (noteId: Id, docId?: Id) => void;

  // Ink stroke actions
  addInkStroke: (stroke: InkStroke, docId?: Id) => void;
  removeInkStroke: (strokeId: Id, docId?: Id) => void;
  clearInkStrokes: (docId?: Id) => void;

  // Helper for naming (accepts docId, Diagram object, or defaults to active)
  nextNodeName: (target?: Diagram | Id) => string;
}

/**
 * Computes the lowest free non-negative integer N such that `NewClass<N>` is available.
 * Per PRD §9.4 and §14-BR20.
 */
export function getLowestFreeClassIndex(nodes: ClassNode[]): number {
  const usedIndices = new Set<number>();
  const pattern = /^NewClass(\d+)$/;

  for (const node of nodes) {
    const match = pattern.exec(node.name.trim());
    if (match && match[1]) {
      usedIndices.add(parseInt(match[1], 10));
    }
  }

  let index = 0;
  while (usedIndices.has(index)) {
    index++;
  }
  return index;
}

export function getSeedMembers(kind: ClassKind): { attributes: Attribute[]; methods: Method[] } {
  switch (kind) {
    case 'CLASS':
    case 'ABSTRACT':
      return {
        attributes: [
          {
            id: nanoid(),
            visibility: 'private',
            name: 'id',
            type: 'long',
            isStatic: false,
            isFinal: false,
          },
        ],
        methods: [
          {
            id: nanoid(),
            visibility: 'public',
            name: 'doWork',
            parameters: '',
            returns: 'void',
            isStatic: false,
            isAbstract: false,
          },
        ],
      };
    case 'INTERFACE':
      return {
        attributes: [],
        methods: [
          {
            id: nanoid(),
            visibility: 'public',
            name: 'doWork',
            parameters: '',
            returns: 'void',
            isStatic: false,
            isAbstract: true,
          },
        ],
      };
    case 'RECORD':
      return {
        attributes: [
          {
            id: nanoid(),
            visibility: 'private',
            name: 'id',
            type: 'long',
            isStatic: false,
            isFinal: false,
          },
        ],
        methods: [],
      };
    case 'ENUM':
    default:
      return {
        attributes: [],
        methods: [],
      };
  }
}

export const createDocumentSlice: StateCreator<
  WorkspaceSlice & DocumentSlice & UiSlice,
  [],
  [],
  DocumentSlice
> = (set, get) => ({
  isReadOnly: (docId?: Id) => {
    const { documents, activeDocumentId } = get();
    const targetId = docId ?? activeDocumentId;
    const doc = documents.find((d) => d.id === targetId);
    return doc?.readOnly ?? false;
  },

  addNode: (arg1: ClassNode | Id, arg2?: ClassNode | Id) => {
    let node: ClassNode;
    let docId: Id | undefined;

    if (typeof arg1 === 'string') {
      docId = arg1;
      node = arg2 as ClassNode;
    } else {
      node = arg1;
      docId = typeof arg2 === 'string' ? arg2 : undefined;
    }

    const { isReadOnly, activeDocumentId } = get();
    const targetId = docId ?? activeDocumentId;
    if (isReadOnly(targetId)) return;

    set((state) => ({
      documents: state.documents.map((doc) => {
        if (doc.id !== targetId) return doc;
        return {
          ...doc,
          nodes: [...doc.nodes, node],
          updatedAt: new Date().toISOString(),
        };
      }),
    }));
  },

  createNode: (arg1: Id | ClassKind, arg2?: ClassKind | NodePosition, arg3?: NodePosition) => {
    const { isReadOnly, activeDocumentId, nextNodeName } = get();
    let docId: Id;
    let kind: ClassKind;
    let position: NodePosition;

    const kindList: ClassKind[] = ['CLASS', 'ABSTRACT', 'INTERFACE', 'ENUM', 'RECORD'];

    if (typeof arg1 === 'string' && kindList.includes(arg1.toUpperCase() as ClassKind)) {
      docId = activeDocumentId;
      kind = arg1.toUpperCase() as ClassKind;
      position = (arg2 as NodePosition) || { x: 100, y: 100 };
    } else {
      docId = (arg1 as Id) || activeDocumentId;
      kind = (arg2 as ClassKind) || 'CLASS';
      position = arg3 || { x: 100, y: 100 };
    }

    if (isReadOnly(docId)) return undefined;

    const { attributes, methods } = getSeedMembers(kind);
    const name = nextNodeName(docId);
    const newNode: ClassNode = {
      id: nanoid(),
      kind,
      name,
      position,
      attributes,
      methods,
    };

    set((state) => ({
      documents: state.documents.map((doc) => {
        if (doc.id !== docId) return doc;
        return {
          ...doc,
          nodes: [...doc.nodes, newNode],
          updatedAt: new Date().toISOString(),
        };
      }),
      ui: {
        ...state.ui,
        selectedElement: { type: 'node', id: newNode.id },
        rightPanelTab: 'inspector',
      },
    }));

    return newNode;
  },

  updateNode: (nodeId: Id, patch: Partial<ClassNode>, docId?: Id) => {
    const { isReadOnly, activeDocumentId } = get();
    const targetId = docId ?? activeDocumentId;
    const isPositionOnly = Object.keys(patch).length === 1 && 'position' in patch;
    if (isReadOnly(targetId) && !isPositionOnly) return;

    set((state) => ({
      documents: state.documents.map((doc) => {
        if (doc.id !== targetId) return doc;
        return {
          ...doc,
          nodes: doc.nodes.map((node) =>
            node.id === nodeId ? { ...node, ...patch } : node
          ),
          updatedAt: new Date().toISOString(),
        };
      }),
    }));
  },

  removeNode: (arg1: Id, arg2?: Id) => {
    let nodeId: Id;
    let docId: Id | undefined;

    if (arg2 !== undefined) {
      const { documents } = get();
      if (documents.some((d) => d.id === arg1)) {
        docId = arg1;
        nodeId = arg2;
      } else {
        nodeId = arg1;
        docId = arg2;
      }
    } else {
      nodeId = arg1;
    }

    const { isReadOnly, activeDocumentId } = get();
    const targetId = docId ?? activeDocumentId;
    if (isReadOnly(targetId)) return;

    // Atomic cascade delete: remove node and all edges touching it (PRD §13.2 invariant 4, §14-BR30)
    set((state) => ({
      documents: state.documents.map((doc) => {
        if (doc.id !== targetId) return doc;
        return {
          ...doc,
          nodes: doc.nodes.filter((node) => node.id !== nodeId),
          edges: doc.edges.filter(
            (edge) => edge.sourceId !== nodeId && edge.targetId !== nodeId
          ),
          updatedAt: new Date().toISOString(),
        };
      }),
    }));
  },

  addEdge: (edge: Relationship, docId?: Id) => {
    const { isReadOnly, activeDocumentId } = get();
    const targetId = docId ?? activeDocumentId;
    if (isReadOnly(targetId)) return;

    set((state) => ({
      documents: state.documents.map((doc) => {
        if (doc.id !== targetId) return doc;

        // BR22: prevent duplicate edge of same type in same direction between same nodes
        const duplicate = doc.edges.some(
          (e) =>
            e.sourceId === edge.sourceId &&
            e.targetId === edge.targetId &&
            e.type === edge.type
        );
        if (duplicate) return doc;

        return {
          ...doc,
          edges: [...doc.edges, edge],
          updatedAt: new Date().toISOString(),
        };
      }),
    }));
  },

  createEdge: (docId: Id, sourceId: Id, targetId: Id, relType: RelationshipType) => {
    const { isReadOnly, activeDocumentId } = get();
    const targetDocId = docId || activeDocumentId;
    if (isReadOnly(targetDocId)) return undefined;

    const targetDoc = get().documents.find((d) => d.id === targetDocId);
    if (!targetDoc) return undefined;

    // BR22: prevent duplicate edge of same type in same direction between same nodes
    const duplicate = targetDoc.edges.some(
      (e) =>
        e.sourceId === sourceId &&
        e.targetId === targetId &&
        e.type === relType
    );
    if (duplicate) return undefined;

    const newEdge: Relationship = {
      id: nanoid(),
      type: relType,
      sourceId,
      targetId,
      label: '',
      sourceMultiplicity: '',
      targetMultiplicity: '',
    };

    set((state) => ({
      documents: state.documents.map((doc) => {
        if (doc.id !== targetDocId) return doc;
        return {
          ...doc,
          edges: [...doc.edges, newEdge],
          updatedAt: new Date().toISOString(),
        };
      }),
    }));

    return newEdge;
  },

  updateEdge: (edgeId: Id, patch: Partial<Relationship>, docId?: Id) => {
    const { isReadOnly, activeDocumentId } = get();
    const targetId = docId ?? activeDocumentId;
    if (isReadOnly(targetId)) return;

    set((state) => ({
      documents: state.documents.map((doc) => {
        if (doc.id !== targetId) return doc;
        return {
          ...doc,
          edges: doc.edges.map((edge) =>
            edge.id === edgeId ? { ...edge, ...patch } : edge
          ),
          updatedAt: new Date().toISOString(),
        };
      }),
    }));
  },

  removeEdge: (edgeId: Id, docId?: Id) => {
    const { isReadOnly, activeDocumentId } = get();
    const targetId = docId ?? activeDocumentId;
    if (isReadOnly(targetId)) return;

    set((state) => ({
      documents: state.documents.map((doc) => {
        if (doc.id !== targetId) return doc;
        return {
          ...doc,
          edges: doc.edges.filter((edge) => edge.id !== edgeId),
          updatedAt: new Date().toISOString(),
        };
      }),
    }));
  },

  updateDocument: (docId: Id, patch: Partial<Diagram>) => {
    set((state) => ({
      documents: state.documents.map((doc) => {
        if (doc.id !== docId) return doc;
        return {
          ...doc,
          ...patch,
          updatedAt: new Date().toISOString(),
        };
      }),
    }));
  },

  updateScratchNotes: (docId: Id, scratchNotes: string) => {
    const { isReadOnly } = get();
    if (isReadOnly(docId)) return;

    set((state) => ({
      documents: state.documents.map((doc) => {
        if (doc.id !== docId) return doc;
        return {
          ...doc,
          scratchNotes,
          updatedAt: new Date().toISOString(),
        };
      }),
    }));
  },

  clearCanvas: (docId?: Id) => {
    const { isReadOnly, activeDocumentId } = get();
    const targetId = docId ?? activeDocumentId;
    if (isReadOnly(targetId)) return;

    // BR32: Clear empties nodes, edges, and ink but preserves stickyNotes, scratchNotes, viewport
    set((state) => ({
      documents: state.documents.map((doc) => {
        if (doc.id !== targetId) return doc;
        return {
          ...doc,
          nodes: [],
          edges: [],
          inkStrokes: [],
          updatedAt: new Date().toISOString(),
        };
      }),
    }));
  },

  addStickyNote: (
    docId: Id,
    position: { x: number; y: number },
    color?: string,
    initialContent?: string
  ) => {
    const { isReadOnly } = get();
    if (isReadOnly(docId)) return undefined;

    const newNote: StickyNote = {
      id: nanoid(),
      content: sanitizeStickyHtml(initialContent ?? ''),
      color: color ?? 'var(--sticky-default)',
      position,
      size: { width: 275, height: 200 },
    };

    set((state) => ({
      documents: state.documents.map((doc) => {
        if (doc.id !== docId) return doc;
        return {
          ...doc,
          stickyNotes: [...(doc.stickyNotes ?? []), newNote],
          updatedAt: new Date().toISOString(),
        };
      }),
    }));

    return newNote;
  },

  updateStickyNote: (noteId: Id, patch: Partial<StickyNote>, docId?: Id) => {
    const { isReadOnly, activeDocumentId } = get();
    const targetId = docId ?? activeDocumentId;
    if (isReadOnly(targetId)) return;

    const sanitizedPatch = { ...patch };
    if (typeof sanitizedPatch.content === 'string') {
      sanitizedPatch.content = sanitizeStickyHtml(sanitizedPatch.content);
    }

    set((state) => ({
      documents: state.documents.map((doc) => {
        if (doc.id !== targetId) return doc;
        return {
          ...doc,
          stickyNotes: (doc.stickyNotes ?? []).map((note) =>
            note.id === noteId ? { ...note, ...sanitizedPatch } : note
          ),
          updatedAt: new Date().toISOString(),
        };
      }),
    }));
  },

  removeStickyNote: (noteId: Id, docId?: Id) => {
    const { isReadOnly, activeDocumentId } = get();
    const targetId = docId ?? activeDocumentId;
    if (isReadOnly(targetId)) return;

    set((state) => ({
      documents: state.documents.map((doc) => {
        if (doc.id !== targetId) return doc;
        return {
          ...doc,
          stickyNotes: (doc.stickyNotes ?? []).filter((note) => note.id !== noteId),
          updatedAt: new Date().toISOString(),
        };
      }),
    }));
  },

  addInkStroke: (stroke: InkStroke, docId?: Id) => {
    const { isReadOnly, activeDocumentId } = get();
    const targetId = docId ?? activeDocumentId;
    if (isReadOnly(targetId)) return;

    set((state) => ({
      documents: state.documents.map((doc) => {
        if (doc.id !== targetId) return doc;
        return {
          ...doc,
          inkStrokes: [...(doc.inkStrokes ?? []), stroke],
          updatedAt: new Date().toISOString(),
        };
      }),
    }));
  },

  removeInkStroke: (strokeId: Id, docId?: Id) => {
    const { isReadOnly, activeDocumentId } = get();
    const targetId = docId ?? activeDocumentId;
    if (isReadOnly(targetId)) return;

    set((state) => ({
      documents: state.documents.map((doc) => {
        if (doc.id !== targetId) return doc;
        return {
          ...doc,
          inkStrokes: (doc.inkStrokes ?? []).filter((s) => s.id !== strokeId),
          updatedAt: new Date().toISOString(),
        };
      }),
    }));
  },

  clearInkStrokes: (docId?: Id) => {
    const { isReadOnly, activeDocumentId } = get();
    const targetId = docId ?? activeDocumentId;
    if (isReadOnly(targetId)) return;

    set((state) => ({
      documents: state.documents.map((doc) => {
        if (doc.id !== targetId) return doc;
        return {
          ...doc,
          inkStrokes: [],
          updatedAt: new Date().toISOString(),
        };
      }),
    }));
  },

  nextNodeName: (target?: Diagram | Id) => {
    let nodes: ClassNode[] = [];
    if (typeof target === 'object' && target !== null && 'nodes' in target) {
      nodes = target.nodes;
    } else {
      const { documents, activeDocumentId } = get();
      const targetId = typeof target === 'string' ? target : activeDocumentId;
      const doc = documents.find((d) => d.id === targetId);
      nodes = doc?.nodes ?? [];
    }
    const index = getLowestFreeClassIndex(nodes);
    return `NewClass${index}`;
  },
});
