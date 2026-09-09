import { useMemo, useCallback } from 'react';
import { Node, Edge, Viewport } from '@xyflow/react';
import { useAppStore } from '../store';
import { ClassNode, Relationship } from '../domain/types';

export function useDocumentSync() {
  const activeDocumentId = useAppStore((state) => state.activeDocumentId);
  const activeDoc = useAppStore((state) =>
    state.documents.find((d) => d.id === state.activeDocumentId)
  );
  const updateNode = useAppStore((state) => state.updateNode);
  const updateDocument = useAppStore((state) => state.updateDocument);

  // Convert Domain ClassNodes to React Flow Nodes
  const rfNodes: Node[] = useMemo(() => {
    if (!activeDoc) return [];
    return activeDoc.nodes.map((node: ClassNode) => ({
      id: node.id,
      type: 'classNode',
      position: node.position,
      data: {
        node,
        kind: node.kind,
        name: node.name,
        generics: node.generics,
        attributes: node.attributes,
        methods: node.methods,
      },
    }));
  }, [activeDoc?.nodes]);

  // Convert Domain Relationships to React Flow Edges
  const rfEdges: Edge[] = useMemo(() => {
    if (!activeDoc) return [];
    return activeDoc.edges.map((edge: Relationship) => ({
      id: edge.id,
      source: edge.sourceId,
      target: edge.targetId,
      type: 'relationship',
      data: {
        type: edge.type,
        label: edge.label,
        sourceMultiplicity: edge.sourceMultiplicity,
        targetMultiplicity: edge.targetMultiplicity,
      },
    }));
  }, [activeDoc?.edges]);

  // When node finishes moving, write position back to store (PRD §10.4)
  const onNodeDragStop = useCallback(
    (_event: MouseEvent | TouchEvent, node: Node) => {
      if (!activeDocumentId) return;
      updateNode(node.id, { position: node.position }, activeDocumentId);
    },
    [activeDocumentId, updateNode]
  );

  // Persist viewport per document (PRD §9.16)
  const onMoveEnd = useCallback(
    (_event: unknown, viewport: Viewport) => {
      if (!activeDocumentId) return;
      updateDocument(activeDocumentId, { viewport });
    },
    [activeDocumentId, updateDocument]
  );

  return {
    activeDoc,
    activeDocumentId,
    rfNodes,
    rfEdges,
    onNodeDragStop,
    onMoveEnd,
  };
}
