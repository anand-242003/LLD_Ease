import { useState } from 'react';
import { ChevronDown, Eye } from 'lucide-react';
import { useAppStore } from '../../store';
import { useActiveDocument, useActiveProblemContext } from '../../store/selectors';

/**
 * Phase 31 — persistent problem context, shown at the top of PaletteSidebar
 * whenever a problem is "in scope" (practicing it, or viewing its reference/
 * an attempt snapshot). Replaces the old Brief modal (Phase 32) and one of
 * the three redundant "see a solution" affordances (Phase 33).
 */
export function ProblemContextPanel() {
  const problem = useActiveProblemContext();
  const activeDoc = useActiveDocument();
  const loadReferenceDiagram = useAppStore((state) => state.loadReferenceDiagram);
  const [isExpanded, setIsExpanded] = useState(false);

  if (!problem) return null;

  const difficultyBadgeStyle =
    problem.difficulty === 'EASY'
      ? 'bg-success text-[#04231A]'
      : problem.difficulty === 'HARD'
        ? 'bg-danger text-[#2B0808]'
        : 'bg-warning text-[#2B1900]';

  // Hide the "View reference solution" action only when we're already looking
  // at that problem's actual reference tab (not an attempt snapshot review,
  // where jumping to the reference is still useful).
  const isViewingReference =
    Boolean(activeDoc?.readOnly) &&
    activeDoc?.sourceProblemId === problem.id &&
    !activeDoc.id.startsWith('attempt-');

  const hasReference = Boolean(problem.referenceDiagram?.nodes?.length);

  return (
    <section
      id="problem-context-panel"
      data-testid="problem-context-panel"
      className="w-full bg-surface-2 border border-border rounded-[10px] p-4 flex flex-col gap-2"
    >
      <span
        data-testid={`problem-context-badge-${problem.difficulty.toLowerCase()}`}
        className={`self-start rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${difficultyBadgeStyle}`}
      >
        {problem.difficulty}
      </span>

      <h3 className="text-[15px] font-semibold text-text leading-snug line-clamp-2">
        {problem.title}
      </h3>

      <div className="text-primary text-[12px] font-medium">{problem.patterns.join(' · ')}</div>

      <p
        className={`text-[13px] text-text-muted leading-relaxed ${
          isExpanded ? '' : 'line-clamp-3'
        }`}
      >
        {problem.description}
      </p>

      <button
        type="button"
        id="problem-context-toggle"
        data-testid="problem-context-toggle"
        aria-expanded={isExpanded}
        onClick={() => setIsExpanded((prev) => !prev)}
        className="self-start text-[12px] text-primary hover:text-primary-hover font-medium cursor-pointer flex items-center gap-1"
      >
        <span>{isExpanded ? 'Show less' : 'Show more'}</span>
        <ChevronDown
          size={12}
          className={`transition-transform duration-fast ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>

      {isExpanded && (
        <ul className="space-y-1.5 text-[13px] text-text-muted">
          {problem.requirements.map((req, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-text-faint select-none shrink-0">•</span>
              <span className="leading-snug">{req}</span>
            </li>
          ))}
        </ul>
      )}

      {!isViewingReference && (
        <button
          type="button"
          id="problem-context-view-reference"
          data-testid="problem-context-view-reference"
          disabled={!hasReference}
          title={
            hasReference
              ? 'View reference solution'
              : 'No reference solution available for this problem.'
          }
          onClick={() => loadReferenceDiagram(problem.id)}
          className={`w-full h-[38px] mt-1 rounded-[10px] border text-[13px] font-medium flex items-center justify-center gap-1.5 transition-colors ${
            hasReference
              ? 'border-border bg-surface-2 text-text hover:bg-surface-3 hover:border-border-strong cursor-pointer'
              : 'border-border text-text-faint opacity-40 cursor-not-allowed'
          }`}
        >
          <Eye size={14} />
          <span>View reference solution</span>
        </button>
      )}
    </section>
  );
}

export default ProblemContextPanel;
