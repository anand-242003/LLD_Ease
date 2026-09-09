import { useAppStore } from '../../store';
import DocumentTab from './DocumentTab';

export function DocumentTabBar() {
  const documents = useAppStore((state) => state.documents);
  const activeDocumentId = useAppStore((state) => state.activeDocumentId);

  return (
    <div
      id="document-tab-bar"
      className="h-[44px] bg-surface-1 border-b border-border px-4 flex items-center gap-2 select-none shrink-0 overflow-x-auto"
      role="tablist"
      aria-label="Document tabs"
    >
      {documents.map((doc) => (
        <DocumentTab
          key={doc.id}
          document={doc}
          isActive={doc.id === activeDocumentId}
        />
      ))}
    </div>
  );
}

export default DocumentTabBar;
