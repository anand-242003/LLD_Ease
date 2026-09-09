import { useAppStore } from '../../store';
import NodeInspector from './NodeInspector';
import EdgeInspector from './EdgeInspector';

export function Inspector() {
  const selectedElement = useAppStore((state) => state.ui.selectedElement);
  const activeDoc = useAppStore((state) =>
    state.documents.find((d) => d.id === state.activeDocumentId)
  );

  if (selectedElement?.type === 'node' && activeDoc) {
    const selectedNode = activeDoc.nodes.find((n) => n.id === selectedElement.id);
    if (selectedNode) {
      return (
        <div className="flex-1 overflow-y-auto pr-1">
          <NodeInspector
            node={selectedNode}
            isReadOnly={Boolean(activeDoc.readOnly)}
          />
        </div>
      );
    }
  }

  if (selectedElement?.type === 'edge' && activeDoc) {
    const selectedEdge = activeDoc.edges.find((e) => e.id === selectedElement.id);
    if (selectedEdge) {
      return (
        <div className="flex-1 overflow-y-auto pr-1">
          <EdgeInspector
            edge={selectedEdge}
            isReadOnly={Boolean(activeDoc.readOnly)}
          />
        </div>
      );
    }
  }

  // Exact empty state per PRD.md §10.5.1
  return (
    <div
      className="flex-1 flex flex-col items-center justify-center text-center p-6 select-none"
      data-testid="inspector-empty-state"
    >
      <p className="text-[15px] font-medium text-text mb-1.5">
        Select a class or arrow to edit it.
      </p>
      <p className="text-[14px] text-text-muted max-w-xs">
        Drag a kind from the left palette to add one.
      </p>
    </div>
  );
}

export default Inspector;
