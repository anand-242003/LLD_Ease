import { useState, useEffect } from 'react';
import { Sliders, AlertCircle, Code2, FileText, X } from 'lucide-react';
import { useAppStore } from '../../store';
import { useIssues } from '../../store/selectors';
import { RightPanelTab } from '../../domain/types';
import Inspector from './Inspector';
import IssuesPanel from './IssuesPanel';
import CodePanel from './CodePanel';
import NotesPanel from './NotesPanel';
import { useBreakpoint } from '../../hooks/useMediaQuery';

export function RightPanel() {
  const activeTab = useAppStore((state) => state.ui.rightPanelTab);
  const setActiveTab = useAppStore((state) => state.setRightPanelTab);
  const selectedElement = useAppStore((state) => state.ui.selectedElement);
  const issues = useIssues();

  const { isMobile, isTablet, isLaptop } = useBreakpoint();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Tablet/Mobile: Auto-open drawer when an element is selected (PRD §18.3)
  useEffect(() => {
    if (selectedElement && (isTablet || isMobile)) {
      setIsDrawerOpen(true);
    }
  }, [selectedElement, isTablet, isMobile]);

  const tabs: Array<{
    id: RightPanelTab;
    label: string;
    icon: React.ReactNode;
    badge?: string | number;
  }> = [
    { id: 'inspector', label: 'Inspector', icon: <Sliders size={15} /> },
    { id: 'issues', label: 'Issues', icon: <AlertCircle size={15} />, badge: issues.length },
    { id: 'code', label: 'Code', icon: <Code2 size={15} /> },
    { id: 'notes', label: 'Notes', icon: <FileText size={15} /> },
  ];

  // Desktop / Laptop fixed sidebar rendering
  if (!isTablet && !isMobile) {
    return (
      <aside
        id="right-panel"
        style={{ width: isLaptop ? 'var(--panel-w-lg, 420px)' : 'var(--panel-w, 510px)' }}
        className="bg-surface-1 border-l border-border h-full flex flex-col select-none overflow-hidden shrink-0 transition-all duration-200"
      >
        {/* Tab Navigation Header */}
        <div
          role="tablist"
          aria-label="Inspector and code tabs"
          className="h-[44px] border-b border-border flex items-center px-4 shrink-0"
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                aria-label={tab.label}
                onClick={() => setActiveTab(tab.id)}
                className={`h-full px-4 flex items-center gap-2 text-[14px] font-medium transition-colors duration-fast border-b-2 relative -mb-[1px] cursor-pointer ${
                  isActive
                    ? 'text-primary border-primary'
                    : 'text-text-muted border-transparent hover:text-text'
                }`}
              >
                <span className="shrink-0">{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    aria-live="polite"
                    aria-atomic="true"
                    data-testid={`tab-badge-${tab.id}`}
                    className={`text-[11px] font-mono px-1.5 py-0.5 rounded-full font-bold ${
                      tab.badge === 0
                        ? 'bg-surface-3 text-text-muted'
                        : 'bg-success-soft text-success'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col">
          {activeTab === 'inspector' && <Inspector />}
          {activeTab === 'issues' && <IssuesPanel />}
          {activeTab === 'code' && <CodePanel />}
          {activeTab === 'notes' && <NotesPanel />}
        </div>
      </aside>
    );
  }

  // Tablet: Persistent edge tab strip + slide-over drawer (PRD §18.3)
  // Mobile: Full-screen sheet with tabs across top (PRD §18.4)
  return (
    <>
      {/* Persistent Edge Strip on Tablet (when drawer is closed or open) */}
      {isTablet && (
        <div
          id="tablet-edge-strip"
          data-testid="tablet-edge-strip"
          className="fixed right-0 top-14 bottom-0 w-12 bg-surface-1 border-l border-border flex flex-col items-center py-4 gap-4 z-30 select-none"
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                aria-label={tab.label}
                title={tab.label}
                onClick={() => {
                  setActiveTab(tab.id);
                  setIsDrawerOpen(true);
                }}
                className={`w-9 h-9 rounded-lg flex items-center justify-center relative transition-colors cursor-pointer ${
                  isActive && isDrawerOpen
                    ? 'bg-primary/20 text-primary border border-primary/40'
                    : 'text-text-muted hover:text-text hover:bg-surface-2'
                }`}
              >
                {tab.icon}
                {tab.badge !== undefined && Number(tab.badge) > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-fg text-[10px] font-bold flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Mobile Floating Toggle for Panel (<768px) */}
      {isMobile && !isDrawerOpen && (
        <button
          id="mobile-panel-fab"
          data-testid="mobile-panel-fab"
          type="button"
          aria-label="Open inspector and derivations panel"
          onClick={() => setIsDrawerOpen(true)}
          className="fixed bottom-6 right-6 z-40 px-4 h-12 rounded-full bg-surface-1 text-text border border-border shadow-lg flex items-center gap-2 text-[14px] font-medium hover:bg-surface-2 cursor-pointer"
        >
          <Sliders size={16} className="text-primary" />
          <span>Panel</span>
          {issues.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-primary text-primary-fg text-[11px] font-bold">
              {issues.length}
            </span>
          )}
        </button>
      )}

      {/* Slide-over Drawer (Tablet) or Full-screen Sheet (Mobile) */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end select-none">
          {/* Backdrop scrim */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Drawer container */}
          <aside
            id="responsive-drawer-panel"
            className={`${
              isMobile ? 'w-full h-full' : 'w-[440px] h-full shadow-2xl'
            } bg-surface-1 border-l border-border flex flex-col z-10 relative overflow-hidden animate-in slide-in-from-right duration-200`}
          >
            {/* Header with Tabs and Close Button */}
            <div className="h-[50px] border-b border-border flex items-center justify-between px-4 shrink-0">
              <div role="tablist" className="flex items-center gap-1 overflow-x-auto">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      role="tab"
                      aria-selected={isActive}
                      aria-label={tab.label}
                      onClick={() => setActiveTab(tab.id)}
                      className={`h-9 px-3 flex items-center gap-1.5 text-[13px] font-medium rounded-md transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-primary/15 text-primary font-semibold'
                          : 'text-text-muted hover:text-text hover:bg-surface-2'
                      }`}
                    >
                      <span className="shrink-0">{tab.icon}</span>
                      <span>{tab.label}</span>
                      {tab.badge !== undefined && (
                        <span
                          aria-live="polite"
                          className="text-[10px] font-mono px-1 rounded-full font-bold bg-surface-3 text-text-muted"
                        >
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                aria-label="Close panel"
                onClick={() => setIsDrawerOpen(false)}
                className="w-8 h-8 rounded-md flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-2 cursor-pointer shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col">
              {activeTab === 'inspector' && <Inspector />}
              {activeTab === 'issues' && <IssuesPanel />}
              {activeTab === 'code' && <CodePanel />}
              {activeTab === 'notes' && <NotesPanel />}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

export default RightPanel;
