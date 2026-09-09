import { Diagram, StickyNote } from '../types';
import { CURRENT_SCHEMA_VERSION } from './migrations';
import { sanitizeStickyHtml } from '../sanitization';

export type DeserializationErrorCode = 'not-json' | 'corrupt' | 'newer' | 'too-large';

export class DeserializationError extends Error {
  code: DeserializationErrorCode;

  constructor(code: DeserializationErrorCode, message: string) {
    super(message);
    this.name = 'DeserializationError';
    this.code = code;
  }
}

export interface DeserializeResult {
  diagram?: Diagram;
  error?: DeserializationErrorCode;
}

/**
 * Returns user-facing toast messages for deserialization errors matching PRD §17.2 & §9.13.
 */
export function getDeserializationErrorMessage(code: DeserializationErrorCode): string {
  switch (code) {
    case 'not-json':
      return "That file isn't valid JSON.";
    case 'newer':
      return 'This file was made with a newer version of LLDSIM.';
    case 'too-large':
      return 'That diagram is too large to open.';
    case 'corrupt':
    default:
      return "That doesn't look like an LLDSIM diagram.";
  }
}

/**
 * Safely parses and validates serialized JSON text into a clean Diagram object.
 */
export function deserializeDiagram(raw: string): DeserializeResult {
  if (typeof raw !== 'string' || !raw.trim()) {
    return { error: 'not-json' };
  }

  let obj: any;
  try {
    obj = JSON.parse(raw);
  } catch {
    return { error: 'not-json' };
  }

  if (typeof obj !== 'object' || obj === null) {
    return { error: 'corrupt' };
  }

  if (typeof obj.schemaVersion !== 'number') {
    return { error: 'corrupt' };
  }

  if (obj.schemaVersion > CURRENT_SCHEMA_VERSION) {
    return { error: 'newer' };
  }

  // Handle both single Diagram export or full Workspace export
  let targetDoc: any = obj;
  if (Array.isArray(obj.documents) && obj.documents.length > 0) {
    targetDoc =
      obj.documents.find((d: any) => d?.id === obj.activeDocumentId) ??
      obj.documents.find((d: any) => d?.id === 'my-design') ??
      obj.documents[0];
  }

  if (
    !targetDoc ||
    typeof targetDoc !== 'object' ||
    !Array.isArray(targetDoc.nodes) ||
    !Array.isArray(targetDoc.edges)
  ) {
    return { error: 'corrupt' };
  }

  // Size guard per PRD §17.2 (>2000 nodes or edges)
  if (targetDoc.nodes.length > 2000 || targetDoc.edges.length > 2000) {
    return { error: 'too-large' };
  }

  // Sticky notes HTML sanitization per PRD §9.13/§17
  const sanitizedStickies: StickyNote[] = Array.isArray(targetDoc.stickyNotes)
    ? targetDoc.stickyNotes.map((note: any) => {
        const rawContent = typeof note.content === 'string' ? note.content : '';
        return {
          ...note,
          content: sanitizeStickyHtml(rawContent),
        };
      })
    : [];

  const { schemaVersion: _, issues: __, generatedCode: ___, ...rest } = targetDoc;

  const diagram: Diagram = {
    ...rest,
    id: typeof targetDoc.id === 'string' ? targetDoc.id : 'my-design',
    title: typeof targetDoc.title === 'string' ? targetDoc.title : 'My Design',
    readOnly: Boolean(targetDoc.readOnly),
    nodes: targetDoc.nodes,
    edges: targetDoc.edges,
    stickyNotes: sanitizedStickies,
    inkStrokes: Array.isArray(targetDoc.inkStrokes) ? targetDoc.inkStrokes : [],
    scratchNotes: typeof targetDoc.scratchNotes === 'string' ? targetDoc.scratchNotes : '',
    viewport:
      targetDoc.viewport && typeof targetDoc.viewport === 'object'
        ? targetDoc.viewport
        : { x: 0, y: 0, zoom: 1 },
    createdAt:
      typeof targetDoc.createdAt === 'string' ? targetDoc.createdAt : new Date().toISOString(),
    updatedAt:
      typeof targetDoc.updatedAt === 'string' ? targetDoc.updatedAt : new Date().toISOString(),
  };

  if (typeof targetDoc.sourceProblemId === 'string') {
    diagram.sourceProblemId = targetDoc.sourceProblemId;
  }

  return { diagram };
}

/**
 * Deserializes a JSON string into a Diagram. Throws DeserializationError on failure.
 */
export function deserialize(raw: string): Diagram {
  const result = deserializeDiagram(raw);
  if (result.error || !result.diagram) {
    const errorCode = result.error ?? 'corrupt';
    throw new DeserializationError(errorCode, getDeserializationErrorMessage(errorCode));
  }
  return result.diagram;
}
