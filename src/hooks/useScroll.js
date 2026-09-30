import { useEffect, useState } from 'react';

/**
 * useScroll — tracks how far the page is scrolled.
 * Returns { y, progress } where progress is 0–100 (% of the page scrolled).
 *
 * DOM concepts: window 'scroll' event listener, document.documentElement
 * measurements, and cleanup (removeEventListener) when the component unmounts.
 */
export function useScroll() {
  const [scroll, setScroll] = useState({ y: 0, progress: 0 });

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - doc.clientHeight;
      setScroll({
        y: window.scrollY,
        progress: scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0,
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return scroll;
}
