export function EdgeMarkers() {
  return (
    <svg style={{ position: 'absolute', top: 0, left: 0, width: 0, height: 0, pointerEvents: 'none' }}>
      <defs>
        {/* Hollow Triangle (Inherit / Realize) - Target */}
        <marker
          id="marker-hollow-triangle"
          viewBox="0 0 14 14"
          refX="12"
          refY="7"
          markerWidth="12"
          markerHeight="12"
          orient="auto-start-reverse"
        >
          <polygon
            points="1,1 13,7 1,13"
            fill="var(--canvas)"
            stroke="var(--border-strong)"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </marker>
        <marker
          id="marker-hollow-triangle-selected"
          viewBox="0 0 14 14"
          refX="12"
          refY="7"
          markerWidth="12"
          markerHeight="12"
          orient="auto-start-reverse"
        >
          <polygon
            points="1,1 13,7 1,13"
            fill="var(--canvas)"
            stroke="var(--primary)"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </marker>

        {/* Filled Diamond (Compose) - Source */}
        <marker
          id="marker-filled-diamond"
          viewBox="0 0 16 16"
          refX="3"
          refY="8"
          markerWidth="14"
          markerHeight="14"
          orient="auto"
        >
          <polygon
            points="8,1 15,8 8,15 1,8"
            fill="var(--border-strong)"
            stroke="var(--border-strong)"
            strokeWidth="1"
          />
        </marker>
        <marker
          id="marker-filled-diamond-selected"
          viewBox="0 0 16 16"
          refX="3"
          refY="8"
          markerWidth="14"
          markerHeight="14"
          orient="auto"
        >
          <polygon
            points="8,1 15,8 8,15 1,8"
            fill="var(--primary)"
            stroke="var(--primary)"
            strokeWidth="1"
          />
        </marker>

        {/* Hollow Diamond (Aggregate) - Source */}
        <marker
          id="marker-hollow-diamond"
          viewBox="0 0 16 16"
          refX="3"
          refY="8"
          markerWidth="14"
          markerHeight="14"
          orient="auto"
        >
          <polygon
            points="8,1 15,8 8,15 1,8"
            fill="var(--canvas)"
            stroke="var(--border-strong)"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </marker>
        <marker
          id="marker-hollow-diamond-selected"
          viewBox="0 0 16 16"
          refX="3"
          refY="8"
          markerWidth="14"
          markerHeight="14"
          orient="auto"
        >
          <polygon
            points="8,1 15,8 8,15 1,8"
            fill="var(--canvas)"
            stroke="var(--primary)"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </marker>

        {/* Open Arrow (Associate / Depend) - Target */}
        <marker
          id="marker-open-arrow"
          viewBox="0 0 14 14"
          refX="11"
          refY="7"
          markerWidth="11"
          markerHeight="11"
          orient="auto-start-reverse"
        >
          <polyline
            points="2,2 11,7 2,12"
            fill="none"
            stroke="var(--border-strong)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </marker>
        <marker
          id="marker-open-arrow-selected"
          viewBox="0 0 14 14"
          refX="11"
          refY="7"
          markerWidth="11"
          markerHeight="11"
          orient="auto-start-reverse"
        >
          <polyline
            points="2,2 11,7 2,12"
            fill="none"
            stroke="var(--primary)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </marker>
      </defs>
    </svg>
  );
}

export default EdgeMarkers;
