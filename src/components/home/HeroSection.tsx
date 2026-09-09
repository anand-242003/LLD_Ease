import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface HeroSectionProps {
  onLaunch: () => void;
}

export function HeroSection({ onLaunch }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const launchBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // ── All GSAP work scoped to this section ─────────────────────────────────
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          reduceMotion: '(prefers-reduced-motion: reduce)',
          isDesktop: '(min-width: 768px)',
        },
        (context) => {
          const { reduceMotion, isDesktop } = context.conditions ?? {};

          // ── 1. Badge entrance ───────────────────────────────────────────────
          gsap.fromTo(
            '[data-hero-badge]',
            { autoAlpha: 0, y: -20 },
            { autoAlpha: 1, y: 0, duration: reduceMotion ? 0 : 0.55, ease: 'power2.out', delay: 0.1 }
          );

          // ── 2. Headline: word-by-word 3D flip reveal ────────────────────────
          const words = headlineRef.current?.querySelectorAll<HTMLSpanElement>('[data-word]');
          if (words && words.length > 0) {
            gsap.fromTo(
              words,
              { autoAlpha: 0, y: 52, rotationX: -40, transformOrigin: 'center bottom' },
              {
                autoAlpha: 1,
                y: 0,
                rotationX: 0,
                duration: reduceMotion ? 0 : 0.8,
                stagger: { each: 0.11, ease: 'power2.out' },
                ease: 'power3.out',
                delay: reduceMotion ? 0 : 0.35,
              }
            );
          }

          // ── 3. Sub-text reveal ──────────────────────────────────────────────
          gsap.fromTo(
            '[data-hero-sub]',
            { autoAlpha: 0, y: 28 },
            { autoAlpha: 1, y: 0, duration: reduceMotion ? 0 : 0.75, ease: 'power3.out', delay: reduceMotion ? 0 : 0.88 }
          );

          // ── 4. CTAs staggered entrance ──────────────────────────────────────
          gsap.fromTo(
            '[data-hero-cta]',
            { autoAlpha: 0, y: 20, scale: 0.93 },
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              duration: reduceMotion ? 0 : 0.65,
              stagger: 0.1,
              ease: 'back.out(1.4)',
              delay: reduceMotion ? 0 : 1.05,
            }
          );

          // ── 5. Live badge floating loop ─────────────────────────────────────
          if (!reduceMotion) {
            gsap.to('[data-hero-status]', {
              y: -5,
              duration: 2.2,
              repeat: -1,
              yoyo: true,
              ease: 'sine.inOut',
              delay: 1.8,
            });
          }

          // ── 6. Diagram: nodes pop in then edges draw ────────────────────────
          const nodes = section.querySelectorAll<HTMLElement>('[data-hero-node]');
          const edge1 = section.querySelector<SVGPathElement>('[data-hero-edge="1"]');
          const edge2 = section.querySelector<SVGPathElement>('[data-hero-edge="2"]');
          const dots = section.querySelectorAll<SVGCircleElement>('[data-edge-dot]');
          const lintBadge = section.querySelector<HTMLElement>('[data-lint-badge]');

          if (nodes.length > 0) {
            // Nodes: scale+fade in from slightly below
            gsap.fromTo(
              nodes,
              { autoAlpha: 0, scale: 0.8, y: 22 },
              {
                autoAlpha: 1,
                scale: 1,
                y: 0,
                duration: reduceMotion ? 0 : 0.6,
                stagger: { each: 0.14, from: 'start' },
                ease: 'back.out(2.2)',
                delay: reduceMotion ? 0 : 1.35,
              }
            );
          }

          // Edge 1 draw (horizontal: ParkingLot → FeeStrategy)
          if (edge1 && !reduceMotion) {
            const len1 = edge1.getTotalLength();
            gsap.set(edge1, { strokeDasharray: len1, strokeDashoffset: len1 });
            gsap.to(edge1, {
              strokeDashoffset: 0,
              duration: 0.85,
              ease: 'power2.inOut',
              delay: 1.85,
            });
          }

          // Edge 2 draw (vertical dashed: FeeStrategy → HourlyFeeStrategy)
          if (edge2 && !reduceMotion) {
            const len2 = edge2.getTotalLength();
            gsap.set(edge2, { strokeDasharray: `6 4`, strokeDashoffset: len2 });
            gsap.to(edge2, {
              strokeDashoffset: 0,
              duration: 0.7,
              ease: 'power2.inOut',
              delay: 2.15,
            });
          }

          // Lint badge pops in after diagram
          if (lintBadge && !reduceMotion) {
            gsap.fromTo(
              lintBadge,
              { autoAlpha: 0, scale: 0.85, y: 8 },
              { autoAlpha: 1, scale: 1, y: 0, duration: 0.5, ease: 'back.out(2)', delay: 2.5 }
            );
          }

          // Traveling particle along edge1
          if (dots.length > 0 && edge1 && !reduceMotion) {
            const edgeLen = edge1.getTotalLength();
            dots.forEach((dot, i) => {
              gsap.fromTo(
                dot,
                { autoAlpha: 0 },
                {
                  autoAlpha: 0.9,
                  duration: 0.4,
                  delay: 2.2 + i * 0.6,
                  onComplete() {
                    gsap.to({ p: 0 }, {
                      p: 1,
                      duration: 4,
                      repeat: -1,
                      ease: 'none',
                      delay: i * 0.5,
                      onUpdate() {
                        const progress = (this.targets()[0] as { p: number }).p;
                        const pt = edge1.getPointAtLength(progress * edgeLen);
                        gsap.set(dot, { attr: { cx: pt.x, cy: pt.y } });
                      },
                    });
                  },
                }
              );
            });
          }

          if (reduceMotion) return;

          // ── 7. Ambient orb mouse parallax ───────────────────────────────────
          const orbs = section.querySelectorAll<HTMLElement>('[data-orb]');
          const xTos = Array.from(orbs).map((orb, i) =>
            gsap.quickTo(orb, 'x', { duration: 1.4 + i * 0.4, ease: 'power2.out' })
          );
          const yTos = Array.from(orbs).map((orb, i) =>
            gsap.quickTo(orb, 'y', { duration: 1.4 + i * 0.4, ease: 'power2.out' })
          );

          const handleMouseMove = (e: MouseEvent) => {
            const rect = section.getBoundingClientRect();
            const nx = (e.clientX - rect.left) / rect.width - 0.5;
            const ny = (e.clientY - rect.top) / rect.height - 0.5;
            orbs.forEach((_, i) => {
              const factor = i === 0 ? 40 : 24;
              xTos[i]?.(nx * factor);
              yTos[i]?.(ny * factor);
            });
          };
          section.addEventListener('mousemove', handleMouseMove);

          // ── 8. Node hover micro-interactions ────────────────────────────────
          nodes.forEach((node) => {
            const header = node.querySelector<HTMLElement>('[data-node-header]');
            const rows = node.querySelectorAll<HTMLElement>('[data-node-row]');

            const enterFn = () => {
              gsap.to(node, {
                scale: 1.055,
                y: -5,
                boxShadow: '0 0 32px 6px rgba(34,199,199,0.22), 0 8px 24px rgba(0,0,0,0.35)',
                duration: 0.28,
                ease: 'power2.out',
                overwrite: 'auto',
              });
              if (header) gsap.to(header, { backgroundColor: 'rgba(34,199,199,0.12)', duration: 0.22 });
              gsap.fromTo(
                rows,
                { x: 0 },
                { x: 2, duration: 0.2, stagger: 0.04, ease: 'power1.out', yoyo: true, repeat: 1 }
              );
            };
            const leaveFn = () => {
              gsap.to(node, {
                scale: 1,
                y: 0,
                boxShadow: 'none',
                duration: 0.42,
                ease: 'power3.out',
                overwrite: 'auto',
              });
              if (header) gsap.to(header, { backgroundColor: '', duration: 0.32 });
            };
            node.addEventListener('mouseenter', enterFn);
            node.addEventListener('mouseleave', leaveFn);
          });

          // ── 9. Launch button: magnetic pull + shimmer pulse ──────────────────
          const launchBtn = launchBtnRef.current;
          if (launchBtn && isDesktop) {
            const xTo = gsap.quickTo(launchBtn, 'x', { duration: 0.45, ease: 'power3.out' });
            const yTo = gsap.quickTo(launchBtn, 'y', { duration: 0.45, ease: 'power3.out' });

            const magMove = (e: MouseEvent) => {
              const rect = launchBtn.getBoundingClientRect();
              const cx = rect.left + rect.width / 2;
              const cy = rect.top + rect.height / 2;
              const dx = e.clientX - cx;
              const dy = e.clientY - cy;
              const dist = Math.hypot(dx, dy);
              if (dist < 100) {
                xTo(dx * 0.26);
                yTo(dy * 0.26);
              }
            };
            const magLeave = () => { xTo(0); yTo(0); };

            launchBtn.addEventListener('mousemove', magMove);
            launchBtn.addEventListener('mouseleave', magLeave);
          }

          // ── 10. Heartbeat pulse on the Live dot ──────────────────────────────
          const liveDot = section.querySelector<HTMLElement>('[data-live-dot]');
          if (liveDot) {
            gsap.to(liveDot, {
              scale: 1.6,
              opacity: 0.3,
              duration: 0.7,
              repeat: -1,
              yoyo: true,
              ease: 'power1.inOut',
              delay: 2.5,
            });
          }

          return () => {
            section.removeEventListener('mousemove', handleMouseMove);
          };
        }
      );

      return () => mm.revert();
    }, section);

    return () => ctx.revert();
  }, []);

  const handleScrollToHowItWorks = () => {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex flex-col items-center justify-center px-6 py-16 text-center overflow-hidden"
    >
      {/* ── Noise grain ──────────────────────────────────────────────────────── */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.035'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px 128px',
          opacity: 0.55,
        }}
        aria-hidden="true"
      />

      {/* ── Ambient glow orbs (parallax targets) ─────────────────────────────── */}
      <div
        data-orb
        className="pointer-events-none absolute top-[12%] left-[8%] w-[560px] h-[560px] rounded-full z-0"
        style={{ background: 'radial-gradient(circle, rgba(34,199,199,0.08) 0%, transparent 68%)', filter: 'blur(40px)' }}
        aria-hidden="true"
      />
      <div
        data-orb
        className="pointer-events-none absolute bottom-[8%] right-[6%] w-[440px] h-[440px] rounded-full z-0"
        style={{ background: 'radial-gradient(circle, rgba(125,211,252,0.06) 0%, transparent 68%)', filter: 'blur(50px)' }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-[40%] left-[50%] -translate-x-1/2 w-[700px] h-[320px] rounded-full z-0"
        style={{ background: 'radial-gradient(ellipse, rgba(34,199,199,0.03) 0%, transparent 70%)', filter: 'blur(60px)' }}
        aria-hidden="true"
      />

      {/* ── Content container ────────────────────────────────────────────────── */}
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
          <span
            data-hero-status
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-primary/30 bg-primary/8 text-[11px] font-semibold text-primary tracking-wide"
          >
            <span data-live-dot className="w-1.5 h-1.5 rounded-full bg-primary" />
            Live
          </span>
        </div>

        {/* Headline — words individually wrapped for stagger animation */}
        <h1
          ref={headlineRef}
          className="text-[44px] sm:text-[68px] font-bold tracking-tight leading-[1.05] max-w-4xl mb-6"
          style={{ perspective: '700px' }}
        >
          {['Model', 'it.', 'Lint', 'it.'].map((w, i) => (
            <span
              key={i}
              data-word
              className="inline-block mr-[0.25em]"
              style={{ opacity: 0 }}
            >
              {w}
            </span>
          ))}
          <span
            data-word
            className="inline-block text-transparent mr-[0.06em]"
            style={{
              backgroundImage: 'linear-gradient(135deg, #22C7C7 0%, #7DD3FC 50%, #22C7C7 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              backgroundSize: '200% auto',
              opacity: 0,
            }}
          >
            Get
          </span>
          <span
            data-word
            className="inline-block text-transparent"
            style={{
              backgroundImage: 'linear-gradient(135deg, #22C7C7 0%, #7DD3FC 50%, #22C7C7 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              backgroundSize: '200% auto',
              opacity: 0,
            }}
          >
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
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-14">
          <button
            ref={launchBtnRef}
            data-hero-cta
            type="button"
            id="home-cta-launch"
            data-testid="home-cta-launch"
            onClick={onLaunch}
            style={{ opacity: 0 }}
            className="group relative h-[52px] px-9 rounded-[14px] bg-primary text-primary-fg text-[15px] font-semibold cursor-pointer overflow-hidden"
          >
            {/* Shimmer sweep on hover */}
            <span
              className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out pointer-events-none"
              style={{ background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.22) 50%, transparent 65%)' }}
              aria-hidden="true"
            />
            Launch LLDSIM
          </button>
          <button
            data-hero-cta
            type="button"
            onClick={handleScrollToHowItWorks}
            style={{ opacity: 0 }}
            className="group flex items-center gap-2 text-[14px] text-text-muted hover:text-primary transition-colors duration-200 bg-transparent border-none cursor-pointer"
          >
            See how it works
            <span className="group-hover:translate-y-0.5 transition-transform duration-200 inline-block">↓</span>
          </button>
        </div>

        {/* ── Interactive UML Diagram preview ──────────────────────────────────
            Layout in a 700×300 coordinate space:
              ParkingLot:         left=0,   top=30,   w=190  → center-x≈95,  center-y≈75
              FeeStrategy:        right=0,  top=30,   w=195  → center-x≈605, center-y≈75
              HourlyFeeStrategy:  right=0,  bottom=0, w=195  → center-x≈605, center-y≈225

            Edge 1 (association):  M 190 75 L 505 75    (ParkingLot right-edge → FeeStrategy left-edge)
            Edge 2 (realization):  M 605 118 L 605 215  (FeeStrategy bottom → HourlyFeeStrategy top)
        ─────────────────────────────────────────────────────────────────────── */}
        <div
          className="relative w-full max-w-[700px] select-none"
          style={{ height: '300px' }}
          aria-hidden="true"
        >
          {/* SVG edges layer */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 700 300"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              {/* Horizontal gradient (ParkingLot → FeeStrategy) */}
              <linearGradient id="eg1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22C7C7" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#7DD3FC" stopOpacity="0.65" />
              </linearGradient>
              {/* Vertical gradient (FeeStrategy → HourlyFeeStrategy) */}
              <linearGradient id="eg2" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#22C7C7" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#7DD3FC" stopOpacity="0.5" />
              </linearGradient>
              {/* Glow filter */}
              <filter id="eglow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Ghost depth lines */}
            <path d="M 190 75 L 505 75" fill="none" stroke="rgba(34,199,199,0.07)" strokeWidth="7" strokeLinecap="round" />
            <path d="M 605 118 L 605 215" fill="none" stroke="rgba(125,211,252,0.07)" strokeWidth="7" strokeLinecap="round" />

            {/* Edge 1: ParkingLot → FeeStrategy (solid association) */}
            <path
              data-hero-edge="1"
              d="M 190 75 L 505 75"
              fill="none"
              stroke="url(#eg1)"
              strokeWidth="1.8"
              strokeLinecap="round"
              filter="url(#eglow)"
            />
            {/* Arrowhead at FeeStrategy */}
            <path
              d="M 499 69 L 511 75 L 499 81"
              fill="none"
              stroke="#22C7C7"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Edge 2: FeeStrategy → HourlyFeeStrategy (dashed realization) */}
            <path
              data-hero-edge="2"
              d="M 605 118 L 605 215"
              fill="none"
              stroke="url(#eg2)"
              strokeWidth="1.8"
              strokeLinecap="round"
              filter="url(#eglow)"
            />
            {/* Open triangle arrowhead pointing down */}
            <path
              d="M 598 209 L 605 222 L 612 209"
              fill="none"
              stroke="#7DD3FC"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Traveling particles on edge 1 */}
            <circle data-edge-dot r="3.5" cx="190" cy="75" fill="#22C7C7" opacity="0" />
            <circle data-edge-dot r="2" cx="190" cy="75" fill="#7DD3FC" opacity="0" />

            {/* Connection handle dots */}
            <circle cx="190" cy="75" r="4.5" fill="#22C7C7" opacity="0.65" />
            <circle cx="505" cy="75" r="4.5" fill="#22C7C7" opacity="0.65" />
            <circle cx="605" cy="215" r="4.5" fill="#7DD3FC" opacity="0.55" />

            {/* Animated pulse rings */}
            <circle cx="190" cy="75" r="4" fill="none" stroke="#22C7C7" strokeWidth="1.5" opacity="0.5">
              <animate attributeName="r" values="4;16;4" dur="2.6s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.5;0;0.5" dur="2.6s" repeatCount="indefinite" />
            </circle>
            <circle cx="605" cy="215" r="4" fill="none" stroke="#7DD3FC" strokeWidth="1.5" opacity="0.4">
              <animate attributeName="r" values="4;16;4" dur="3s" repeatCount="indefinite" begin="0.8s" />
              <animate attributeName="opacity" values="0.4;0;0.4" dur="3s" repeatCount="indefinite" begin="0.8s" />
            </circle>

            {/* Relationship labels */}
            <text x="347" y="65" textAnchor="middle" fill="rgba(34,199,199,0.4)" fontSize="10" fontFamily="monospace">uses</text>
            <text x="618" y="172" textAnchor="start" fill="rgba(125,211,252,0.38)" fontSize="10" fontFamily="monospace">implements</text>
          </svg>

          {/* ── Node: ParkingLot ──────────────────────────────────────────── */}
          <div
            data-hero-node
            className="absolute left-0 top-[30px] w-[190px] rounded-[10px] overflow-hidden cursor-pointer"
            style={{
              background: 'var(--surface-3)',
              border: '1px solid var(--border)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
              transformOrigin: 'center center',
              opacity: 0,          /* GSAP fromTo will reveal this */
              willChange: 'transform, opacity',
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
            <div data-node-row className="px-3 py-1.5 font-mono text-[11px] text-text-muted">
              - name: String
            </div>
            <div data-node-row className="px-3 py-1.5 font-mono text-[11px] text-text-muted">
              - capacity: Int
            </div>
            <div className="h-px bg-border opacity-40" />
            <div data-node-row className="px-3 py-1.5 font-mono text-[11px] text-text-muted italic">
              + getFloors(): List
            </div>
          </div>

          {/* ── Node: «interface» FeeStrategy ─────────────────────────────── */}
          <div
            data-hero-node
            className="absolute right-0 top-[30px] w-[195px] rounded-[10px] overflow-hidden cursor-pointer"
            style={{
              background: 'var(--surface-3)',
              border: '1px solid var(--border)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
              transformOrigin: 'center center',
              opacity: 0,
              willChange: 'transform, opacity',
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
            <div data-node-row className="px-3 py-1.5 font-mono text-[11px] text-text-muted italic">
              + calculate(t): double
            </div>
          </div>

          {/* ── Node: HourlyFeeStrategy ───────────────────────────────────── */}
          <div
            data-hero-node
            className="absolute right-0 bottom-0 w-[195px] rounded-[10px] overflow-hidden cursor-pointer"
            style={{
              background: 'var(--surface-3)',
              border: '1px solid var(--border)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
              transformOrigin: 'center center',
              opacity: 0,
              willChange: 'transform, opacity',
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
            <div data-node-row className="px-3 py-1.5 font-mono text-[11px] text-text-muted">
              - ratePerHour: double
            </div>
            <div className="h-px bg-border opacity-40" />
            <div data-node-row className="px-3 py-1.5 font-mono text-[11px] text-text-muted italic">
              + calculate(t): double
            </div>
          </div>

          {/* ── Lint status badge (bottom-left of diagram) ─────────────────── */}
          <div
            data-lint-badge
            className="absolute left-0 bottom-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-mono"
            style={{
              background: 'rgba(34,199,199,0.08)',
              border: '1px solid rgba(34,199,199,0.22)',
              color: 'var(--primary)',
              opacity: 0,
            }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" aria-hidden="true">
              <circle cx="5" cy="5" r="4.5" fillOpacity="0.25" />
              <circle cx="5" cy="5" r="2" />
            </svg>
            0 lint issues
          </div>

          {/* ── Score badge (center-bottom of diagram) ─────────────────────── */}
          <div
            className="absolute left-1/2 -translate-x-1/2 bottom-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-mono"
            style={{
              background: 'rgba(125,211,252,0.07)',
              border: '1px solid rgba(125,211,252,0.18)',
              color: '#7DD3FC',
            }}
          >
            <span className="font-bold text-[13px]">87</span>
            <span className="text-text-muted opacity-70">/100</span>
          </div>
        </div>

        {/* ── Scroll cue ───────────────────────────────────────────────────── */}
        <div className="mt-10 flex flex-col items-center gap-2 opacity-25">
          <span className="text-[10px] tracking-[0.18em] uppercase text-text-muted font-semibold">scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-text-muted to-transparent" />
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
