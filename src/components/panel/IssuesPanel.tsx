import React from 'react';
import { useIssues } from '../../store/selectors';
import IssueRow from './IssueRow';

export const IssuesPanel: React.FC = () => {
  const issues = useIssues();

  if (issues.length === 0) {
    return (
      <div
        data-testid="issues-empty-state"
        className="flex-1 flex flex-col items-center justify-center text-center p-6"
      >
        <div className="w-10 h-10 rounded-full bg-success-soft text-success flex items-center justify-center mb-3">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <p className="text-[16px] font-semibold text-success mb-1">
          No problems
        </p>
        <p className="text-[14px] text-text-muted">
          Your diagram is valid and ready to generate.
        </p>
      </div>
    );
  }

  return (
    <div
      data-testid="issues-list"
      className="flex flex-col gap-2.5 overflow-y-auto pr-1"
    >
      {issues.map((issue) => (
        <IssueRow key={issue.id} issue={issue} />
      ))}
    </div>
  );
};

export default IssuesPanel;
