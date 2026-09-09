import { getProblems } from '../../domain/problems';
import { useAppStore } from '../../store';

interface LibraryTeaserSectionProps {
  onLaunch: () => void;
}

const DIFFICULTY_STYLE: Record<string, { bg: string; text: string }> = {
  EASY: { bg: 'rgba(52,211,153,0.12)', text: '#34D399' },
  MEDIUM: { bg: 'rgba(245,158,11,0.12)', text: '#F59E0B' },
  HARD: { bg: 'rgba(239,68,68,0.12)', text: '#EF4444' },
};

/**
 * Problem library teaser — cards use data-library-card for GSAP stagger
 * entrance, and inline styles to stay within static Tailwind class rules.
 */
export function LibraryTeaserSection({ onLaunch }: LibraryTeaserSectionProps) {
  const problems = getProblems();

  const handleSelect = (problemId: string) => {
    useAppStore.getState().startPractice(problemId);
    onLaunch();
  };

  return (
    <section className="px-6 py-24 max-w-6xl mx-auto">
      <div data-reveal className="text-center mb-12">
        <p className="text-[11px] font-semibold tracking-[0.18em] text-primary uppercase mb-3">
          Problem Library
        </p>
        <h2
          data-section-heading
          className="text-[32px] font-bold text-text mb-3 tracking-tight"
          style={{ clipPath: 'inset(0 100% 0 0)' }}
        >
          Pick a problem, start practicing
        </h2>
        <p className="text-[15px] text-text-muted">
          {problems.length} curated low-level-design interview problems, and growing.
        </p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 snap-x">
        {problems.map((p) => {
          const diffStyle = DIFFICULTY_STYLE[p.difficulty] ?? DIFFICULTY_STYLE['MEDIUM']!;
          return (
            <button
              key={p.id}
              type="button"
              data-library-card
              data-testid={`home-library-tile-${p.id}`}
              onClick={() => handleSelect(p.id)}
              className="shrink-0 w-[220px] snap-start text-left rounded-[14px] p-5 cursor-pointer"
              style={{
                background: 'var(--surface-3)',
                border: '1px solid var(--border)',
                opacity: 0,
                willChange: 'transform',
              }}
            >
              <span
                className="inline-block rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest mb-3"
                style={{ background: diffStyle.bg, color: diffStyle.text }}
              >
                {p.difficulty}
              </span>
              <h4 className="text-[14px] font-semibold text-text mb-1.5 leading-tight">{p.title}</h4>
              <p className="text-[12px] text-text-muted line-clamp-2 leading-relaxed">{p.description}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default LibraryTeaserSection;
