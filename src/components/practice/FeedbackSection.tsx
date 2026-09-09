import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { FeedbackFinding, Lens, LensSummary } from '../../domain/feedback/types';
import FindingCard from './FindingCard';

export interface FeedbackSectionProps {
  lens: Lens;
  title: string;
  findings: FeedbackFinding[];
  summary: LensSummary;
  onJumpToNode?: (nodeId: string) => void;
  defaultExpanded?: boolean;
}

export function FeedbackSection({
  lens,
  title,
  findings,
  summary,
  onJumpToNode,
  defaultExpanded = true,
}: FeedbackSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div
      data-testid={`feedback-section-${lens}`}
      className="border border-border rounded-[12px] bg-surface-1 overflow-hidden"
    >
      {/* Header / Accordion trigger */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 bg-surface-2/60 hover:bg-surface-2 flex items-center justify-between transition-colors text-left cursor-pointer select-none"
      >
        <div className="flex items-center gap-2.5">
          {expanded ? (
            <ChevronDown size={16} className="text-text-muted" />
          ) : (
            <ChevronRight size={16} className="text-text-muted" />
          )}
          <span className="text-[14px] font-semibold text-text">
            {title}
          </span>
        </div>

        {/* Count badges */}
        <div className="flex items-center gap-2">
          {summary.concern > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-warning/15 text-warning border border-warning/30">
              {summary.concern} {summary.concern === 1 ? 'concern' : 'concerns'}
            </span>
          )}
          {summary.suggestion > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-400 border border-amber-400/30">
              {summary.suggestion} {summary.suggestion === 1 ? 'suggestion' : 'suggestions'}
            </span>
          )}
          {summary.positive > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-success/15 text-success border border-success/30">
              {summary.positive} positive
            </span>
          )}
          {findings.length === 0 && (
            <span className="text-[11px] text-text-faint italic">No observations</span>
          )}
        </div>
      </button>

      {/* Body: list of findings */}
      {expanded && (
        <div className="p-3.5 flex flex-col gap-2.5">
          {findings.length === 0 ? (
            <p className="text-[13px] text-text-muted italic py-2 text-center">
              No specific observations for this architectural lens.
            </p>
          ) : (
            findings.map((f) => (
              <FindingCard
                key={f.id}
                finding={f}
                onJumpToNode={onJumpToNode}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default FeedbackSection;
