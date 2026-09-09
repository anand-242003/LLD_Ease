import React from 'react';

interface CodeViewerProps {
  code: string;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ code }) => {
  return (
    <div
      data-testid="code-viewer"
      className="w-full flex-1 bg-surface-2 border border-border rounded-[var(--r-md)] p-4 overflow-y-auto overflow-x-hidden min-h-0 select-text"
    >
      <pre className="font-mono text-[13px] leading-relaxed text-text whitespace-pre overflow-x-hidden m-0">
        <code>{code}</code>
      </pre>
    </div>
  );
};

export default CodeViewer;
