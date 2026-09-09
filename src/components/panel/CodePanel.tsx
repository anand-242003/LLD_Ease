import React, { useState } from 'react';
import { Copy, Download, Check } from 'lucide-react';
import { useActiveDocument, useGeneratedCode } from '../../store/selectors';
import { useAppStore } from '../../store';
import { Language } from '../../domain/types';
import PillGroup from './PillGroup';
import ChipToggle from './ChipToggle';
import CodeViewer from './CodeViewer';

const EXTENSIONS: Record<Language, string> = {
  java: '.java',
  python: '.py',
  typescript: '.ts',
  javascript: '.js',
  cpp: '.cpp',
  csharp: '.cs',
};

export const CodePanel: React.FC = () => {
  const activeDoc = useActiveDocument();
  const code = useGeneratedCode();
  const language = useAppStore((state) => state.ui.codeLanguage);
  const addToast = useAppStore((state) => state.addToast);
  const [copied, setCopied] = useState(false);

  const hasNodes = Boolean(activeDoc && activeDoc.nodes.length > 0);

  const handleCopy = async () => {
    if (!code) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        throw new Error('Clipboard API unavailable');
      }
    } catch {
      // Fallback per PRD §17.2: pre-select text and show hint
      const viewerElem = document.querySelector('[data-testid="code-viewer"] code');
      if (viewerElem && window.getSelection) {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(viewerElem);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
      addToast({
        message: 'Press ⌘C to copy',
        severity: 'info',
      });
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!code) return;
    const ext = EXTENSIONS[language] || '.txt';
    const rawTitle = activeDoc?.title || 'diagram';
    const cleanTitle =
      rawTitle.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9_-]/g, '') ||
      'diagram';
    const filename = `${cleanTitle}${ext}`;

    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      data-testid="code-panel"
      className="flex flex-col h-full overflow-hidden select-none"
    >
      {/* Row 1: Language Pills */}
      <div className="mb-3">
        <PillGroup />
      </div>

      {/* Row 2: Action Row (Copy & Download) */}
      <div className="flex items-center gap-2 mb-3">
        <button
          type="button"
          data-testid="code-btn-copy"
          disabled={!hasNodes}
          onClick={handleCopy}
          className="h-[30px] px-3 rounded-sm border border-border bg-surface-2 text-text text-[12px] font-medium hover:bg-surface-3 hover:border-border-strong transition-colors duration-fast flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {copied ? (
            <>
              <Check size={14} className="text-success" />
              <span className="text-success font-semibold">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={14} className="text-text-muted" />
              <span>Copy</span>
            </>
          )}
        </button>

        <button
          type="button"
          data-testid="code-btn-download"
          disabled={!hasNodes}
          onClick={handleDownload}
          className="h-[30px] px-3 rounded-sm border border-border bg-surface-2 text-text text-[12px] font-medium hover:bg-surface-3 hover:border-border-strong transition-colors duration-fast flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Download size={14} className="text-text-muted" />
          <span>Download</span>
        </button>
      </div>

      {/* Row 3–4: Option Chips */}
      <div className="mb-3">
        <ChipToggle />
      </div>

      <hr className="border-t border-border mb-4 shrink-0" />

      {/* Code Body / Empty State */}
      {!hasNodes ? (
        <div
          data-testid="code-empty-state"
          className="flex-1 flex flex-col items-center justify-center text-center p-6"
        >
          <p className="text-[15px] text-text-muted">
            Add a class to generate code.
          </p>
        </div>
      ) : (
        <CodeViewer code={code} />
      )}
    </div>
  );
};

export default CodePanel;
