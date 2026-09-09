import { X, ExternalLink, TrendingUp, TrendingDown, Minus, CheckCircle, AlertCircle, HelpCircle } from 'lucide-react';
import { useAppStore } from '../../store';
import { getProblem } from '../../domain/problems';
import { getProblemAttempts, computeAttemptDelta } from '../../domain/practice/attempts';
import AttemptTrendChart from './AttemptTrendChart';

interface AttemptHistoryPanelProps {
  onClose: () => void;
}

export function AttemptHistoryPanel({ onClose }: AttemptHistoryPanelProps) {
  const problemId = useAppStore((state) => state.ui.historyProblemId);
  const attempts = useAppStore((state) => state.attempts);
  const openAttemptDiagram = useAppStore((state) => state.openAttemptDiagram);

  if (!problemId) return null;

  const problem = getProblem(problemId);
  const problemTitle = problem?.title ?? problemId;

  // Newest first
  const problemAttempts = getProblemAttempts(attempts, problemId);

  // Chronological order for computing deltas and attempt numbering
  const chronological = [...problemAttempts].reverse();

  const handleOpenDiagram = (att: typeof problemAttempts[0]) => {
    openAttemptDiagram(att);
    onClose();
  };

  return (
    <div
      id="attempt-history-modal"
      data-testid="attempt-history-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-4 animate-in fade-in duration-modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-surface-3 border border-border rounded-[14px] w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="h-[56px] px-6 border-b border-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <h2 className="text-[17px] font-semibold text-text tracking-tight">
              {problemTitle}
            </h2>
            <span className="text-[12px] text-text-muted">· History</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close history"
            className="p-1.5 rounded-[6px] text-text-muted hover:text-text hover:bg-surface-2 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex flex-col gap-5 flex-1">
          {/* Trend Chart when >= 2 attempts */}
          {problemAttempts.length >= 2 && (
            <AttemptTrendChart attempts={problemAttempts} />
          )}

          {/* Attempts List */}
          <div className="flex flex-col gap-2.5">
            <h3 className="text-[11px] font-semibold text-text-muted tracking-wider uppercase px-1">
              Submissions ({problemAttempts.length})
            </h3>

            {problemAttempts.length === 0 ? (
              <div className="py-8 text-center text-text-muted text-[13px]">
                No submissions recorded yet for this problem.
              </div>
            ) : (
              problemAttempts.map((att) => {
                // Find chronological index
                const chronoIdx = chronological.findIndex((a) => a.id === att.id);
                const attemptNum = chronoIdx + 1;

                // Signed delta vs previous attempt
                const prevAtt = chronoIdx > 0 ? chronological[chronoIdx - 1] : null;
                const delta = prevAtt ? computeAttemptDelta(att.score, prevAtt.score) : null;

                const formattedDate = new Date(att.submittedAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                const gradeBandColor =
                  att.gradeBand === 'Excellent'
                    ? 'text-success bg-success/15'
                    : att.gradeBand === 'Strong'
                    ? 'text-primary bg-primary/15'
                    : att.gradeBand === 'Fair'
                    ? 'text-amber-400 bg-amber-500/15'
                    : 'text-text-muted bg-surface-2';

                return (
                  <div
                    key={att.id}
                    data-testid={`attempt-row-${att.id}`}
                    className="bg-surface-2 border border-border hover:border-primary/40 rounded-[10px] p-4 flex flex-col gap-3 transition-colors duration-fast"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-[13px] font-bold text-text">
                          Attempt #{attemptNum}
                        </span>
                        <span className="text-[11px] text-text-faint">
                          {formattedDate}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenDiagram(att)}
                        className="flex items-center gap-1.5 px-2.5 py-1 text-[12px] font-medium text-primary hover:text-primary-hover bg-primary-soft rounded-[6px] transition-colors cursor-pointer"
                        aria-label={`View diagram for attempt #${attemptNum}`}
                      >
                        <ExternalLink size={12} />
                        View diagram
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-border/50 text-[13px]">
                      {/* Score and Delta */}
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-text text-[15px]">
                          {att.score}
                        </span>
                        <span className="text-[11px] text-text-muted">/ 100</span>

                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${gradeBandColor}`}
                        >
                          {att.gradeBand}
                        </span>

                        {delta !== null && (
                          <span
                            className={`flex items-center gap-0.5 font-mono text-[11px] font-semibold px-1.5 py-0.5 rounded ${
                              delta > 0
                                ? 'text-success bg-success/10'
                                : delta < 0
                                ? 'text-danger bg-danger/10'
                                : 'text-text-muted bg-surface-3'
                            }`}
                          >
                            {delta > 0 ? (
                              <>
                                <TrendingUp size={11} />+{delta}
                              </>
                            ) : delta < 0 ? (
                              <>
                                <TrendingDown size={11} />
                                {delta}
                              </>
                            ) : (
                              <>
                                <Minus size={11} /> 0
                              </>
                            )}
                          </span>
                        )}
                      </div>

                      {/* Feedback summary counters */}
                      <div className="flex items-center gap-2 text-[11px] font-mono text-text-muted">
                        {att.feedbackSummary.concerns > 0 && (
                          <span
                            className="flex items-center gap-1 text-danger"
                            title={`${att.feedbackSummary.concerns} concerns`}
                          >
                            <AlertCircle size={11} />
                            {att.feedbackSummary.concerns}
                          </span>
                        )}
                        {att.feedbackSummary.suggestions > 0 && (
                          <span
                            className="flex items-center gap-1 text-amber-400"
                            title={`${att.feedbackSummary.suggestions} suggestions`}
                          >
                            <HelpCircle size={11} />
                            {att.feedbackSummary.suggestions}
                          </span>
                        )}
                        {att.feedbackSummary.positives > 0 && (
                          <span
                            className="flex items-center gap-1 text-success"
                            title={`${att.feedbackSummary.positives} strengths`}
                          >
                            <CheckCircle size={11} />
                            {att.feedbackSummary.positives}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AttemptHistoryPanel;
