import { useState, useEffect, useRef, MouseEvent } from 'react';
import { X } from 'lucide-react';
import { getProblems } from '../../domain/problems';
import { Problem } from '../../domain/types';
import { useAppStore } from '../../store';
import ProblemCard from './ProblemCard';
import ConfirmDialog from '../ui/ConfirmDialog';

interface ProblemLibraryModalProps {
  onClose: () => void;
}

export function ProblemLibraryModal({ onClose }: ProblemLibraryModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerButtonRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const problems = getProblems();

  const documents = useAppStore((state) => state.documents);
  const loadReferenceDiagram = useAppStore((state) => state.loadReferenceDiagram);
  const startPractice = useAppStore((state) => state.startPractice);
  const clearCanvas = useAppStore((state) => state.clearCanvas);
  const setActiveDocument = useAppStore((state) => state.setActiveDocument);

  const [pendingPracticeProblem, setPendingPracticeProblem] = useState<Problem | null>(null);

  // Capture trigger element, trap focus, and lock body scroll
  useEffect(() => {
    triggerButtonRef.current = document.getElementById(
      'header-btn-problems'
    ) as HTMLElement | null;

    // Body scroll lock per PRD §9.1
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCloseRef.current();
      }

      // Focus trap
      if (e.key === 'Tab' && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;

        const firstElement = focusables[0];
        const lastElement = focusables[focusables.length - 1];
        if (!firstElement || !lastElement) return;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Initial focus into close button
    const closeBtn = dialogRef.current?.querySelector<HTMLButtonElement>(
      '#modal-close-btn'
    );
    closeBtn?.focus();

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);

      // Return focus to header button
      triggerButtonRef.current?.focus();
    };
  }, []);

  const handleScrimClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleLoadSolution = (problem: Problem) => {
    loadReferenceDiagram(problem.id);
  };

  const executeStartPractice = (problem: Problem) => {
    const myDesign = documents.find((d) => d.id === 'my-design') ?? documents[0];
    if (myDesign) {
      clearCanvas(myDesign.id);
      setActiveDocument(myDesign.id);
    }
    startPractice(problem.id);
    onClose();
  };

  const handlePractice = (problem: Problem) => {
    const myDesign = documents.find((d) => d.id === 'my-design') ?? documents[0];
    const hasContent = (myDesign?.nodes.length ?? 0) > 0 || (myDesign?.edges.length ?? 0) > 0;

    if (hasContent) {
      setPendingPracticeProblem(problem);
    } else {
      executeStartPractice(problem);
    }
  };

  const handleConfirmPractice = () => {
    if (pendingPracticeProblem) {
      const p = pendingPracticeProblem;
      setPendingPracticeProblem(null);
      executeStartPractice(p);
    }
  };

  return (
    <>
      <div
        id="problem-library-scrim"
        onClick={handleScrimClick}
        className="fixed inset-0 bg-black/55 backdrop-blur-[2px] z-50 flex items-center justify-center p-0 md:p-6 animate-in fade-in duration-fast"
        role="presentation"
      >
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="problem-library-title"
          aria-describedby="problem-library-subtitle"
          className="bg-surface-3 border border-border rounded-none md:rounded-[16px] shadow-2xl w-full h-full md:w-[72vw] md:max-w-[1240px] md:h-[88vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-fast"
        >
          {/* Sticky Header with Title, Subtitle, and Close button */}
          <div className="px-5 md:px-7 py-4 md:py-5 border-b border-border bg-surface-1 flex items-start justify-between shrink-0">
            <div>
              <h2
                id="problem-library-title"
                className="text-[20px] md:text-[22px] font-bold text-text tracking-tight"
              >
                LLD Problem Library
              </h2>
              <p
                id="problem-library-subtitle"
                className="text-[12px] md:text-[13px] text-text-muted mt-1"
              >
                Pick a classic low-level-design problem, load its verified solution, or practice and get scored.
              </p>
            </div>

            <button
              id="modal-close-btn"
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="w-9 h-9 border border-border rounded-[8px] bg-transparent hover:bg-surface-2 text-text-muted hover:text-text flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-4"
            >
              <X size={18} />
            </button>
          </div>

          {/* Scrollable Grid of Problem Cards (Single column on tablet/mobile <1100px per PRD §18.3) */}
          <div
            id="problem-library-grid"
            className="flex-1 overflow-y-auto p-4 md:p-7 grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {problems.map((problem) => (
              <ProblemCard
                key={problem.id}
                problem={problem}
                onPractice={handlePractice}
                onLoad={handleLoadSolution}
              />
            ))}
          </div>
        </div>
      </div>

      {pendingPracticeProblem && (
        <ConfirmDialog
          isOpen={true}
          title="Start Practice Session"
          message={`Start practising ${pendingPracticeProblem.title}? Your current design will be cleared.`}
          confirmLabel="Start Practice"
          cancelLabel="Cancel"
          variant="warning"
          onConfirm={handleConfirmPractice}
          onCancel={() => setPendingPracticeProblem(null)}
        />
      )}
    </>
  );
}

export default ProblemLibraryModal;
