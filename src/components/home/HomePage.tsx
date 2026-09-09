import { useRef } from 'react';
import { useHomeMotion } from '../../hooks/useHomeMotion';
import HeroSection from './HeroSection';
import ProblemStatementSection from './ProblemStatementSection';
import FeatureShowcaseSection from './FeatureShowcaseSection';
import LibraryTeaserSection from './LibraryTeaserSection';
import StatsStripSection from './StatsStripSection';
import HomeFooter from './HomeFooter';

export interface HomePageProps {
  onLaunch: () => void;
}

/**
 * Phase 37 — the marketing homepage. A pre-app landing route, explicitly
 * exempted from DESIGN.md §1's "not a marketing surface" rule per the new
 * §13.4. Reuses the app's own color/type tokens; motion is GSAP-driven via
 * useHomeMotion, scoped entirely to this container.
 */
export function HomePage({ onLaunch }: HomePageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  useHomeMotion(containerRef);

  return (
    <div
      ref={containerRef}
      id="home-page"
      data-testid="home-page"
      className="w-full min-h-screen bg-bg text-text overflow-x-hidden"
    >
      <HeroSection onLaunch={onLaunch} />
      <ProblemStatementSection />
      <FeatureShowcaseSection />
      <LibraryTeaserSection onLaunch={onLaunch} />
      <StatsStripSection />
      <HomeFooter onLaunch={onLaunch} />
    </div>
  );
}

export default HomePage;
