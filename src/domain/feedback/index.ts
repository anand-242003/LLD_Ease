import { Diagram } from '../types';
import {
  FeedbackFinding,
  FeedbackReport,
  FindingSeverity,
  Lens,
  LensSummary,
} from './types';
import { analyzeResponsibilities } from './responsibilities';
import { analyzeAbstractions } from './abstractions';
import { analyzeRelationships } from './relationships';
import { analyzeTradeoffs } from './tradeoffs';

export * from './types';
export * from './responsibilities';
export * from './abstractions';
export * from './relationships';
export * from './tradeoffs';

const SEVERITY_ORDER: Record<FindingSeverity, number> = {
  concern: 0,
  suggestion: 1,
  positive: 2,
};

/**
 * Pure function building an explainable feedback report across four architectural lenses.
 * Implements PRD §0.8 and Phase 22.
 */
export function buildFeedbackReport(
  userDiagram: Diagram,
  referenceDiagram: Diagram
): FeedbackReport {
  const respFindings = analyzeResponsibilities(userDiagram);
  const absFindings = analyzeAbstractions(userDiagram, referenceDiagram);
  const relFindings = analyzeRelationships(userDiagram, referenceDiagram);
  const tradeFindings = analyzeTradeoffs(userDiagram, referenceDiagram);

  const allFindings = [
    ...respFindings,
    ...absFindings,
    ...relFindings,
    ...tradeFindings,
  ];

  // Sort concerns -> suggestions -> positives within each lens
  allFindings.sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);

  const summaryByLens: Record<Lens, LensSummary> = {
    responsibilities: { positive: 0, suggestion: 0, concern: 0 },
    abstractions: { positive: 0, suggestion: 0, concern: 0 },
    relationships: { positive: 0, suggestion: 0, concern: 0 },
    tradeoffs: { positive: 0, suggestion: 0, concern: 0 },
  };

  for (const f of allFindings) {
    summaryByLens[f.lens][f.severity]++;
  }

  // Top 3 improvements: deduplicated, concerns first, then suggestions (never positives)
  const improvementCandidates = allFindings.filter(
    (f) => f.severity === 'concern' || f.severity === 'suggestion'
  );

  const topImprovements: FeedbackFinding[] = [];
  const seenTitles = new Set<string>();

  for (const candidate of improvementCandidates) {
    if (!seenTitles.has(candidate.title)) {
      topImprovements.push(candidate);
      seenTitles.add(candidate.title);
      if (topImprovements.length >= 3) break;
    }
  }

  return {
    findings: allFindings,
    summaryByLens,
    topImprovements,
  };
}
