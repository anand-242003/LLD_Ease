import React from 'react';
import { useReactFlow } from '@xyflow/react';
import { Issue } from '../../domain/types';
import { useAppStore, useActiveDocument } from '../../store';

interface IssueRowProps {
  issue: Issue;
}

const SEVERITY_DOT_COLORS: Record<string, string> = {
  error: 'bg-danger',
  warning: 'bg-warning',
  info: 'bg-primary',
};

export const IssueRow: React.FC<IssueRowProps> = ({ issue }) => {
  const setSelectedElement = useAppStore((state) => state.setSelectedElement);
  const activeDoc = useActiveDocument();
  const { setCenter } = useReactFlow();

  const handleClick = () => {
    if (!issue.subjectNodeId) return;

    // 1. Select the offending node
    setSelectedElement({ type: 'node', id: issue.subjectNodeId });

    // 2. Center node on canvas
    const targetNode = activeDoc?.nodes.find((n) => n.id === issue.subjectNodeId);
    if (targetNode) {
      setCenter(targetNode.position.x + 120, targetNode.position.y + 80, {
        zoom: 1,
        duration: 300,
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  const dotColorClass = SEVERITY_DOT_COLORS[issue.severity] || 'bg-warning';

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      data-testid={`issue-row-${issue.id}`}
      className="bg-surface-2 hover:bg-surface-3 border border-border rounded-[var(--r-md)] p-3 cursor-pointer transition-colors duration-fast text-left w-full flex items-start gap-2.5 select-none group focus:outline-none focus:border-primary"
    >
      {/* Severity dot */}
      <span
        className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${dotColorClass}`}
        aria-label={issue.severity}
      />

      {/* Row text: subject (mono + teal) — message (sans + text) */}
      <div className="text-[13px] leading-snug flex-1">
        <span className="font-mono text-primary font-semibold mr-1.5">
          {issue.subjectName}
        </span>
        <span className="text-text-muted mr-1.5">—</span>
        <span className="font-sans text-text">
          {issue.message}
        </span>
      </div>
    </div>
  );
};

export default IssueRow;
