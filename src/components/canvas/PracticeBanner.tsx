import { History } from 'lucide-react';
import { useAppStore } from '../../store';
import { getProblem } from '../../domain/problems';

export function PracticeBanner() {
  const practiceSession = useAppStore((state) => state.practiceSession);
  const attempts = useAppStore((state) => state.attempts);
  const openAttemptHistory = useAppStore((state) => state.openAttemptHistory);

  if (!practiceSession) return null;

  const problem = getProblem(practiceSession.problemId);
  if (!problem) return null;

  const hasAttempts = attempts.some((a) => a.problemId === problem.id);

  return (
    <div
      id="practice-banner"
      data-testid="practice-banner"
      className="absolute top-4 left-1/2 -translate-x-1/2 z-20 w-max max-w-[90%] bg-[#101014] border border-primary/50 shadow-[0_0_16px_rgba(34,211,238,0.15)] rounded-[14px] px-4 py-2.5 flex items-center gap-3.5 select-none transition-all duration-fast"
    >
      {/* Pill */}
      <span className="bg-primary text-[#04292B] text-[11px] font-bold tracking-wider px-2.5 py-0.5 rounded-full uppercase shrink-0">
        PRACTICE
      </span>

      {/* Title */}
      <span className="font-semibold text-text text-[15px] shrink-0">{problem.title}</span>

      {/* Subtitle (hidden on tablet and mobile per PRD §18.3) */}
      <span
        className="hidden lg:inline text-[13px] text-text-muted truncate max-w-[320px]"
        title="Model the classes & relationships, then score your design against the reference."
      >
        Model the classes & relationships, then score your design against the reference.
      </span>

      {/* History remains the one contextual action — Brief (Phase 32), Reveal reference
          (Phase 33, superseded by the sidebar Problem Context Panel), and Exit (Phase 34,
          a session now only ends by starting a new one) have all been removed. */}
      {hasAttempts && (
        <button
          type="button"
          id="practice-banner-history-btn"
          data-testid="practice-banner-history-btn"
          onClick={() => openAttemptHistory(problem.id)}
          className="h-[32px] px-3 rounded-[7px] border border-border text-text text-[12px] font-medium hover:bg-surface-2 hover:border-border-strong transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <History size={13} className="text-text-muted" />
          <span>History</span>
        </button>
      )}
    </div>
  );
}

export default PracticeBanner;
