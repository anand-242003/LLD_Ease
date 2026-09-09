import { useState, useRef, useEffect } from 'react';
import Button from '../ui/Button';
import { FolderKanban, Trash2, Trophy, Loader2, Menu, X } from 'lucide-react';
import { useAppStore } from '../../store';
import { useActiveDocument } from '../../store/selectors';
import { getProblem } from '../../domain/problems';
import { scoreAgainstReference } from '../../domain/scoring';
import { buildFeedbackReport } from '../../domain/feedback';
import { createAttemptSnapshot } from '../../domain/practice/attempts';
import { Diagram } from '../../domain/types';
import { useBreakpoint } from '../../hooks/useMediaQuery';
import ConfirmDialog from '../ui/ConfirmDialog';
import ProfileSwitcher from './ProfileSwitcher';

export interface AppHeaderProps {
  onOpenProblems?: () => void;
  onClear?: () => void;
  onGoHome?: () => void;
}

export function AppHeader({ onOpenProblems, onClear, onGoHome }: AppHeaderProps) {
  const activeDoc = useActiveDocument();
  const documents = useAppStore((state) => state.documents);
  const practiceSession = useAppStore((state) => state.practiceSession);
  const addToast = useAppStore((state) => state.addToast);
  const setActiveModal = useAppStore((state) => state.setActiveModal);
  const setEvaluationResult = useAppStore((state) => state.setEvaluationResult);
  const clearCanvas = useAppStore((state) => state.clearCanvas);

  const [isScoring, setIsScoring] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const { isMobile, windowWidth, isCompactHeader } = useBreakpoint();

  // Collapse priority below ~1200px: Clear -> LLD Problems (PRD §18.2, reduced
  // from the original Import/Export/Sample/Clear/Problems chain in Phases 30/33)
  const isClearCollapsed = windowWidth < 1200;
  const isProblemsCollapsed = windowWidth < 960;

  const isReadOnly = activeDoc?.readOnly ?? false;

  // Close mobile menu on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target as Node) &&
        !(e.target as HTMLElement)?.closest('#header-mobile-menu-btn')
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  const handleClearClick = () => {
    if (isReadOnly) return;
    setShowClearConfirm(true);
  };

  const handleConfirmClear = () => {
    if (onClear) {
      onClear();
    } else if (activeDoc?.id) {
      clearCanvas(activeDoc.id);
    }
    setShowClearConfirm(false);
  };

  const handleScoreMySolution = () => {
    if (!practiceSession) return;

    // Use user's design diagram for scoring
    const myDesignDoc = documents.find((d) => d.id === 'my-design') ?? documents[0];
    if (!myDesignDoc || myDesignDoc.nodes.length === 0) {
      addToast({
        message: 'Add some classes first, then score your design.',
        severity: 'info',
      });
      return;
    }

    const problem = getProblem(practiceSession.problemId);
    if (!problem) return;

    setIsScoring(true);

    // Brief simulated async operation per PRD §12.7 & Phase 21
    setTimeout(() => {
      try {
        const fullRefDiagram: Diagram = {
          ...problem.referenceDiagram,
          id: `ref-${problem.id}`,
          title: `${problem.title} (Reference)`,
          readOnly: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const score = scoreAgainstReference(myDesignDoc, fullRefDiagram);
        const feedback = buildFeedbackReport(myDesignDoc, fullRefDiagram);
        const attempt = createAttemptSnapshot(
          practiceSession.problemId,
          score,
          feedback,
          myDesignDoc
        );
        useAppStore.getState().recordAttempt(attempt);
        setEvaluationResult(score, feedback);
        setActiveModal('score-result');
      } catch (err) {
        console.error('Scoring error:', err);
        addToast({
          message: 'An error occurred while scoring your design.',
          severity: 'error',
        });
      } finally {
        setIsScoring(false);
      }
    }, 280);
  };

  return (
    <header className="h-[56px] bg-surface-1 border-b border-border px-4 flex items-center justify-between select-none z-10">
      {/* Brand Section — Phase 37: clicking it returns to the marketing homepage */}
      <button
        type="button"
        id="header-brand-mark"
        data-testid="header-brand-mark"
        onClick={onGoHome}
        aria-label="Return to homepage"
        title="Return to homepage"
        className="flex items-center gap-3 cursor-pointer bg-transparent border-none p-0"
      >
        <div className="w-9 h-9 rounded-md bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center shadow-sm">
          {/* 3-node connected graph mark */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#04292B"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="6" cy="6" r="3" fill="#04292B" />
            <circle cx="18" cy="8" r="3" fill="#04292B" />
            <circle cx="12" cy="18" r="3" fill="#04292B" />
            <line x1="8.5" y1="7" x2="15.5" y2="7.5" />
            <line x1="7.5" y1="8.5" x2="10.5" y2="15.5" />
            <line x1="16.5" y1="10.5" x2="13.5" y2="15.5" />
          </svg>
        </div>
        <div className="flex flex-col leading-tight items-start">
          <span className="text-[17px] font-semibold text-text tracking-tight">LLDSIM</span>
          <span className="text-[10px] font-semibold tracking-[0.08em] text-text-muted uppercase">
            LLD STUDIO
          </span>
        </div>
      </button>

      {/* Desktop & Tablet Center Actions Toolbar */}
      {!isMobile && (
        <div className="flex items-center gap-2">
          <Button
            id="header-btn-problems"
            data-testid="header-btn-problems"
            variant="primary"
            icon={<FolderKanban size={16} />}
            onClick={onOpenProblems}
            title="LLD Problems"
            aria-label="LLD Problems"
          >
            {!isProblemsCollapsed && 'LLD Problems'}
          </Button>

          {/* Practice Mode: Score My Solution Button (BR60) */}
          {practiceSession && (
            <Button
              id="header-btn-score"
              data-testid="header-btn-score"
              variant="outline"
              disabled={isScoring}
              icon={
                isScoring ? (
                  <Loader2 size={16} className="animate-spin text-primary" />
                ) : (
                  <Trophy size={16} className="text-primary" />
                )
              }
              onClick={handleScoreMySolution}
              className="!border-primary !text-primary hover:!bg-primary/10 shadow-sm"
              title="Score my solution"
              aria-label="Score my solution"
            >
              {isScoring ? 'Scoring…' : isCompactHeader ? 'Score' : 'Score my solution'}
            </Button>
          )}

          <Button
            id="header-btn-clear"
            data-testid="header-btn-clear"
            variant="secondary"
            icon={<Trash2 size={16} />}
            onClick={handleClearClick}
            disabled={isReadOnly}
            title="Clear"
            aria-label="Clear canvas"
          >
            {!isClearCollapsed && 'Clear'}
          </Button>
        </div>
      )}

      {/* Right Controls: Desktop — ProfileSwitcher moved here */}
      {!isMobile && (
        <div className="flex items-center gap-2">
          <ProfileSwitcher />
        </div>
      )}

      {/* Mobile Menu Toggle Button (<768px, PRD §18.4) */}
      {isMobile && (
        <div className="flex items-center gap-2">
          <div className="relative" ref={mobileMenuRef}>
            <button
              id="header-mobile-menu-btn"
              data-testid="header-mobile-menu-btn"
              type="button"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open navigation menu'}
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="w-9 h-9 flex items-center justify-center text-text-muted hover:text-text rounded-md hover:bg-surface-2 transition-colors cursor-pointer border border-border"
            >
              {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            {isMobileMenuOpen && (
              <div
                id="header-mobile-menu"
                data-testid="header-mobile-menu"
                className="absolute top-full right-0 mt-2 w-64 bg-surface-1 border border-border shadow-lg rounded-xl py-2 z-50 flex flex-col gap-1 select-none"
              >
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenProblems?.();
                  }}
                  className="w-full px-3 py-2 text-left text-[14px] text-primary hover:bg-surface-2 flex items-center gap-2.5 transition-colors cursor-pointer font-medium"
                >
                  <FolderKanban size={16} />
                  <span>LLD Problems</span>
                </button>

                {practiceSession && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleScoreMySolution();
                    }}
                    className="w-full px-3 py-2 text-left text-[14px] text-primary hover:bg-surface-2 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Trophy size={16} />
                    <span>Score my solution</span>
                  </button>
                )}

                <div className="w-full h-px bg-border my-1" />

                <button
                  type="button"
                  disabled={isReadOnly}
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleClearClick();
                  }}
                  className="w-full px-3 py-2 text-left text-[14px] text-rose-400 hover:bg-rose-500/10 flex items-center gap-2.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Trash2 size={16} />
                  <span>Clear Canvas</span>
                </button>

                <div className="w-full h-px bg-border my-1" />

                {/* Profile Switcher in mobile menu */}
                <div className="px-3 py-2">
                  <ProfileSwitcher />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Clear Canvas Confirmation Dialog (PRD §9.11 / §14-BR31) */}
      <ConfirmDialog
        isOpen={showClearConfirm}
        title="Clear canvas"
        message="Clear all classes, relationships, and ink strokes? Sticky notes and notes will be kept."
        confirmLabel="Clear"
        variant="danger"
        onConfirm={handleConfirmClear}
        onCancel={() => setShowClearConfirm(false)}
      />
    </header>
  );
}

export default AppHeader;
