import { nanoid } from 'nanoid';
import { Attempt, AttemptFeedbackSummary, Diagram, Id, ScoreResult } from '../types';
import { FeedbackReport } from '../feedback/types';

export type { Attempt, AttemptFeedbackSummary };

/**
 * Creates a permanent, immutable attempt record from a submission.
 * The diagramSnapshot is a deep clone with readOnly set to true.
 */
export function createAttemptSnapshot(
  problemId: Id,
  scoreResult: ScoreResult,
  feedbackReport: FeedbackReport,
  diagram: Diagram
): Attempt {
  // Deep clone the diagram to ensure immunity to future mutations
  const snapshot: Diagram = JSON.parse(JSON.stringify(diagram));
  snapshot.readOnly = true;

  const feedbackSummary: AttemptFeedbackSummary = {
    concerns: feedbackReport.findings.filter((f) => f.severity === 'concern').length,
    suggestions: feedbackReport.findings.filter((f) => f.severity === 'suggestion').length,
    positives: feedbackReport.findings.filter((f) => f.severity === 'positive').length,
  };

  return {
    id: nanoid(),
    problemId,
    submittedAt: new Date().toISOString(),
    score: scoreResult.total,
    gradeBand: scoreResult.gradeBand,
    dimensions: scoreResult.dimensions,
    feedbackSummary,
    diagramSnapshot: snapshot,
  };
}

/**
 * Computes signed delta between current score and previous score.
 * e.g. 85 vs 75 -> +10; 70 vs 80 -> -10.
 */
export function computeAttemptDelta(currentScore: number, previousScore: number): number {
  return currentScore - previousScore;
}

/**
 * Returns all attempts for a given problem, sorted newest first.
 */
export function getProblemAttempts(attempts: Attempt[], problemId: Id): Attempt[] {
  return attempts
    .filter((a) => a.problemId === problemId)
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
}

/**
 * Returns the highest score achieved for a problem, or null if no attempts exist.
 */
export function getBestScore(attempts: Attempt[], problemId: Id): number | null {
  const problemAttempts = attempts.filter((a) => a.problemId === problemId);
  if (problemAttempts.length === 0) return null;
  return Math.max(...problemAttempts.map((a) => a.score));
}

/**
 * Prunes attempts for a problem to stay within maxAttempts (default 50).
 * Removes the oldest attempts first per PRD §17.1.
 */
export function pruneAttempts(
  attempts: Attempt[],
  problemId: Id,
  maxAttempts: number = 50
): Attempt[] {
  const otherAttempts = attempts.filter((a) => a.problemId !== problemId);
  const problemAttempts = attempts
    .filter((a) => a.problemId === problemId)
    .sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()); // oldest first

  // Keep the most recent maxAttempts
  const keptProblemAttempts =
    problemAttempts.length > maxAttempts
      ? problemAttempts.slice(problemAttempts.length - maxAttempts)
      : problemAttempts;

  return [...otherAttempts, ...keptProblemAttempts];
}
