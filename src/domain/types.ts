export type Id = string;
export type ISODate = string; // e.g. "2026-09-08T23:48:30.000Z"

/* ─── Enumerations ─────────────────────────────────────────────── */

export type ClassKind =
  | 'CLASS'
  | 'ABSTRACT'
  | 'INTERFACE'
  | 'ENUM'
  | 'RECORD'; // [OBS]

export type RelationshipType =
  | 'INHERIT'
  | 'REALIZE'
  | 'COMPOSE'
  | 'AGGREGATE'
  | 'ASSOCIATE'
  | 'DEPEND'; // [OBS]

export type Visibility = 'private' | 'public' | 'protected' | 'package';
// rendered as  '-'       '+'      '#'         '~'

export type Language =
  | 'java'
  | 'python'
  | 'typescript'
  | 'javascript'
  | 'cpp'
  | 'csharp'; // [OBS]

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD'; // [OBS]
export type IssueSeverity = 'error' | 'warning' | 'info'; // [OBS]

export type RightPanelTab = 'inspector' | 'issues' | 'code' | 'notes';

/* ─── Class members ────────────────────────────────────────────── */

export interface Attribute {
  id: Id;
  visibility: Visibility; // default 'private'
  name: string; // required, non-empty
  type: string; // free text, e.g. 'long', 'List<Ticket>'
  defaultValue?: string; // "= default value (optional)"
  isStatic: boolean; // the 'S' toggle
  isFinal: boolean; // the 'F' toggle
}

export interface Method {
  id: Id;
  visibility: Visibility; // default 'public'
  name: string;
  parameters: string; // raw string, "int id, String name"
  returns: string; // 'void' by default
  isStatic: boolean; // 'S'
  isAbstract: boolean; // 'A'
}

/* ─── Graph elements ───────────────────────────────────────────── */

export interface ClassNode {
  id: Id;
  kind: ClassKind;
  name: string; // unique within a document (lint rule)
  generics?: string; // "T" or "K, V"
  attributes: Attribute[];
  methods: Method[];
  note?: string; // NOTE / DOC COMMENT
  position: { x: number; y: number };
  size?: { width: number; height: number }; // auto unless resized
}

export interface Relationship {
  id: Id;
  type: RelationshipType;
  sourceId: Id; // → ClassNode.id
  targetId: Id; // → ClassNode.id
  label?: string; // "vehicle", "paymentStrategy"
  sourceMultiplicity?: string; // "1", "0..1", "1..*"
  targetMultiplicity?: string;
}

/* ─── Annotation layers ────────────────────────────────────────── */

export interface StickyNote {
  id: Id;
  content: string; // sanitised HTML (b, i, br, div only)
  color: string; // one of 7 presets
  position: { x: number; y: number };
  size: { width: number; height: number }; // default ~275×200
}

export interface InkStroke {
  id: Id;
  points: Array<{ x: number; y: number; pressure?: number }>;
  color: string; // one of 5 presets, e.g. '#f43f5e'
  width: number; // one of 3 presets
}

/* ─── Document ─────────────────────────────────────────────────── */

export interface Diagram {
  id: Id;
  title: string; // "My Design" | "Parking Lot — Reference"
  readOnly: boolean; // true for reference tabs
  sourceProblemId?: Id; // set on reference tabs
  nodes: ClassNode[];
  edges: Relationship[];
  stickyNotes: StickyNote[];
  inkStrokes: InkStroke[];
  scratchNotes: string; // Notes tab, per document
  viewport: { x: number; y: number; zoom: number };
  createdAt: ISODate;
  updatedAt: ISODate;
}

/* ─── Static library data (bundled, not user data) ─────────────── */

export interface Problem {
  id: Id; // 'parking-lot'
  title: string; // "Parking Lot"
  difficulty: Difficulty;
  patterns: string[]; // ["Strategy","Factory","Singleton"]
  description: string; // card paragraph
  requirements: string[]; // 4 bullets
  practicePrompt: string; // "Model the classes & relationships, th…"
  stats: { classes: number; relationships: number }; // "15 classes · 13 relationships"
  referenceDiagram: Omit<Diagram, 'id' | 'createdAt' | 'updatedAt' | 'readOnly' | 'title'>;
}

/* ─── Derived (never stored) ───────────────────────────────────── */

export interface Issue {
  id: Id;
  severity: IssueSeverity;
  subjectNodeId?: Id;
  subjectName: string; // rendered mono + teal
  message: string; // full sentence, ends with '.'
  ruleId: string; // 'realize-target-not-interface'
}

/* ─── Code Options ─────────────────────────────────────────────── */

export interface CodeOptions {
  constructor: boolean; // default true
  gettersSetters: boolean; // default true
  toStringM: boolean; // default false
  equalsHashCode: boolean; // default false
  docComments: boolean; // default true
}

/* ─── Workspace (the persisted root) ───────────────────────────── */

export interface Workspace {
  schemaVersion: number; // 1
  documents: Diagram[];
  activeDocumentId: Id;
  practiceSession: { problemId: Id; startedAt: ISODate } | null;
  attempts?: Attempt[];
  ui: {
    rightPanelTab: RightPanelTab;
    codeLanguage: Language; // default 'java'
    codeOptions: CodeOptions;
    inkColor: string; // default cyan
    inkWidth: number;
  };
}

/* ─── PRD §13.2 Invariants (enforce in store, not the UI) ─────────
1. Exactly one document has id === 'my-design'; it always exists and has readOnly === false.
2. activeDocumentId always references an existing document.
3. Every Relationship.sourceId and .targetId references a node in the same document.
4. Deleting a node deletes every edge referencing it, atomically. [§14-BR30]
5. Issue[] and generated code are never persisted — always recomputed from the model.
6. Node name should be unique within a document; violations are a lint warning, not a hard error.
7. readOnly === true => no mutation of that document is ever committed.
────────────────────────────────────────────────────────────────── */

/* ─── PRD §16.2 Scoring Contracts ─────────────────────────────── */

export type GradeBand = 'Excellent' | 'Strong' | 'Fair' | 'Keep going';

export interface ScoreDimension {
  key: string;
  label: string;
  score: number; // 0-100
  weight: number; // 0-1
}

export interface ScoreMatchedClass {
  referenceName: string;
  userName: string;
}

export interface ScoreMissingClass {
  name: string;
  kind: ClassKind;
  hint: string;
}

export interface ScoreExtraClass {
  name: string;
}

export interface ScoreResult {
  total: number; // 0-100 integer
  gradeBand: GradeBand;
  dimensions: ScoreDimension[];
  matched: ScoreMatchedClass[];
  missing: ScoreMissingClass[];
  extra: ScoreExtraClass[];
  issueCount: number;
}

export interface AttemptFeedbackSummary {
  concerns: number;
  suggestions: number;
  positives: number;
}

export interface Attempt {
  id: Id;
  problemId: Id;
  submittedAt: ISODate;
  score: number; // 0-100 integer
  gradeBand: GradeBand;
  dimensions: ScoreDimension[];
  feedbackSummary: AttemptFeedbackSummary;
  diagramSnapshot: Diagram; // deep copy of submitted diagram
}

