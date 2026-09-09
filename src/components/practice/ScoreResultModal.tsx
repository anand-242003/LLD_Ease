import { useState, useEffect, useRef, MouseEvent } from 'react';
import {
  X,
  Trophy,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Eye,
  RotateCcw,
} from 'lucide-react';
import { useAppStore } from '../../store';
import { getProblem } from '../../domain/problems';
import { GradeBand } from '../../domain/types';
import ScoreDimensionBar from './ScoreDimensionBar';
import FeedbackSection from './FeedbackSection';
import FindingCard from './FindingCard';

interface ScoreResultModalProps {
  onClose: () => void;
}

const GRADE_BAND_STYLES: Record<GradeBand, { badge: string; label: string }> = {
  Excellent: {
    badge: 'bg-success/20 text-success border border-success/40',
    label: 'Excellent',
  },
  Strong: {
    badge: 'bg-primary/20 text-primary border border-primary/40',
    label: 'Strong',
  },
  Fair: {
    badge: 'bg-amber-400/20 text-amber-400 border border-amber-400/40',
    label: 'Fair',
  },
  'Keep going': {
    badge: 'bg-surface-2 text-text-muted border border-border',
    label: 'Keep going',
  },
};

export function ScoreResultModal({ onClose }: ScoreResultModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const practiceSession = useAppStore((state) => state.practiceSession);
  const lastScoreResult = useAppStore((state) => state.lastScoreResult);
  const lastFeedbackReport = useAppStore((state) => state.lastFeedbackReport);
  const loadReferenceDiagram = useAppStore((state) => state.loadReferenceDiagram);
  const setSelectedElement = useAppStore((state) => state.setSelectedElement);
  const setActiveDocument = useAppStore((state) => state.setActiveDocument);
  const documents = useAppStore((state) => state.documents);

  const [classesBreakdownOpen, setClassesBreakdownOpen] = useState(false);

  useEffect(() => {
    triggerRef.current = document.getElementById('header-btn-score') as HTMLElement | null;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      triggerRef.current?.focus();
    };
  }, [onClose]);

  if (!practiceSession || !lastScoreResult) return null;

  const problem = getProblem(practiceSession.problemId);
  const gradeStyle = GRADE_BAND_STYLES[lastScoreResult.gradeBand] ?? GRADE_BAND_STYLES['Keep going'];

  const handleScrimClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleJumpToNode = (nodeId: string) => {
    // Switch to user's design tab if needed
    const myDesign = documents.find((d) => d.id === 'my-design') ?? documents[0];
    if (myDesign) {
      setActiveDocument(myDesign.id);
    }
    setSelectedElement({ type: 'node', id: nodeId });
    onClose();
  };

  const handleRevealReference = () => {
    if (problem) {
      loadReferenceDiagram(problem.id);
    }
    onClose();
  };

  const topImprovements = lastFeedbackReport?.topImprovements ?? [];

  return (
    <div
      id="score-result-scrim"
      onClick={handleScrimClick}
      className="fixed inset-0 bg-black/60 backdrop-blur-[3px] z-50 flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-fast select-none"
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="score-modal-title"
        className="bg-surface-3 border border-border rounded-[16px] max-w-2xl w-full max-h-[90vh] shadow-2xl flex flex-col overflow-hidden text-text"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between shrink-0 bg-surface-2/40">
          <div className="flex items-center gap-2.5">
            <Trophy size={20} className="text-primary" />
            <h2 id="score-modal-title" className="text-[17px] font-semibold text-text">
              Solution Score: {problem?.title ?? 'Practice Design'}
            </h2>
          </div>
          <button
            type="button"
            id="score-modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
            className="text-text-muted hover:text-text p-1 rounded-md hover:bg-surface-2 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Hero: Score + Grade Band */}
          <div className="flex items-center justify-between p-5 rounded-[14px] bg-surface-2/80 border border-border shadow-inner">
            <div className="flex items-baseline gap-2">
              <span className="text-[44px] font-bold tracking-tight text-text leading-none font-mono">
                {lastScoreResult.total}
              </span>
              <span className="text-[20px] font-mono text-text-muted">/ 100</span>
            </div>

            <div className="flex flex-col items-end gap-1">
              <span
                className={`px-3 py-1 rounded-full text-[12px] font-bold uppercase tracking-wider ${gradeStyle.badge}`}
              >
                {gradeStyle.label}
              </span>
              <span className="text-[12px] text-text-faint">
                Weighted composite score
              </span>
            </div>
          </div>

          {/* Top 3 Things to Improve Next (Phase 22 requirement) */}
          {topImprovements.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-text-muted">
                  Top Things to Improve Next
                </h3>
                <span className="text-[11px] text-text-faint font-mono">
                  Prioritized guidance
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {topImprovements.map((finding) => (
                  <FindingCard
                    key={finding.id}
                    finding={finding}
                    onJumpToNode={handleJumpToNode}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 5 Dimension Breakdown (Phase 21 requirement) */}
          <div className="space-y-3.5 border-t border-border pt-5">
            <h3 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-text-muted">
              Dimension Breakdown
            </h3>
            <div className="space-y-3">
              {lastScoreResult.dimensions.map((dim) => (
                <ScoreDimensionBar
                  key={dim.key}
                  label={dim.label}
                  weight={Math.round(dim.weight * 100)}
                  score={dim.score}
                  contribution={dim.score * dim.weight}
                />
              ))}
            </div>
          </div>

          {/* Classes Identified: Matched / Missing / Extra Breakdown */}
          <div className="border-t border-border pt-5">
            <button
              type="button"
              onClick={() => setClassesBreakdownOpen(!classesBreakdownOpen)}
              className="w-full flex items-center justify-between text-left py-1 text-text hover:text-primary transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                {classesBreakdownOpen ? (
                  <ChevronDown size={16} className="text-text-muted" />
                ) : (
                  <ChevronRight size={16} className="text-text-muted" />
                )}
                <span className="text-[13px] font-semibold">
                  Class Identification Details ({lastScoreResult.matched.length} matched, {lastScoreResult.missing.length} missing, {lastScoreResult.extra.length} extra)
                </span>
              </div>
              <span className="text-[11px] text-text-faint font-mono">
                {classesBreakdownOpen ? 'Hide' : 'Show'}
              </span>
            </button>

            {classesBreakdownOpen && (
              <div className="mt-3 space-y-4 pl-2">
                {/* Matched */}
                {lastScoreResult.matched.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-success uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 size={13} /> Matched Classes
                    </span>
                    <div className="grid grid-cols-1 gap-1.5">
                      {lastScoreResult.matched.map((mc, idx) => (
                        <div
                          key={idx}
                          className="px-3 py-1.5 rounded-[6px] bg-surface-2 border border-border text-[12px] font-mono flex items-center justify-between"
                        >
                          <span className="text-text">{mc.userName}</span>
                          <span className="text-text-muted text-[11px]">
                            matched with <span className="text-primary">{mc.referenceName}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Missing */}
                {lastScoreResult.missing.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-warning uppercase tracking-wider flex items-center gap-1.5">
                      <AlertCircle size={13} /> Missing From Reference
                    </span>
                    <div className="grid grid-cols-1 gap-1.5">
                      {lastScoreResult.missing.map((ms, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-[6px] bg-surface-2 border border-border text-[12px]"
                        >
                          <div className="font-mono text-text font-semibold mb-0.5">
                            {ms.name}
                          </div>
                          <div className="text-text-muted text-[12px]">{ms.hint}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Extra (BR66: Phrased Neutrally) */}
                {lastScoreResult.extra.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                      <HelpCircle size={13} /> Additional Classes in Your Design
                    </span>
                    <p className="text-[12px] text-text-muted italic">
                      Not in the reference — that isn't necessarily wrong. Alternative designs and helper classes are welcome.
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {lastScoreResult.extra.map((ec, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-[6px] bg-surface-2 border border-border font-mono text-[12px] text-text"
                        >
                          {ec.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Explainable Feedback: 4 Architectural Lenses (Phase 22 requirement) */}
          {lastFeedbackReport && (
            <div className="border-t border-border pt-5 space-y-3">
              <h3 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-text-muted">
                Architectural Lenses
              </h3>
              <div className="space-y-2.5">
                <FeedbackSection
                  lens="responsibilities"
                  title="Responsibilities & Cohesion"
                  findings={lastFeedbackReport.findings.filter((f) => f.lens === 'responsibilities')}
                  summary={lastFeedbackReport.summaryByLens.responsibilities}
                  onJumpToNode={handleJumpToNode}
                />
                <FeedbackSection
                  lens="abstractions"
                  title="Abstractions & Extensibility"
                  findings={lastFeedbackReport.findings.filter((f) => f.lens === 'abstractions')}
                  summary={lastFeedbackReport.summaryByLens.abstractions}
                  onJumpToNode={handleJumpToNode}
                />
                <FeedbackSection
                  lens="relationships"
                  title="Relationships & Coupling"
                  findings={lastFeedbackReport.findings.filter((f) => f.lens === 'relationships')}
                  summary={lastFeedbackReport.summaryByLens.relationships}
                  onJumpToNode={handleJumpToNode}
                />
                <FeedbackSection
                  lens="tradeoffs"
                  title="Design Trade-offs & Patterns"
                  findings={lastFeedbackReport.findings.filter((f) => f.lens === 'tradeoffs')}
                  summary={lastFeedbackReport.summaryByLens.tradeoffs}
                  onJumpToNode={handleJumpToNode}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-border bg-surface-2/40 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={handleRevealReference}
            className="px-4 py-2 text-[13px] font-medium border border-primary/70 text-primary hover:bg-primary/10 rounded-[8px] transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Eye size={14} />
            <span>Reveal reference</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[13px] font-medium border border-border text-text hover:bg-surface-2 rounded-[8px] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw size={14} className="text-text-muted" />
              <span>Try again</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[13px] font-medium bg-primary text-primary-fg hover:bg-primary-hover rounded-[8px] transition-colors cursor-pointer shadow-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ScoreResultModal;
