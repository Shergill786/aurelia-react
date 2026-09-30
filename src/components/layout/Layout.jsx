import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useScroll } from '../../hooks/useScroll';
import Footer from './Footer';
import Navbar from './Navbar';

/** Thin gradient bar at the very top that fills as you scroll. */
function ScrollProgress() {
  const { progress } = useScroll();
  return <div id="scrollProgress" style={{ width: `${progress}%` }} aria-hidden="true" />;
}

/** "Back to top" button that appears after scrolling 500px. */
function ScrollTopButton() {
  const { y } = useScroll();
  return (
    <button
      type="button"
      id="scrollTop"
      className={y > 500 ? 'show' : ''}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      tabIndex={y > 500 ? 0 : -1}
    >
      ↑
    </button>
  );
}

/**
 * Scroll to the top on every page change (a SPA doesn't do this by itself),
 * or to the #hash target when the link has one (e.g. /contact#faq).
 */
function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' });
    } else {
      // 'instant' so the new page starts at the top without a scroll animation
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [pathname, hash]);
  return null;
}

/**
 * Layout — the frame shared by every normal page:
 * skip link, announcement bar, navbar, <main> (the routed page), footer.
 */
export default function Layout() {
  const { pathname } = useLocation();
  return (
    <>
      {/* With HashRouter, "#main" would be read as a route, so we move focus with the DOM instead */}
      <a
        href="#main"
        className="skip-link"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById('main')?.focus();
        }}
      >
        Skip to content
      </a>
      <ScrollProgress />
      <ScrollManager />
      <p className="announce-bar">✦ Free shipping on orders over ₹4,999 · New Season Arrivals Now Live ✦</p>
      <Navbar />
      {/* key={pathname} replays the fade-in animation on each page change */}
      <main id="main" key={pathname} className="page-fade" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
      <ScrollTopButton />
    </>
  );
}
