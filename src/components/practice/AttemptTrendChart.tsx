import { Attempt } from '../../domain/practice/attempts';

interface AttemptTrendChartProps {
  attempts: Attempt[]; // Chronologically sorted or raw (will be sorted oldest-to-newest internally)
}

export function AttemptTrendChart({ attempts }: AttemptTrendChartProps) {
  // Sort oldest first for progression left-to-right
  const sorted = [...attempts].sort(
    (a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
  );

  if (sorted.length < 2) {
    return null;
  }

  const width = 460;
  const height = 120;
  const padLeft = 36;
  const padRight = 24;
  const padTop = 16;
  const padBottom = 24;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const points = sorted.map((att, i) => {
    const x = padLeft + (i / (sorted.length - 1)) * chartW;
    const y = padTop + chartH - (att.score / 100) * chartH;
    return { x, y, score: att.score, attemptNum: i + 1 };
  });

  const pathD = points.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
  }, '');

  // Fill area under curve
  const firstPt = points[0];
  const lastPt = points[points.length - 1];
  if (!firstPt || !lastPt) return null;
  const fillAreaD = `${pathD} L ${lastPt.x},${padTop + chartH} L ${firstPt.x},${padTop + chartH} Z`;

  return (
    <div className="w-full bg-surface-2 border border-border rounded-[10px] p-3 flex flex-col gap-2 select-none">
      <div className="flex items-center justify-between text-[11px] font-semibold text-text-muted tracking-wider uppercase px-1">
        <span>Score Progression</span>
        <span className="text-primary font-mono lowercase">
          {sorted.length} attempts
        </span>
      </div>

      <div className="w-full overflow-x-auto flex justify-center">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full max-w-[480px] h-[120px] overflow-visible"
          role="img"
          aria-label="Score trend chart"
        >
          {/* Grid lines: 0, 50, 100 */}
          {[0, 50, 100].map((scoreVal) => {
            const y = padTop + chartH - (scoreVal / 100) * chartH;
            return (
              <g key={scoreVal}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke="var(--border)"
                  strokeDasharray="3,3"
                  strokeWidth="1"
                />
                <text
                  x={padLeft - 6}
                  y={y + 3.5}
                  textAnchor="end"
                  fontSize="10"
                  fontFamily="var(--font-mono)"
                  fill="var(--text-faint)"
                >
                  {scoreVal}
                </text>
              </g>
            );
          })}

          {/* Area fill */}
          <path d={fillAreaD} fill="var(--primary)" fillOpacity="0.08" />

          {/* Trend line */}
          <path
            d={pathD}
            fill="none"
            stroke="var(--primary)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Dots on data points */}
          {points.map((pt, i) => {
            const isLast = i === points.length - 1;
            return (
              <g key={i} className="group">
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isLast ? 4.5 : 3.5}
                  fill={isLast ? 'var(--primary)' : 'var(--surface-1)'}
                  stroke="var(--primary)"
                  strokeWidth="2"
                />
                {/* Score label above point */}
                <text
                  x={pt.x}
                  y={pt.y - 7}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="600"
                  fontFamily="var(--font-mono)"
                  fill={isLast ? 'var(--primary)' : 'var(--text-muted)'}
                >
                  {pt.score}
                </text>
                {/* Attempt number below x-axis */}
                <text
                  x={pt.x}
                  y={height - 6}
                  textAnchor="middle"
                  fontSize="10"
                  fontFamily="var(--font-mono)"
                  fill="var(--text-faint)"
                >
                  #{pt.attemptNum}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

export default AttemptTrendChart;
