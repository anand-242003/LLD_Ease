import { useCallback } from 'react';
import { useReactFlow } from '@xyflow/react';
import { useAppStore } from '../store';
import { ClassKind } from '../domain/types';

export function useDragToCanvas() {
  const { screenToFlowPosition } = useReactFlow();
  const activeDocumentId = useAppStore((state) => state.activeDocumentId);
  const isReadOnly = useAppStore((state) =>
    Boolean(state.documents.find((d) => d.id === state.activeDocumentId)?.readOnly)
  );
  const createNode = useAppStore((state) => state.createNode);
  const addStickyNote = useAppStore((state) => state.addStickyNote);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      if (isReadOnly || !activeDocumentId) return;

      const rawType = event.dataTransfer.getData('application/reactflow/type');
      if (rawType === 'sticky') {
        const flowPos = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });
        const centredPosition = {
          x: Math.round(flowPos.x - 137),
          y: Math.round(flowPos.y - 100),
        };
        addStickyNote(activeDocumentId, centredPosition);
        return;
      }

      const rawKind = event.dataTransfer.getData('application/reactflow/kind');
      if (!rawKind) return;

      const kind = rawKind.toUpperCase() as ClassKind;
      const validKinds: ClassKind[] = ['CLASS', 'ABSTRACT', 'INTERFACE', 'ENUM', 'RECORD'];
      if (!validKinds.includes(kind)) return;

      // Project client drop coordinates into React Flow coordinate space
      const flowPos = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // Centre node (min-width is 200px, estimated initial height ~100px)
      const centredPosition = {
        x: Math.round(flowPos.x - 100),
        y: Math.round(flowPos.y - 50),
      };

      createNode(activeDocumentId, kind, centredPosition);
    },
    [activeDocumentId, createNode, addStickyNote, isReadOnly, screenToFlowPosition]
  );

  return {
    onDragOver,
    onDrop,
  };
}

export default useDragToCanvas;
