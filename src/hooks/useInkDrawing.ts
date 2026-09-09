import { useState, useRef, useCallback } from 'react';
import { useReactFlow } from '@xyflow/react';
import { nanoid } from 'nanoid';
import { getStroke } from 'perfect-freehand';
import { useAppStore } from '../store';
import { useActiveDocument } from '../store/selectors';

const average = (a: number, b: number) => (a + b) / 2;

export function getSvgPathFromStroke(stroke: number[][], closed = true): string {
  const len = stroke.length;
  if (len < 4) {
    if (len === 0) return '';
    const p0 = stroke[0];
    if (p0 && len === 1) {
      const x = p0[0] ?? 0;
      const y = p0[1] ?? 0;
      return `M ${x} ${y} A 1 1 0 1 0 ${x + 0.1} ${y}`;
    }
    return `M ${stroke.map((p) => `${(p[0] ?? 0).toFixed(2)},${(p[1] ?? 0).toFixed(2)}`).join(' L ')} Z`;
  }

  let a = stroke[0] ?? [0, 0];
  let b = stroke[1] ?? [0, 0];
  const c = stroke[2] ?? [0, 0];

  let result = `M${(a[0] ?? 0).toFixed(2)},${(a[1] ?? 0).toFixed(2)} Q${(b[0] ?? 0).toFixed(
    2
  )},${(b[1] ?? 0).toFixed(2)} ${average(b[0] ?? 0, c[0] ?? 0).toFixed(2)},${average(
    b[1] ?? 0,
    c[1] ?? 0
  ).toFixed(2)} T`;

  for (let i = 2, max = len - 1; i < max; i++) {
    a = stroke[i] ?? [0, 0];
    b = stroke[i + 1] ?? [0, 0];
    result += `${average(a[0] ?? 0, b[0] ?? 0).toFixed(2)},${average(a[1] ?? 0, b[1] ?? 0).toFixed(
      2
    )} `;
  }

  if (closed) {
    result += 'Z';
  }

  return result;
}

export function renderStrokeToPath(
  points: Array<{ x: number; y: number; pressure?: number }>,
  width: number
): string {
  if (points.length === 0) return '';
  const strokePoints = points.map((p) => [p.x, p.y, p.pressure ?? 0.5]);
  const outline = getStroke(strokePoints, {
    size: Math.max(width * 2, 4),
    thinning: 0.5,
    smoothing: 0.5,
    streamline: 0.5,
  });
  return getSvgPathFromStroke(outline);
}

function isPointNearStroke(
  p: { x: number; y: number },
  points: Array<{ x: number; y: number }>,
  threshold: number
): boolean {
  if (points.length === 0) return false;
  const p0 = points[0];
  if (!p0) return false;
  if (points.length === 1) {
    return Math.hypot(p.x - p0.x, p.y - p0.y) <= threshold;
  }
  for (let i = 0; i < points.length - 1; i++) {
    const v = points[i];
    const w = points[i + 1];
    if (!v || !w) continue;
    const l2 = (v.x - w.x) ** 2 + (v.y - w.y) ** 2;
    let dist: number;
    if (l2 === 0) {
      dist = Math.hypot(p.x - v.x, p.y - v.y);
    } else {
      let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
      t = Math.max(0, Math.min(1, t));
      dist = Math.hypot(p.x - (v.x + t * (w.x - v.x)), p.y - (v.y + t * (w.y - v.y)));
    }
    if (dist <= threshold) return true;
  }
  return false;
}

export function useInkDrawing() {
  const { screenToFlowPosition } = useReactFlow();
  const activeDoc = useActiveDocument();
  const inkTool = useAppStore((state) => state.ui.inkTool);
  const inkColor = useAppStore((state) => state.ui.inkColor);
  const inkWidth = useAppStore((state) => state.ui.inkWidth);
  const addInkStroke = useAppStore((state) => state.addInkStroke);
  const removeInkStroke = useAppStore((state) => state.removeInkStroke);

  const [currentPoints, setCurrentPoints] = useState<
    Array<{ x: number; y: number; pressure?: number }>
  >([]);

  const isDrawingRef = useRef(false);
  const isErasingRef = useRef(false);
  const pointsRef = useRef<Array<{ x: number; y: number; pressure?: number }>>([]);

  const eraseAtPoint = useCallback(
    (flowPoint: { x: number; y: number }) => {
      if (!activeDoc || !activeDoc.inkStrokes) return;
      const strokesToErase = activeDoc.inkStrokes.filter((stroke) => {
        const threshold = Math.max(16, stroke.width * 2 + 10);
        return isPointNearStroke(flowPoint, stroke.points, threshold);
      });
      for (const stroke of strokesToErase) {
        removeInkStroke(stroke.id, activeDoc.id);
      }
    },
    [activeDoc, removeInkStroke]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!inkTool || activeDoc?.readOnly || e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();

      try {
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
      } catch {
        // Safe fallback
      }

      const flowPos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      const point = {
        x: Math.round(flowPos.x * 10) / 10,
        y: Math.round(flowPos.y * 10) / 10,
        pressure: e.pressure || 0.5,
      };

      if (inkTool === 'pen') {
        isDrawingRef.current = true;
        pointsRef.current = [point];
        setCurrentPoints([point]);
      } else if (inkTool === 'eraser') {
        isErasingRef.current = true;
        eraseAtPoint(point);
      }
    },
    [inkTool, activeDoc?.readOnly, screenToFlowPosition, eraseAtPoint]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!inkTool || activeDoc?.readOnly) return;

      if (inkTool === 'pen' && isDrawingRef.current) {
        e.preventDefault();
        e.stopPropagation();
        const flowPos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
        const point = {
          x: Math.round(flowPos.x * 10) / 10,
          y: Math.round(flowPos.y * 10) / 10,
          pressure: e.pressure || 0.5,
        };
        pointsRef.current.push(point);
        setCurrentPoints([...pointsRef.current]);
      } else if (inkTool === 'eraser' && isErasingRef.current) {
        e.preventDefault();
        e.stopPropagation();
        const flowPos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
        eraseAtPoint(flowPos);
      }
    },
    [inkTool, activeDoc?.readOnly, screenToFlowPosition, eraseAtPoint]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (inkTool === 'pen' && isDrawingRef.current) {
        e.preventDefault();
        e.stopPropagation();
        isDrawingRef.current = false;

        try {
          (e.target as HTMLElement).releasePointerCapture(e.pointerId);
        } catch {
          // Safe fallback
        }

        const pts = pointsRef.current;
        if (pts.length > 0 && activeDoc?.id) {
          const first = pts[0]!;
          const finalPoints =
            pts.length === 1
              ? [first, { x: first.x + 0.1, y: first.y + 0.1, pressure: first.pressure }]
              : pts;

          addInkStroke(
            {
              id: nanoid(),
              points: finalPoints,
              color: inkColor,
              width: inkWidth,
            },
            activeDoc.id
          );
        }
        pointsRef.current = [];
        setCurrentPoints([]);
      } else if (inkTool === 'eraser' && isErasingRef.current) {
        e.preventDefault();
        e.stopPropagation();
        isErasingRef.current = false;
        try {
          (e.target as HTMLElement).releasePointerCapture(e.pointerId);
        } catch {
          // Safe fallback
        }
      }
    },
    [inkTool, activeDoc?.id, addInkStroke, inkColor, inkWidth]
  );

  return {
    inkTool,
    inkColor,
    inkWidth,
    currentPoints,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  };
}

export default useInkDrawing;
