import { useState, useEffect } from 'react';

/**
 * Subscribes to a CSS media query and returns whether it matches.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQueryList = window.matchMedia(query);
    const updateMatch = (e: MediaQueryListEvent) => setMatches(e.matches);

    setMatches(mediaQueryList.matches);

    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener('change', updateMatch);
      return () => mediaQueryList.removeEventListener('change', updateMatch);
    } else {
      mediaQueryList.addListener(updateMatch);
      return () => mediaQueryList.removeListener(updateMatch);
    }
  }, [query]);

  return matches;
}

export interface BreakpointInfo {
  isMobile: boolean; // < 768px
  isTablet: boolean; // 768px – 1099px
  isLaptop: boolean; // 1100px – 1439px
  isDesktop: boolean; // >= 1440px
  isCompactHeader: boolean; // < 1200px
  isCoarsePointer: boolean; // (pointer: coarse)
  windowWidth: number;
}

/**
 * Hook providing exact breakpoint states matching PRD §18.
 */
export function useBreakpoint(): BreakpointInfo {
  const isMobile = useMediaQuery('(max-width: 767.98px)');
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1099.98px)');
  const isLaptop = useMediaQuery('(min-width: 1100px) and (max-width: 1439.98px)');
  const isDesktop = useMediaQuery('(min-width: 1440px)');
  const isCompactHeader = useMediaQuery('(max-width: 1199.98px)');
  const isCoarsePointer = useMediaQuery('(pointer: coarse)');

  const [windowWidth, setWindowWidth] = useState<number>(() => {
    return typeof window !== 'undefined' ? window.innerWidth : 1440;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    isMobile,
    isTablet,
    isLaptop,
    isDesktop,
    isCompactHeader,
    isCoarsePointer,
    windowWidth,
  };
}

export default useBreakpoint;
