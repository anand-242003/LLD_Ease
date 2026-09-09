import { ViewportPortal } from '@xyflow/react';
import { useActiveDocument } from '../../store/selectors';
import { useInkDrawing, renderStrokeToPath } from '../../hooks/useInkDrawing';

export function InkLayer() {
  const activeDoc = useActiveDocument();
  const {
    inkTool,
    inkColor,
    inkWidth,
    currentPoints,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  } = useInkDrawing();

  const isArmed = Boolean(inkTool && !activeDoc?.readOnly);

  return (
    <div
      id="ink-layer"
      data-testid="ink-layer"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className="absolute inset-0 select-none"
      style={{
        pointerEvents: isArmed ? 'auto' : 'none',
        zIndex: isArmed ? 35 : 25,
        cursor: isArmed
          ? inkTool === 'pen'
            ? 'crosshair'
            : 'cell'
          : 'default',
        touchAction: 'none',
      }}
    >
      {/* SVG strokes rendered inside ViewportPortal so they scale/pan in lockstep with class nodes */}
      <ViewportPortal>
        <svg
          id="ink-strokes-svg"
          data-testid="ink-strokes-svg"
          className="pointer-events-none absolute inset-0 overflow-visible z-25"
          style={{ width: '100%', height: '100%' }}
        >
          {/* Committed strokes */}
          {activeDoc?.inkStrokes?.map((stroke) => {
            const pathData = renderStrokeToPath(stroke.points, stroke.width);
            return (
              <path
                key={stroke.id}
                d={pathData}
                fill={stroke.color}
                opacity={0.95}
              />
            );
          })}

          {/* Active drawing stroke */}
          {currentPoints.length > 0 && (
            <path
              d={renderStrokeToPath(currentPoints, inkWidth)}
              fill={inkColor}
              opacity={0.95}
            />
          )}
        </svg>
      </ViewportPortal>
    </div>
  );
}

export default InkLayer;
