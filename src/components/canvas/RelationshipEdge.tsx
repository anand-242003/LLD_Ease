import { memo } from 'react';
import {
  EdgeProps,
  getBezierPath,
  EdgeLabelRenderer,
  BaseEdge,
} from '@xyflow/react';
import { RelationshipType } from '../../domain/types';
import { useAppStore } from '../../store';

export interface RelationshipEdgeData {
  type?: RelationshipType;
  label?: string;
  sourceMultiplicity?: string;
  targetMultiplicity?: string;
  [key: string]: unknown;
}

interface EdgeDecoration {
  dashed: boolean;
  markerStart?: string;
  markerEnd?: string;
}

function getEdgeDecoration(
  type: RelationshipType = 'ASSOCIATE',
  selected = false
): EdgeDecoration {
  const suffix = selected ? '-selected' : '';

  switch (type) {
    case 'INHERIT':
      return {
        dashed: false,
        markerEnd: `url(#marker-hollow-triangle${suffix})`,
      };
    case 'REALIZE':
      return {
        dashed: true,
        markerEnd: `url(#marker-hollow-triangle${suffix})`,
      };
    case 'COMPOSE':
      return {
        dashed: false,
        markerStart: `url(#marker-filled-diamond${suffix})`,
      };
    case 'AGGREGATE':
      return {
        dashed: false,
        markerStart: `url(#marker-hollow-diamond${suffix})`,
      };
    case 'DEPEND':
      return {
        dashed: true,
        markerEnd: `url(#marker-open-arrow${suffix})`,
      };
    case 'ASSOCIATE':
    default:
      return {
        dashed: false,
        markerEnd: `url(#marker-open-arrow${suffix})`,
      };
  }
}

export const RelationshipEdge = memo(function RelationshipEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
  data,
}: EdgeProps) {
  const edgeData = (data ?? {}) as RelationshipEdgeData;
  const type: RelationshipType = edgeData.type ?? 'ASSOCIATE';
  const label = edgeData.label;
  const sourceMultiplicity = edgeData.sourceMultiplicity;
  const targetMultiplicity = edgeData.targetMultiplicity;

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.25, // Straight with slight gentle curve per DESIGN.md §5.11
  });

  const { dashed, markerStart, markerEnd } = getEdgeDecoration(type, selected);

  // Endpoint offsets for multiplicity placement (PRD §11.2)
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const len = Math.max(Math.hypot(dx, dy), 1);
  const uX = dx / len;
  const uY = dy / len;
  // Perpendicular offset so text sits above the line
  const pX = -uY * 12;
  const pY = uX * 12;

  const sourceMultX = sourceX + uX * 28 + pX;
  const sourceMultY = sourceY + uY * 28 + pY;

  const targetMultX = targetX - uX * 28 + pX;
  const targetMultY = targetY - uY * 28 + pY;

  const setSelectedElement = useAppStore((state) => state.setSelectedElement);
  const setRightPanelTab = useAppStore((state) => state.setRightPanelTab);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedElement({ type: 'edge', id });
    setRightPanelTab('inspector');
  };

  return (
    <>
      {/* 12px invisible hit area for easy selection per DESIGN.md §5.11 */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={12}
        className="cursor-pointer"
        onClick={handleClick}
      />

      {/* Styled visible edge */}
      <BaseEdge
        id={id}
        path={edgePath}
        markerStart={markerStart}
        markerEnd={markerEnd}
        style={{
          stroke: selected ? 'var(--primary)' : 'var(--border-strong)',
          strokeWidth: selected ? 2 : 1.5,
          strokeDasharray: dashed ? '6 4' : undefined,
        }}
      />

      <EdgeLabelRenderer>
        {/* Label Chip at Midpoint (DESIGN.md §5.11) */}
        {label && (
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'none',
            }}
            className="bg-surface-2 border border-border rounded-[var(--r-sm)] px-1.5 py-0.5 font-mono text-[11px] text-text select-none z-10"
            data-testid={`edge-label-${id}`}
          >
            {label}
          </div>
        )}

        {/* Multiplicities (near endpoints per PRD §11.2) */}
        {sourceMultiplicity && (
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${sourceMultX}px, ${sourceMultY}px)`,
              pointerEvents: 'none',
            }}
            className="font-mono text-[11px] text-text-muted select-none z-10"
            data-testid={`edge-src-mult-${id}`}
          >
            {sourceMultiplicity}
          </div>
        )}

        {targetMultiplicity && (
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${targetMultX}px, ${targetMultY}px)`,
              pointerEvents: 'none',
            }}
            className="font-mono text-[11px] text-text-muted select-none z-10"
            data-testid={`edge-tgt-mult-${id}`}
          >
            {targetMultiplicity}
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  );
});

export default RelationshipEdge;
