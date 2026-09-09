import {
  ReactFlow,
  Background,

  BackgroundVariant,
  ConnectionMode,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Node,
  type Edge,
  type Connection,
} from '@xyflow/react';
import { useEffect, useCallback, useState } from 'react';
import { useDocumentSync } from '../../hooks/useDocumentSync';
import { useDragToCanvas } from '../../hooks/useDragToCanvas';
import { useAppStore } from '../../store';
import ZoomControls from './ZoomControls';
import ClassNode from './ClassNode';
import RelationshipEdge from './RelationshipEdge';
import EdgeMarkers from './edgeMarkers';
import PracticeBanner from './PracticeBanner';
import StickyNoteLayer from './StickyNoteLayer';
import InkLayer from './InkLayer';
import InkToolbar from './InkToolbar';

import { useBreakpoint } from '../../hooks/useMediaQuery';

const nodeTypes = {
  classNode: ClassNode,
  default: ClassNode,
};

const edgeTypes = {
  relationship: RelationshipEdge,
  default: RelationshipEdge,
};

function CanvasInternal() {
  const {
    activeDoc,
    rfNodes,
    rfEdges,
    onNodeDragStop,
    onMoveEnd,
  } = useDocumentSync();

  const practiceSession = useAppStore((state) => state.practiceSession);
  const needsFitView = useAppStore((state) => state.ui.needsFitView);
  const clearFitView = useAppStore((state) => state.clearFitView);
  const armedTool = useAppStore((state) => state.ui.armedTool);
  const setArmedTool = useAppStore((state) => state.setArmedTool);
  const setSelectedElement = useAppStore((state) => state.setSelectedElement);
  const setRightPanelTab = useAppStore((state) => state.setRightPanelTab);
  const createNode = useAppStore((state) => state.createNode);
  const createEdge = useAppStore((state) => state.createEdge);
  const addStickyNote = useAppStore((state) => state.addStickyNote);
  const { setViewport, screenToFlowPosition, fitView } = useReactFlow();

  const isReadOnly = Boolean(activeDoc?.readOnly);
  const { onDragOver, onDrop } = useDragToCanvas();
  const { isMobile, isCoarsePointer } = useBreakpoint();

  const [nodes, setNodes, onNodesChange] = useNodesState(rfNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(rfEdges);
  const [tapSourceNodeId, setTapSourceNodeId] = useState<string | null>(null);

  // Clear tap relationship source if tool is disarmed
  useEffect(() => {
    if (armedTool?.type !== 'relationship') {
      setTapSourceNodeId(null);
    }
  }, [armedTool]);

  // Click-to-place fallback per PRD §9.4b & Phase 9 Step 4
  const onPaneClick = useCallback(
    (event: React.MouseEvent) => {
      setTapSourceNodeId(null);
      if (armedTool?.type === 'kind' && !isReadOnly && activeDoc?.id) {
        const flowPos = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });
        createNode(activeDoc.id, armedTool.kind, {
          x: Math.round(flowPos.x - 100),
          y: Math.round(flowPos.y - 50),
        });
        setArmedTool(null);
      } else if (armedTool?.type === 'sticky' && !isReadOnly && activeDoc?.id) {
        const flowPos = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });
        addStickyNote(activeDoc.id, {
          x: Math.round(flowPos.x - 137),
          y: Math.round(flowPos.y - 100),
        });
        setArmedTool(null);
      } else {
        setSelectedElement(null);
      }
    },
    [armedTool, isReadOnly, activeDoc?.id, screenToFlowPosition, createNode, addStickyNote, setArmedTool, setSelectedElement]
  );

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      // Two-tap relationship drawing under coarse pointer / mobile (Phase 28 §3.3)
      if (armedTool?.type === 'relationship' && (isCoarsePointer || isMobile) && !isReadOnly) {
        if (!tapSourceNodeId) {
          setTapSourceNodeId(node.id);
          setSelectedElement({ type: 'node', id: node.id });
        } else if (tapSourceNodeId !== node.id && activeDoc?.id) {
          createEdge(activeDoc.id, tapSourceNodeId, node.id, armedTool.relType);
          setTapSourceNodeId(null);
        } else {
          setTapSourceNodeId(null);
        }
        return;
      }

      setSelectedElement({ type: 'node', id: node.id });
      setRightPanelTab('inspector');
    },
    [armedTool, isCoarsePointer, isMobile, isReadOnly, tapSourceNodeId, activeDoc?.id, createEdge, setSelectedElement, setRightPanelTab]
  );

  const onEdgeClick = useCallback(
    (_event: React.MouseEvent, edge: Edge) => {
      setSelectedElement({ type: 'edge', id: edge.id });
      setRightPanelTab('inspector');
    },
    [setSelectedElement, setRightPanelTab]
  );

  // Connect flow: on handle connect with armed tool (PRD §9.8, Phase 10)
  const onConnect = useCallback(
    (connection: Connection) => {
      if (isReadOnly || !activeDoc?.id) return;
      if (!connection.source || !connection.target) return;

      const relType =
        armedTool?.type === 'relationship' ? armedTool.relType : 'ASSOCIATE';

      createEdge(activeDoc.id, connection.source, connection.target, relType);
      // Armed tool persists after use per PRD §14-BR24
    },
    [isReadOnly, activeDoc?.id, armedTool, createEdge]
  );

  // Sync internal React Flow state when store nodes change
  useEffect(() => {
    setNodes(rfNodes);
  }, [rfNodes, setNodes]);

  // Sync internal React Flow state when store edges change
  useEffect(() => {
    setEdges(rfEdges);
  }, [rfEdges, setEdges]);

  // Restore viewport when switching documents (PRD §9.16)
  useEffect(() => {
    if (activeDoc?.viewport) {
      setViewport(activeDoc.viewport);
    }
  }, [activeDoc?.id, setViewport]);

  // Auto-fit viewport when requested (e.g. after loading reference solution)
  useEffect(() => {
    if (needsFitView) {
      const timer = setTimeout(() => {
        fitView({ padding: 0.25, duration: 300 });
        clearFitView();
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [needsFitView, fitView, clearFitView]);

  const isEmpty = (activeDoc?.nodes.length ?? 0) === 0 && !practiceSession;

  return (
    <div
      id="canvas-container"
      className="relative w-full h-full bg-canvas select-none"
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {/* Top Floating Practice HUD Banner */}
      <PracticeBanner />

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionMode={ConnectionMode.Loose}
        nodesDraggable={true}
        nodesConnectable={!isReadOnly}
        elementsSelectable={true}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={onNodeDragStop}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onConnect={onConnect}
        onPaneClick={onPaneClick}
        onMoveEnd={onMoveEnd}
        minZoom={0.1}
        maxZoom={2.5}
        defaultViewport={activeDoc?.viewport ?? { x: 0, y: 0, zoom: 1 }}
        proOptions={{ hideAttribution: true }}
      >
        <EdgeMarkers />
        <Background
          variant={BackgroundVariant.Dots}
          gap={16}
          size={1.5}
          color="var(--grid-dot)"
        />
        <StickyNoteLayer />
        <InkLayer />
        <ZoomControls />
      </ReactFlow>

      {/* Floating Ink Toolbar */}
      <InkToolbar />

      {/* Canvas Empty State (PRD §10.4) */}
      {isEmpty && (
        <div
          id="canvas-empty-state"
          className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 select-none pointer-events-none"
        >
          <p className="text-[17px] font-semibold text-text-muted mb-2">
            Canvas ready
          </p>
          <p className="text-[14px] text-text-faint max-w-md pointer-events-auto leading-relaxed">
            Drag a class from the left to start, or open the{' '}
            <button
              id="empty-state-problems-btn"
              type="button"
              onClick={() => {
                document.getElementById('header-btn-problems')?.click();
              }}
              className="text-primary hover:underline font-medium cursor-pointer"
            >
              LLD Problems
            </button>{' '}
            library to practise a classic design.
          </p>
        </div>
      )}
    </div>
  );
}

export function CanvasStage() {
  return <CanvasInternal />;
}


export default CanvasStage;
