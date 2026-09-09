import { getProblems } from '../../domain/problems';

/**
 * Stats strip with data-stat-num attributes so useHomeMotion can run
 * a count-up animation on each number when it scrolls into view.
 * Also acts as a marquee strip via [data-marquee-inner] animation.
 */
export function StatsStripSection() {
  const problemCount = getProblems().length;

  const STATS = [
    { value: problemCount, label: 'curated problems' },
    { value: 6, label: 'languages compiled' },
    { value: 4, label: 'feedback lenses' },
    { value: 100, label: '% local — no server' },
  ];

  // Duplicate for seamless marquee loop
  const items = [...STATS, ...STATS];

  return (
    <section
      data-reveal
      className="relative py-14 border-y border-border overflow-hidden"
      style={{ background: 'var(--surface-1)' }}
    >
      {/* Subtle gradient fade on edges */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-24 z-10"
        style={{ background: 'linear-gradient(to right, var(--surface-1), transparent)' }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-24 z-10"
        style={{ background: 'linear-gradient(to left, var(--surface-1), transparent)' }}
        aria-hidden="true"
      />

      {/* Marquee container */}
      <div className="overflow-hidden">
        <div data-marquee-inner className="flex gap-0 whitespace-nowrap" style={{ width: 'max-content' }}>
          {items.map((stat, i) => (
            <div
              key={i}
              className="flex items-center gap-10 px-10 font-mono text-[14px] text-text-muted"
            >
              <span className="flex items-baseline gap-1.5">
                <span
                  data-stat-num
                  className="text-[22px] font-bold text-text tabular-nums"
                >
                  {stat.value}
                </span>
                <span>{stat.label}</span>
              </span>
              <span className="text-border-strong text-[18px]">·</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default StatsStripSection;
