import { Id } from '../types';

export type Lens = 'responsibilities' | 'abstractions' | 'relationships' | 'tradeoffs';

export type FindingSeverity = 'positive' | 'suggestion' | 'concern';

export interface FeedbackFinding {
  id: string;
  lens: Lens;
  severity: FindingSeverity;
  subjectNodeIds: Id[];
  subjectEdgeIds: Id[];
  title: string;
  explanation: string;
  suggestedFix?: string;
}

export interface LensSummary {
  positive: number;
  suggestion: number;
  concern: number;
}

export interface FeedbackReport {
  findings: FeedbackFinding[];
  summaryByLens: Record<Lens, LensSummary>;
  topImprovements: FeedbackFinding[]; // Prioritized top 3 concerns/suggestions
}
