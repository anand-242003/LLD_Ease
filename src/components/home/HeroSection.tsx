import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface HeroSectionProps {
  onLaunch: () => void;
}

export function HeroSection({ onLaunch }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const diagramRef = useRef<HTMLDivElement>(null);

  // ── Micro-interactive diagram animations ─────────────────────────────────
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      // ── 1. Headline word-by-word reveal with stagger ─────────────────────
      const headline = headlineRef.current;
      if (headline) {
        const words = headline.querySelectorAll<HTMLSpanElement>('[data-word]');
        gsap.fromTo(
          words,
          { autoAlpha: 0, y: 48, rotationX: -30, transformOrigin: 'center bottom' },
          {
            autoAlpha: 1,
            y: 0,
            rotationX: 0,
            duration: 0.85,
            stagger: { each: 0.12, ease: 'power2.out' },
            ease: 'power3.out',
            delay: 0.4,
          }
        );
      }

      // ── 2. Badge, subtext, CTA staggered reveal ───────────────────────────
      gsap.fromTo(
        '[data-hero-badge]',
        { autoAlpha: 0, y: -16 },
        { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power2.out', delay: 0.15 }
      );
      gsap.fromTo(
        '[data-hero-sub]',
        { autoAlpha: 0, y: 24 },
        { autoAlpha: 1, y: 0, duration: 0.75, ease: 'power3.out', delay: 0.9 }
      );
      gsap.fromTo(
        '[data-hero-cta]',
        { autoAlpha: 0, y: 18, scale: 0.94 },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          stagger: 0.1,
          ease: 'back.out(1.5)',
          delay: 1.1,
        }
      );

      // ── 3. Status badge floating loop ─────────────────────────────────────
      gsap.to('[data-hero-status]', {
        y: -5,
        duration: 2.2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 1.8,
      });

      if (prefersReducedMotion) return;

      // ── 4. Diagram: nodes pop in via timeline ─────────────────────────────
      const nodes = section.querySelectorAll<HTMLElement>('[data-hero-node]');
      const edge = section.querySelector<SVGPathElement>('[data-hero-edge]');
      const dots = section.querySelectorAll<SVGCircleElement>('[data-edge-dot]');

      const tl = gsap.timeline({ delay: 0.5 });

      tl.fromTo(
        nodes,
        { autoAlpha: 0, scale: 0.78, y: 18 },
        {
          autoAlpha: 1,
          scale: 1,
          y: 0,
          duration: 0.65,
          stagger: { each: 0.18, from: 'center' },
          ease: 'back.out(2)',
        }
      );

      // Draw edge path after nodes appear
      if (edge) {
        const len = edge.getTotalLength();
        gsap.set(edge, { strokeDasharray: len, strokeDashoffset: len });
        tl.to(
          edge,
          { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut' },
          '-=0.15'
        );
      }

      // Traveling dots along edge
      if (dots.length > 0 && edge) {
        const len = edge.getTotalLength();
        dots.forEach((dot, i) => {
          gsap.fromTo(
            dot,
            { autoAlpha: 0 },
            {
              autoAlpha: 1,
              duration: 0.3,
              delay: 1.6 + i * 0.5,
              onComplete: () => {
                // Animate dot along path continuously
                gsap.to({ progress: 0 }, {
                  progress: 1,
                  duration: 3.5,
                  repeat: -1,
                  ease: 'none',
                  delay: i * 0.5,
                  onUpdate: function () {
                    const p = this.targets()[0] as { progress: number };
                    const pt = edge.getPointAtLength(p.progress * len);
                    gsap.set(dot, { attr: { cx: pt.x, cy: pt.y } });
                  },
                });
              },
            }
          );
        });
      }

      // ── 5. Ambient orb parallax on mousemove ─────────────────────────────
      const orbs = section.querySelectorAll<HTMLElement>('[data-orb]');
      const handleMouseMove = (e: MouseEvent) => {
        const rect = section.getBoundingClientRect();
        const nx = (e.clientX - rect.left) / rect.width - 0.5;
        const ny = (e.clientY - rect.top) / rect.height - 0.5;
        orbs.forEach((orb, i) => {
          const factor = i === 0 ? 38 : 22;
          gsap.to(orb, {
            x: nx * factor,
            y: ny * factor,
            duration: 1.6,
            ease: 'power2.out',
            overwrite: 'auto',
          });
        });
      };
      section.addEventListener('mousemove', handleMouseMove);

      // ── 6. Node micro-interactions: hover scale + glow ────────────────────
      nodes.forEach((node) => {
        const header = node.querySelector<HTMLElement>('[data-node-header]');

        const enterHandler = () => {
          gsap.to(node, {
            scale: 1.05,
            y: -4,
            boxShadow: '0 0 24px 4px rgba(34,199,199,0.25)',
            duration: 0.32,
            ease: 'power2.out',
            overwrite: 'auto',
          });
          if (header) {
            gsap.to(header, { backgroundColor: 'rgba(34,199,199,0.15)', duration: 0.25 });
          }
        };
        const leaveHandler = () => {
          gsap.to(node, {
            scale: 1,
            y: 0,
            boxShadow: 'none',
            duration: 0.45,
            ease: 'power3.out',
            overwrite: 'auto',
          });
          if (header) {
            gsap.to(header, { backgroundColor: '', duration: 0.35 });
          }
        };

        node.addEventListener('mouseenter', enterHandler);
        node.addEventListener('mouseleave', leaveHandler);
        // store for cleanup
        (node as HTMLElement & { _cleanup?: () => void })._cleanup = () => {
          node.removeEventListener('mouseenter', enterHandler);
          node.removeEventListener('mouseleave', leaveHandler);
        };
      });

      return () => {
        section.removeEventListener('mousemove', handleMouseMove);
        nodes.forEach((n) => (n as HTMLElement & { _cleanup?: () => void })._cleanup?.());
      };
    }, section);

    return () => ctx.revert();
  }, []);

  const handleScrollToHowItWorks = () => {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex flex-col items-center justify-center px-6 py-24 text-center overflow-hidden"
    >
      {/* ── Noise grain texture overlay ────────────────────────────────────── */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.035'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px 128px',
          opacity: 0.6,
        }}
        aria-hidden="true"
      />

      {/* ── Ambient glow orbs ──────────────────────────────────────────────── */}
      <div
        data-orb
        className="pointer-events-none absolute top-[15%] left-[10%] w-[520px] h-[520px] rounded-full z-0"
        style={{
          background: 'radial-gradient(circle, rgba(34,199,199,0.07) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
        aria-hidden="true"
      />
      <div
        data-orb
        className="pointer-events-none absolute bottom-[10%] right-[8%] w-[400px] h-[400px] rounded-full z-0"
        style={{
          background: 'radial-gradient(circle, rgba(125,211,252,0.05) 0%, transparent 70%)',
          filter: 'blur(50px)',
        }}
        aria-hidden="true"
      />

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-5xl">

        {/* Badge row */}
        <div data-hero-badge className="flex items-center gap-3 mb-8" style={{ opacity: 0 }}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center shadow-lg">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#04292B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="6" cy="6" r="3" fill="#04292B" />
              <circle cx="18" cy="8" r="3" fill="#04292B" />
              <circle cx="12" cy="18" r="3" fill="#04292B" />
              <line x1="8.5" y1="7" x2="15.5" y2="7.5" />
              <line x1="7.5" y1="8.5" x2="10.5" y2="15.5" />
              <line x1="16.5" y1="10.5" x2="13.5" y2="15.5" />
            </svg>
          </div>
          <span className="text-[12px] font-semibold tracking-[0.14em] text-text-muted uppercase">
            LLDSIM · LLD Studio
          </span>
          {/* Live status pill */}
          <span
            data-hero-status
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-primary/30 bg-primary/8 text-[11px] font-semibold text-primary tracking-wide"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Live
          </span>
        </div>

        {/* Headline */}
        <h1
          ref={headlineRef}
          className="text-[44px] sm:text-[68px] font-bold tracking-tight leading-[1.03] max-w-4xl mb-6"
          style={{ perspective: '600px' }}
        >
          {['Model', 'it.'].map((w, i) => (
            <span key={i} data-word className="inline-block mr-[0.25em]" style={{ opacity: 0 }}>
              {w}
            </span>
          ))}
          {['Lint', 'it.'].map((w, i) => (
            <span key={i + 2} data-word className="inline-block mr-[0.25em]" style={{ opacity: 0 }}>
              {w}
            </span>
          ))}
          <span
            data-word
            className="inline-block text-transparent mr-[0.05em]"
            style={{
              backgroundImage: 'linear-gradient(135deg, #22C7C7, #7DD3FC, #22C7C7)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              backgroundSize: '200% auto',
              opacity: 0,
            }}
          >
            Get
          </span>
          <span data-word className="inline-block text-transparent" style={{
            backgroundImage: 'linear-gradient(135deg, #22C7C7, #7DD3FC, #22C7C7)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            backgroundSize: '200% auto',
            opacity: 0,
          }}>
            graded.
          </span>
        </h1>

        {/* Sub-text */}
        <p
          data-hero-sub
          className="text-[17px] sm:text-[19px] text-text-muted max-w-2xl leading-relaxed mb-10"
          style={{ opacity: 0 }}
        >
          A UML diagram editor purpose-built for practicing low-level design interviews — one that
          validates your model, compiles it to real code, and scores it against a verified solution.{' '}
          <span className="text-text font-medium">Not just a whiteboard.</span>
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mb-20">
          <button
            data-hero-cta
            type="button"
            id="home-cta-launch"
            data-testid="home-cta-launch"
            onClick={onLaunch}
            style={{ opacity: 0 }}
            className="group relative h-[50px] px-8 rounded-[12px] bg-primary text-primary-fg text-[15px] font-semibold cursor-pointer overflow-hidden transition-transform hover:scale-[1.03] active:scale-[0.97]"
          >
            {/* Shimmer on hover */}
            <span
              className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"
              style={{
                background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%)',
              }}
              aria-hidden="true"
            />
            Launch LLDSIM
          </button>
          <button
            data-hero-cta
            type="button"
            onClick={handleScrollToHowItWorks}
            style={{ opacity: 0 }}
            className="flex items-center gap-1.5 text-[14px] text-text-muted hover:text-primary transition-colors bg-transparent border-none cursor-pointer group"
          >
            See how it works
            <span className="group-hover:translate-y-0.5 transition-transform duration-200 inline-block">↓</span>
          </button>
        </div>

        {/* ── Interactive UML Diagram ──────────────────────────────────────── */}
        <div
          ref={diagramRef}
          className="relative w-full max-w-[560px] h-[260px] select-none"
          aria-hidden="true"
        >
          {/* Edge SVG */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 560 260"
          >
            <defs>
              <linearGradient id="edge-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#7DD3FC" stopOpacity="0.6" />
              </linearGradient>
              {/* Glow filter for edge */}
              <filter id="edge-glow">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Background ghost path for depth */}
            <path
              d="M 130 65 L 430 65 L 430 200"
              fill="none"
              stroke="rgba(34,199,199,0.06)"
              strokeWidth="6"
              strokeLinecap="round"
            />

            {/* Main animated edge */}
            <path
              data-hero-edge
              d="M 130 65 L 430 65 L 430 200"
              fill="none"
              stroke="url(#edge-grad)"
              strokeWidth="2"
              strokeLinecap="round"
              filter="url(#edge-glow)"
            />

            {/* Arrow head at end */}
            <path
              d="M 424 194 L 430 206 L 436 194"
              fill="none"
              stroke="url(#edge-grad)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Traveling dots along path */}
            <circle data-edge-dot r="3" cx="130" cy="65" fill="var(--primary)" opacity="0" />
            <circle data-edge-dot r="2" cx="130" cy="65" fill="#7DD3FC" opacity="0" />

            {/* Connection node handles */}
            <circle cx="130" cy="65" r="4" fill="var(--primary)" opacity="0.7" />
            <circle cx="430" cy="200" r="4" fill="var(--primary)" opacity="0.7" />

            {/* Pulse rings on connection handles */}
            <circle cx="130" cy="65" r="4" fill="none" stroke="var(--primary)" strokeWidth="1.5" opacity="0.4">
              <animate attributeName="r" values="4;12;4" dur="2.4s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.4;0;0.4" dur="2.4s" repeatCount="indefinite" />
            </circle>
            <circle cx="430" cy="200" r="4" fill="none" stroke="#7DD3FC" strokeWidth="1.5" opacity="0.4">
              <animate attributeName="r" values="4;12;4" dur="2.8s" repeatCount="indefinite" begin="0.4s" />
              <animate attributeName="opacity" values="0.4;0;0.4" dur="2.8s" repeatCount="indefinite" begin="0.4s" />
            </circle>
          </svg>

          {/* ── Node: ParkingLot ─────────────────────────────────── */}
          <div
            data-hero-node
            className="absolute left-[12px] top-[30px] w-[180px] rounded-[10px] overflow-hidden cursor-pointer"
            style={{
              background: 'var(--surface-3)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-sm)',
              transformOrigin: 'center center',
              opacity: 0,
              willChange: 'transform',
            }}
          >
            <div
              data-node-header
              className="px-3 py-2 font-mono font-bold text-[12px] text-text"
              style={{ background: 'var(--surface-4)' }}
            >
              ParkingLot
            </div>
            <div className="h-px bg-border opacity-60" />
            <div className="px-3 py-1.5 font-mono text-[11px] text-text-muted">
              - name: String
            </div>
            <div className="px-3 py-1.5 font-mono text-[11px] text-text-muted">
              - capacity: Int
            </div>
          </div>

          {/* ── Node: FeeStrategy (interface) ───────────────────── */}
          <div
            data-hero-node
            className="absolute right-[12px] top-[30px] w-[180px] rounded-[10px] overflow-hidden cursor-pointer"
            style={{
              background: 'var(--surface-3)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-sm)',
              transformOrigin: 'center center',
              opacity: 0,
              willChange: 'transform',
            }}
          >
            <div
              data-node-header
              className="px-3 py-2 font-mono text-[11px]"
              style={{ background: 'var(--surface-4)' }}
            >
              <span className="font-bold italic text-kind-interface">«interface»</span>
            </div>
            <div
              data-node-header
              className="px-3 py-1.5 font-mono font-bold text-[12px] text-text"
              style={{ borderTop: '1px solid var(--border)', background: 'var(--surface-4)' }}
            >
              FeeStrategy
            </div>
            <div className="h-px bg-border opacity-60" />
            <div className="px-3 py-1.5 font-mono text-[11px] text-text-muted italic">
              + calculate(t): double
            </div>
          </div>

          {/* ── Node: HourlyFeeStrategy ──────────────────────────── */}
          <div
            data-hero-node
            className="absolute right-[12px] bottom-[8px] w-[180px] rounded-[10px] overflow-hidden cursor-pointer"
            style={{
              background: 'var(--surface-3)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-sm)',
              transformOrigin: 'center center',
              opacity: 0,
              willChange: 'transform',
            }}
          >
            <div
              data-node-header
              className="px-3 py-2 font-mono font-bold text-[12px] text-text"
              style={{ background: 'var(--surface-4)' }}
            >
              HourlyFeeStrategy
            </div>
            <div className="h-px bg-border opacity-60" />
            <div className="px-3 py-1.5 font-mono text-[11px] text-text-faint italic">
              no attributes
            </div>
          </div>
        </div>

        {/* ── Scroll cue ──────────────────────────────────────────────────── */}
        <div className="mt-14 flex flex-col items-center gap-2 opacity-30">
          <span className="text-[10px] tracking-[0.18em] uppercase text-text-muted font-semibold">scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-text-muted to-transparent" />
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
