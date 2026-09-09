import { Workspace } from '../types';

export const CURRENT_SCHEMA_VERSION = 1;

export interface MigrationResult {
  workspace?: Workspace;
  error?: 'corrupt' | 'newer';
}

/**
 * Migrates and validates a raw stored workspace payload.
 * Enforces PRD §13.2 invariants, strips derived data (invariant 5),
 * and validates version schema compatibility.
 */
export function migrateWorkspace(raw: unknown): MigrationResult {
  if (typeof raw !== 'object' || raw === null) {
    return { error: 'corrupt' };
  }

  const obj = raw as Record<string, unknown>;

  if (typeof obj.schemaVersion !== 'number') {
    return { error: 'corrupt' };
  }

  // PRD §17.1: Newer schema versions refuse to load with a specific error
  if (obj.schemaVersion > CURRENT_SCHEMA_VERSION) {
    return { error: 'newer' };
  }

  if (obj.schemaVersion === 1) {
    // Validate documents array
    if (!Array.isArray(obj.documents) || obj.documents.length === 0) {
      return { error: 'corrupt' };
    }

    // Invariant 1: Exactly one document has id === 'my-design'
    const myDesign = obj.documents.find(
      (d: unknown) =>
        typeof d === 'object' &&
        d !== null &&
        (d as { id?: unknown }).id === 'my-design'
    );
    if (!myDesign) {
      return { error: 'corrupt' };
    }

    // Invariant 2: activeDocumentId always references an existing document
    const activeDocId =
      typeof obj.activeDocumentId === 'string'
        ? obj.activeDocumentId
        : 'my-design';
    const activeDocExists = obj.documents.some(
      (d: unknown) =>
        typeof d === 'object' &&
        d !== null &&
        (d as { id?: unknown }).id === activeDocId
    );

    // Invariant 5: Strip derived fields (issues, generatedCode) if accidentally present
    const sanitizedDocs = obj.documents.map((doc: any) => {
      const { issues, generatedCode, ...cleanDoc } = doc;
      return {
        ...cleanDoc,
        id: cleanDoc.id || 'my-design',
        title: cleanDoc.title || 'My Design',
        readOnly: Boolean(cleanDoc.readOnly),
        nodes: Array.isArray(cleanDoc.nodes) ? cleanDoc.nodes : [],
        edges: Array.isArray(cleanDoc.edges) ? cleanDoc.edges : [],
        stickyNotes: Array.isArray(cleanDoc.stickyNotes) ? cleanDoc.stickyNotes : [],
        inkStrokes: Array.isArray(cleanDoc.inkStrokes) ? cleanDoc.inkStrokes : [],
        scratchNotes: typeof cleanDoc.scratchNotes === 'string' ? cleanDoc.scratchNotes : '',
        viewport: cleanDoc.viewport ?? { x: 0, y: 0, zoom: 1 },
        createdAt: cleanDoc.createdAt || new Date().toISOString(),
        updatedAt: cleanDoc.updatedAt || new Date().toISOString(),
      };
    });

    const rawUi =
      typeof obj.ui === 'object' && obj.ui !== null
        ? (obj.ui as Record<string, unknown>)
        : {};

    const sanitizedUi = {
      rightPanelTab: (rawUi.rightPanelTab as any) || 'inspector',
      codeLanguage: (rawUi.codeLanguage as any) || 'java',
      codeOptions: {
        constructor: true,
        gettersSetters: true,
        toStringM: false,
        equalsHashCode: false,
        docComments: true,
        ...(typeof rawUi.codeOptions === 'object' && rawUi.codeOptions !== null
          ? (rawUi.codeOptions as Record<string, boolean>)
          : {}),
      },
      inkColor: typeof rawUi.inkColor === 'string' ? rawUi.inkColor : '#22D3EE',
      inkWidth: typeof rawUi.inkWidth === 'number' ? rawUi.inkWidth : 2,
    };

    const workspace: Workspace = {
      schemaVersion: 1,
      documents: sanitizedDocs,
      activeDocumentId: activeDocExists ? activeDocId : 'my-design',
      practiceSession: (obj.practiceSession as any) || null,
      attempts: Array.isArray(obj.attempts) ? (obj.attempts as any) : [],
      ui: sanitizedUi,
    };

    return { workspace };
  }

  return { error: 'corrupt' };
}
