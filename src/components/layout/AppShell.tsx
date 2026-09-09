import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useAppStore } from '../../store';
import AppHeader from './AppHeader';
import PaletteSidebar from './PaletteSidebar';
import DocumentTabBar from './DocumentTabBar';
import CanvasStage from '../canvas/CanvasStage';
import RightPanel from '../panel/RightPanel';
import ToastContainer from '../ui/ToastContainer';
import ProblemLibraryModal from '../library/ProblemLibraryModal';
import ScoreResultModal from '../practice/ScoreResultModal';
import AttemptHistoryPanel from '../practice/AttemptHistoryPanel';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { useBreakpoint } from '../../hooks/useMediaQuery';

export interface AppShellProps {
  onGoHome?: () => void;
}

export function AppShell({ onGoHome }: AppShellProps) {
  const activeModal = useAppStore((state) => state.ui.activeModal);
  const setActiveModal = useAppStore((state) => state.setActiveModal);

  const { isMobile, isTablet, isLaptop } = useBreakpoint();
  const [showMobileNotice, setShowMobileNotice] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !sessionStorage.getItem('classforge_mobile_notice_dismissed');
  });

  const handleDismissMobileNotice = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('classforge_mobile_notice_dismissed', 'true');
    }
    setShowMobileNotice(false);
  };

  // Phase 27: Global keyboard shortcuts mounted once here (PRD §10.1)
  useKeyboardShortcuts();

  // Handle browser Back button closing any active modal (PRD §7.3 / §9.1 / §17.6)
  useEffect(() => {
    if (activeModal) {
      window.history.pushState({ modalOpen: true }, '');
    }
  }, [activeModal]);

  useEffect(() => {
    const handlePopState = () => {
      if (useAppStore.getState().ui.activeModal) {
        useAppStore.setState((state) => ({
          ui: { ...state.ui, activeModal: null },
        }));
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const getGridTemplateColumns = () => {
    if (isMobile) return '1fr';
    if (isTablet) return '64px 1fr';
    if (isLaptop) return '265px 1fr 420px';
    return '265px 1fr 510px';
  };

  return (
    <div
      id="app-shell"
      className="w-screen h-screen overflow-hidden grid bg-bg text-text select-none relative"
      style={{
        gridTemplateRows: isMobile && showMobileNotice ? '56px 32px 1fr' : '56px 1fr',
        gridTemplateColumns: getGridTemplateColumns(),
      }}
    >
      {/* Top Header — spanning all columns */}
      <div className={isMobile ? 'col-span-1' : isTablet ? 'col-span-2' : 'col-span-3'}>
        <AppHeader onOpenProblems={() => setActiveModal('problem-library')} onGoHome={onGoHome} />
      </div>

      {/* Mobile Notice Bar (PRD §18.4) */}
      {isMobile && showMobileNotice && (
        <div
          id="mobile-screen-notice"
          data-testid="mobile-screen-notice"
          className="col-span-1 bg-surface-2 border-b border-border text-text-muted text-[12px] px-4 flex items-center justify-between z-20 shrink-0 select-none"
        >
          <span>LLDSIM works best on a larger screen.</span>
          <button
            type="button"
            aria-label="Dismiss screen notice"
            onClick={handleDismissMobileNotice}
            className="p-1 text-text-muted hover:text-text cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Left Column: Palette Sidebar (265px desktop, 64px tablet, FAB bottom sheet on mobile) */}
      <PaletteSidebar />

      {/* Center Column: DocumentTabBar + Canvas */}
      <div className="flex flex-col h-full overflow-hidden relative">
        <DocumentTabBar />
        <CanvasStage />
      </div>

      {/* Right Column: Inspector & Derivations Panel (510px desktop, 420px laptop, drawer on tablet/mobile) */}
      <RightPanel />

      {/* Toast Notifications */}
      <ToastContainer />

      {/* Modal Dialogs */}
      {activeModal === 'problem-library' && (
        <ProblemLibraryModal onClose={() => setActiveModal(null)} />
      )}
      {activeModal === 'score-result' && <ScoreResultModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'attempt-history' && (
        <AttemptHistoryPanel onClose={() => setActiveModal(null)} />
      )}
    </div>
  );
}

export default AppShell;
