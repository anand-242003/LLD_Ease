import { History } from 'lucide-react';
import { Problem } from '../../domain/types';
import { useAppStore } from '../../store';
import { getBestScore, getProblemAttempts } from '../../domain/practice/attempts';

interface ProblemCardProps {
  problem: Problem;
  onPractice?: (problem: Problem) => void;
}

export function ProblemCard({ problem, onPractice }: ProblemCardProps) {
  const allAttempts = useAppStore((state) => state.attempts);
  const openAttemptHistory = useAppStore((state) => state.openAttemptHistory);
  const attempts = getProblemAttempts(allAttempts, problem.id);
  const bestScore = getBestScore(allAttempts, problem.id);

  const difficultyBadgeStyle =
    problem.difficulty === 'EASY'
      ? 'bg-success text-[#04231A]'
      : problem.difficulty === 'HARD'
      ? 'bg-danger text-[#2B0808]'
      : 'bg-warning text-[#2B1900]';

  return (
    <div
      id={`problem-card-${problem.id}`}
      data-testid={`problem-card-${problem.id}`}
      className="bg-surface-3 border border-border rounded-[12px] p-6 flex flex-col min-h-[360px] transition-colors duration-fast hover:border-primary/40"
    >
      {/* Top Header: Title and Difficulty Badge */}
      <div className="flex items-start justify-between gap-3 mb-1">
        <h3 className="text-[19px] font-semibold text-text tracking-tight">
          {problem.title}
        </h3>
        <span
          data-testid={`badge-${problem.difficulty.toLowerCase()}`}
          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider shrink-0 ${difficultyBadgeStyle}`}
        >
          {problem.difficulty}
        </span>
      </div>

      {/* Pattern Tags */}
      <div className="text-primary text-[13px] font-medium mb-3">
        {problem.patterns.join(' · ')}
      </div>

      {/* Description */}
      <p className="text-[13px] text-text-muted leading-relaxed mb-4 line-clamp-3">
        {problem.description}
      </p>

      {/* Requirements List (4 bullets) */}
      <ul className="space-y-1.5 mb-5 text-[13px] text-text-muted flex-1">
        {problem.requirements.map((req, idx) => (
          <li key={idx} className="flex items-start gap-2">
            <span className="text-text-faint select-none shrink-0">•</span>
            <span className="leading-snug">{req}</span>
          </li>
        ))}
      </ul>

      {/* Stats line (Monospace) */}
      <div className="flex items-center justify-between font-mono text-[12px] text-text-faint mb-2">
        <span>{problem.stats.classes} classes · {problem.stats.relationships} relationships</span>
        {attempts.length > 0 && (
          <span className="text-text-muted">
            Best: <span className="font-semibold text-primary">{bestScore}</span>
          </span>
        )}
      </div>

      {/* Actions Row */}
      <div className="flex items-center gap-3 mt-auto pt-2">
        <button
          type="button"
          onClick={() => onPractice?.(problem)}
          data-testid={`practice-btn-${problem.id}`}
          className="flex-1 h-[38px] rounded-[8px] bg-primary text-primary-fg text-[13px] font-semibold hover:bg-primary-hover transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
        >
          Practice
        </button>
        <button
          type="button"
          onClick={() => openAttemptHistory(problem.id)}
          data-testid={`view-history-btn-${problem.id}`}
          className="flex-1 h-[38px] rounded-[8px] border border-border text-text text-[13px] font-medium hover:bg-surface-2 hover:border-border-strong transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <History size={15} className="text-text-muted" />
          <span>View history</span>
          {attempts.length > 0 && (
            <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-surface-2 text-primary border border-border/60">
              {attempts.length}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

export default ProblemCard;
