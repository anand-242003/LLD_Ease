import Logo from '../ui/Logo';

interface HomeFooterProps {
  onLaunch: () => void;
}

export function HomeFooter({ onLaunch }: HomeFooterProps) {
  return (
    <footer
      data-reveal
      className="relative px-6 py-28 flex flex-col items-center gap-8 text-center overflow-hidden"
    >
      {/* Glow backdrop */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: 'radial-gradient(ellipse 60% 40% at 50% 100%, rgba(34,199,199,0.07), transparent)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Label */}
        <p className="text-[11px] font-semibold tracking-[0.18em] text-primary uppercase">
          Get started
        </p>

        {/* Headline */}
        <h2 className="text-[32px] sm:text-[42px] font-bold text-text tracking-tight max-w-xl leading-tight">
          Ready to level up your{' '}
          <span
            className="text-transparent"
            style={{
              backgroundImage: 'linear-gradient(135deg, #22C7C7, #7DD3FC)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
            }}
          >
            LLD skills?
          </span>
        </h2>

        {/* CTA — magnetic effect applied by useHomeMotion */}
        <button
          type="button"
          id="home-cta-launch-footer"
          data-testid="home-cta-launch-footer"
          onClick={onLaunch}
          className="group relative h-[54px] px-10 rounded-[14px] text-primary-fg text-[15px] font-semibold cursor-pointer overflow-hidden shadow-lg"
          style={{
            background: 'linear-gradient(135deg, var(--primary), #7DD3FC)',
            willChange: 'transform',
          }}
        >
          {/* Shimmer */}
          <span
            className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out pointer-events-none"
            style={{
              background:
                'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.22) 50%, transparent 60%)',
            }}
            aria-hidden="true"
          />
          Launch LLDSIM — it's free
        </button>

        {/* Brand mark */}
        <div className="flex items-center gap-2 text-[13px] font-semibold text-text-muted mt-2">
          <Logo size={24} variant="badge" />
          <span>LLDSIM</span>
        </div>

        <p className="text-[12px] text-text-faint max-w-sm leading-relaxed">
          No account, no signup, no server. Everything you build stays in your browser.
        </p>
      </div>
    </footer>
  );
}

export default HomeFooter;
