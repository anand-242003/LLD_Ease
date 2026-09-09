import { StateCreator } from 'zustand';
import { Attempt, pruneAttempts } from '../domain/practice/attempts';
import { Diagram, Id, ISODate, ScoreResult } from '../domain/types';
import { FeedbackReport } from '../domain/feedback/types';
import { getProblem } from '../domain/problems';
import { WorkspaceSlice } from './workspaceSlice';
import { UiSlice } from './uiSlice';

export interface PracticeSession {
  problemId: Id;
  startedAt: ISODate;
}

export interface PracticeSlice {
  practiceSession: PracticeSession | null;
  lastScoreResult: ScoreResult | null;
  lastFeedbackReport: FeedbackReport | null;
  attempts: Attempt[];
  startPractice: (problemId: Id) => void;
  setEvaluationResult: (score: ScoreResult | null, feedback: FeedbackReport | null) => void;
  recordAttempt: (attempt: Attempt) => void;
  openAttemptDiagram: (attempt: Attempt) => void;
}

export const createPracticeSlice: StateCreator<
  PracticeSlice & WorkspaceSlice & UiSlice,
  [],
  [],
  PracticeSlice
> = (set, get) => ({
  practiceSession: null,
  lastScoreResult: null,
  lastFeedbackReport: null,
  attempts: [],

  startPractice: (problemId: Id) => {
    set({
      practiceSession: {
        problemId,
        startedAt: new Date().toISOString(),
      },
      lastScoreResult: null,
      lastFeedbackReport: null,
    });
  },

  setEvaluationResult: (score, feedback) => {
    set({
      lastScoreResult: score,
      lastFeedbackReport: feedback,
    });
  },

  recordAttempt: (attempt) => {
    set((state) => {
      const currentAttempts = state.attempts || [];
      const updated = pruneAttempts([...currentAttempts, attempt], attempt.problemId, 50);
      return { attempts: updated };
    });
  },

  openAttemptDiagram: (attempt) => {
    const problem = getProblem(attempt.problemId);
    const problemTitle = problem?.title ?? attempt.problemId;
    const docId = `attempt-${attempt.id}`;

    const existing = get().documents.find((d) => d.id === docId);
    if (existing) {
      set({ activeDocumentId: docId });
      get().requestFitView?.();
      return;
    }

    // Determine chronological index for this attempt among this problem's attempts
    const problemAttempts = (get().attempts || [])
      .filter((a) => a.problemId === attempt.problemId)
      .sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime());
    const attemptIndex = problemAttempts.findIndex((a) => a.id === attempt.id);
    const attemptNum = attemptIndex >= 0 ? attemptIndex + 1 : 1;

    const doc: Diagram = {
      ...attempt.diagramSnapshot,
      id: docId,
      title: `${problemTitle} — Attempt #${attemptNum}`,
      readOnly: true,
      sourceProblemId: attempt.problemId,
    };

    set((state) => ({
      documents: [...state.documents, doc],
      activeDocumentId: docId,
    }));
    get().requestFitView?.();
  },
});
