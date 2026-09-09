import { useEffect, RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

/**
 * Phase 37+ — Premium GSAP motion for the marketing homepage.
 *
 * Techniques used (per GSAP skills):
 *   • gsap-core    — fromTo, autoAlpha, scale, stagger, ease library
 *   • gsap-timeline — chained timelines, position parameter, labels
 *   • gsap-scrolltrigger — scroll-linked reveals, scrubbed parallax
 *   • gsap-performance — transforms-only, quickTo, will-change batching
 *   • Lenis smooth scroll proxied to ScrollTrigger
 *   • gsap.matchMedia() for reduced-motion + responsive behaviour
 */
export function useHomeMotion(containerRef: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ── Lenis smooth scroll ─────────────────────────────────────────────────
    const lenis = new Lenis({
      duration: 1.25,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 2.2,
    });

    ScrollTrigger.scrollerProxy(document.documentElement, {
      scrollTop(value?: number) {
        if (arguments.length && value !== undefined) {
          lenis.scrollTo(value, { immediate: true });
        }
        return lenis.scroll;
      },
      getBoundingClientRect() {
        return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
      },
      pinType: 'transform',
    });

    lenis.on('scroll', () => ScrollTrigger.update());

    const rafFn = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(rafFn);
    gsap.ticker.lagSmoothing(0);

    // ── gsap.matchMedia — skip animations on reduced-motion ────────────────
    const mm = gsap.matchMedia();

    mm.add(
      {
        reduceMotion: '(prefers-reduced-motion: reduce)',
        isDesktop: '(min-width: 768px)',
      },
      (context) => {
        const { reduceMotion } = context.conditions ?? {};

        const ctx = gsap.context(() => {
          // ── Global reveal for [data-reveal] elements ──────────────────────
          const revealEls = container.querySelectorAll<HTMLElement>('[data-reveal]');

          if (reduceMotion) {
            gsap.set(revealEls, { autoAlpha: 1, y: 0, x: 0 });
            return;
          }

          // Batch for performance — one ScrollTrigger per element
          revealEls.forEach((el, i) => {
            const direction = i % 3 === 0 ? 32 : i % 3 === 1 ? -32 : 0;
            gsap.fromTo(
              el,
              { autoAlpha: 0, y: 44, x: direction * 0.3 },
              {
                autoAlpha: 1,
                y: 0,
                x: 0,
                duration: 1.0,
                ease: 'power3.out',
                scrollTrigger: {
                  trigger: el,
                  start: 'top 87%',
                  toggleActions: 'play none none none',
                },
              }
            );
          });

          // ── Feature section: alternating slide-in direction ───────────────
          const featureRows = container.querySelectorAll<HTMLElement>('[data-feature-row]');
          featureRows.forEach((row, i) => {
            const [left, right] = Array.from(row.children) as HTMLElement[];
            const tl = gsap.timeline({
              scrollTrigger: {
                trigger: row,
                start: 'top 82%',
                toggleActions: 'play none none none',
              },
            });

            if (left) {
              tl.fromTo(
                left,
                { autoAlpha: 0, x: i % 2 === 0 ? -50 : 50 },
                { autoAlpha: 1, x: 0, duration: 0.85, ease: 'power3.out' },
                0
              );
            }
            if (right) {
              tl.fromTo(
                right,
                { autoAlpha: 0, x: i % 2 === 0 ? 50 : -50 },
                { autoAlpha: 1, x: 0, duration: 0.85, ease: 'power3.out' },
                0.08
              );
            }
          });

          // ── Stats strip: number count-up effect ───────────────────────────
          const statNums = container.querySelectorAll<HTMLElement>('[data-stat-num]');
          statNums.forEach((el) => {
            const target = parseInt(el.textContent ?? '0', 10);
            if (isNaN(target)) return;
            const obj = { val: 0 };
            gsap.to(obj, {
              val: target,
              duration: 1.6,
              ease: 'power2.out',
              scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
              onUpdate() {
                el.textContent = Math.round(obj.val).toString();
              },
            });
          });

          // ── Library cards: staggered card entrance ────────────────────────
          const libraryCards = container.querySelectorAll<HTMLElement>('[data-library-card]');
          if (libraryCards.length > 0) {
            gsap.fromTo(
              libraryCards,
              { autoAlpha: 0, y: 36, scale: 0.94 },
              {
                autoAlpha: 1,
                y: 0,
                scale: 1,
                duration: 0.7,
                stagger: { each: 0.07, from: 'start' },
                ease: 'power3.out',
                scrollTrigger: {
                  trigger: libraryCards[0]!.parentElement ?? libraryCards[0]!,
                  start: 'top 85%',
                  toggleActions: 'play none none none',
                },
              }
            );
          }

          // ── Library card hover micro-interaction ──────────────────────────
          libraryCards.forEach((card) => {
            const enterFn = () =>
              gsap.to(card, {
                y: -6,
                scale: 1.025,
                boxShadow: '0 12px 32px rgba(34,199,199,0.15)',
                borderColor: 'rgba(34,199,199,0.4)',
                duration: 0.28,
                ease: 'power2.out',
                overwrite: 'auto',
              });
            const leaveFn = () =>
              gsap.to(card, {
                y: 0,
                scale: 1,
                boxShadow: 'none',
                borderColor: '',
                duration: 0.4,
                ease: 'power3.out',
                overwrite: 'auto',
              });
            card.addEventListener('mouseenter', enterFn);
            card.addEventListener('mouseleave', leaveFn);
          });

          // ── Divider line: draw + glow + hover shimmer ─────────────────────
          const divider = container.querySelector<HTMLElement>('[data-divider-line]');
          if (divider) {
            gsap.set(divider, { scaleX: 0, transformOrigin: 'center', autoAlpha: 0 });
            const divTl = gsap.timeline({
              scrollTrigger: { trigger: divider, start: 'top 82%', toggleActions: 'play none none none' },
            });
            divTl
              .to(divider, { scaleX: 1, autoAlpha: 1, duration: 1.1, ease: 'expo.out' })
              .to(divider, {
                boxShadow: '0 0 20px 5px rgba(34,199,199,0.45)',
                duration: 0.4,
                ease: 'power2.in',
              })
              .to(divider, {
                boxShadow: '0 0 0 0 transparent',
                duration: 0.7,
                ease: 'power2.out',
              });

            const hoverIn = () =>
              gsap.to(divider, { scaleY: 2.8, boxShadow: '0 0 14px 3px rgba(34,199,199,0.5)', duration: 0.25, ease: 'power2.out' });
            const hoverOut = () =>
              gsap.to(divider, { scaleY: 1, boxShadow: '0 0 0 0 transparent', duration: 0.4, ease: 'power2.inOut' });
            divider.addEventListener('mouseenter', hoverIn);
            divider.addEventListener('mouseleave', hoverOut);
          }

          // ── Footer CTA: magnetic button effect ────────────────────────────
          const footerBtn = container.querySelector<HTMLElement>('#home-cta-launch-footer');
          if (footerBtn) {
            const xTo = gsap.quickTo(footerBtn, 'x', { duration: 0.5, ease: 'power3' });
            const yTo = gsap.quickTo(footerBtn, 'y', { duration: 0.5, ease: 'power3' });
            const magMove = (e: MouseEvent) => {
              const rect = footerBtn.getBoundingClientRect();
              const cx = rect.left + rect.width / 2;
              const cy = rect.top + rect.height / 2;
              const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
              if (dist < 90) {
                xTo((e.clientX - cx) * 0.22);
                yTo((e.clientY - cy) * 0.22);
              }
            };
            const magLeave = () => { xTo(0); yTo(0); };
            footerBtn.addEventListener('mousemove', magMove);
            footerBtn.addEventListener('mouseleave', magLeave);
          }

          // ── Marquee strip: subtle horizontal scroll ────────────────────────
          const marquee = container.querySelector<HTMLElement>('[data-marquee-inner]');
          if (marquee) {
            gsap.to(marquee, {
              x: '-50%',
              duration: 28,
              ease: 'none',
              repeat: -1,
            });
          }

          // ── Section headings: clip-path reveal ────────────────────────────
          const sectionHeadings = container.querySelectorAll<HTMLElement>('[data-section-heading]');
          sectionHeadings.forEach((el) => {
            gsap.fromTo(
              el,
              { clipPath: 'inset(0 100% 0 0)', autoAlpha: 0 },
              {
                clipPath: 'inset(0 0% 0 0)',
                autoAlpha: 1,
                duration: 1.0,
                ease: 'expo.out',
                scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' },
              }
            );
          });

        }, container);

        return () => ctx.revert();
      }
    );

    return () => {
      mm.revert();
      ScrollTrigger.scrollerProxy(document.documentElement, {});
      lenis.destroy();
      gsap.ticker.remove(rafFn);
    };
  }, [containerRef]);
}

export default useHomeMotion;
