export interface ScoreDimensionBarProps {
  label: string;
  weight: number;
  score: number;
  contribution: number;
}

export function ScoreDimensionBar({
  label,
  weight,
  score,
  contribution,
}: ScoreDimensionBarProps) {
  const percentage = Math.max(0, Math.min(100, Math.round(score)));

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-[13px]">
        <span className="text-text font-medium">
          {label}{' '}
          <span className="text-text-muted text-[11px] font-mono">
            ({weight}%)
          </span>
        </span>
        <div className="flex items-center gap-2">
          <span className="font-mono text-text text-[13px] font-semibold">
            {contribution.toFixed(1)} / {weight}
          </span>
          <span className="text-text-muted text-[11px] font-mono">
            ({percentage}%)
          </span>
        </div>
      </div>

      <div className="w-full h-2.5 bg-surface-2 rounded-full overflow-hidden border border-border/50">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default ScoreDimensionBar;
