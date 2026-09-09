import React from 'react';
import { FeedbackFinding } from '../../domain/feedback/types';

export interface FindingCardProps {
  finding: FeedbackFinding;
  onJumpToNode?: (nodeId: string) => void;
}

const SEVERITY_DOT_COLORS = {
  positive: 'bg-success',
  suggestion: 'bg-amber-400',
  concern: 'bg-warning',
};

const SEVERITY_BADGES = {
  positive: 'text-success bg-success/10 border-success/30',
  suggestion: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
  concern: 'text-warning bg-warning/10 border-warning/30',
};

export function FindingCard({ finding, onJumpToNode }: FindingCardProps) {
  const handleClick = () => {
    if (finding.subjectNodeIds.length > 0 && onJumpToNode) {
      const targetId = finding.subjectNodeIds[0];
      if (targetId) {
        onJumpToNode(targetId);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  const dotClass = SEVERITY_DOT_COLORS[finding.severity] ?? 'bg-warning';
  const badgeClass = SEVERITY_BADGES[finding.severity] ?? 'text-warning bg-warning/10 border-warning/30';
  const isClickable = finding.subjectNodeIds.length > 0 && Boolean(onJumpToNode);

  return (
    <div
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={isClickable ? handleClick : undefined}
      onKeyDown={isClickable ? handleKeyDown : undefined}
      data-testid={`finding-card-${finding.id}`}
      className={`bg-surface-2 hover:bg-surface-3 border border-border rounded-[10px] p-3.5 transition-colors duration-fast text-left flex flex-col gap-1.5 select-none group ${
        isClickable ? 'cursor-pointer focus:outline-none focus:border-primary' : ''
      }`}
    >
      {/* Top row: dot + title + severity badge */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${dotClass}`}
            aria-label={finding.severity}
          />
          <h4 className="font-semibold text-[13px] text-text group-hover:text-primary transition-colors truncate">
            {finding.title}
          </h4>
        </div>

        <span
          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0 ${badgeClass}`}
        >
          {finding.severity}
        </span>
      </div>

      {/* Explanation text */}
      <p className="text-[13px] text-text-muted leading-relaxed pl-4">
        {finding.explanation}
      </p>

      {/* Suggested fix if present */}
      {finding.suggestedFix && (
        <div className="ml-4 mt-1 px-2.5 py-1.5 rounded-[6px] bg-surface-1 border border-border text-[12px] text-text-muted flex items-start gap-1.5">
          <span className="text-primary font-medium shrink-0">Suggestion:</span>
          <span>{finding.suggestedFix}</span>
        </div>
      )}

      {isClickable && (
        <div className="pl-4 text-[11px] text-primary/70 group-hover:text-primary transition-colors font-mono">
          Click to focus class on canvas &rarr;
        </div>
      )}
    </div>
  );
}

export default FindingCard;
