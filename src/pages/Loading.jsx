import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/contexts';
import { PRELOAD_IMAGES } from '../data/siteImages';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const MIN_SHOW_MS = 1800; // always show the brand for a moment
const MAX_WAIT_MS = 4500; // never wait longer than this (slow or offline network)

/**
 * Loading — the splash screen the site opens on (route "/").
 *
 * While the logo pulses it genuinely preloads the home page's hero and
 * category photos with `new Image()`, so the progress bar shows real
 * progress. When the images are ready (and at least MIN_SHOW_MS has passed)
 * it continues to the store if you're signed in, or to Login if not.
 */
export default function Loading() {
  useDocumentTitle('Loading');
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loaded, setLoaded] = useState(0);
  const [minTimePassed, setMinTimePassed] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  const total = PRELOAD_IMAGES.length;
  const next = user ? '/home' : '/login';
  const ready = minTimePassed && (loaded >= total || timedOut);
  const percent = Math.round((loaded / total) * 100);

  // Preload images. onload/onerror both count, so one broken image can't block us.
  useEffect(() => {
    let cancelled = false;
    const images = PRELOAD_IMAGES.map((src) => {
      const img = new Image();
      img.onload = img.onerror = () => {
        if (!cancelled) setLoaded((n) => n + 1);
      };
      img.src = src;
      return img;
    });
    return () => {
      cancelled = true;
      images.forEach((img) => {
        img.onload = img.onerror = null;
      });
    };
  }, []);

  // Minimum display time and a safety cap on waiting.
  useEffect(() => {
    const minTimer = setTimeout(() => setMinTimePassed(true), MIN_SHOW_MS);
    const maxTimer = setTimeout(() => setTimedOut(true), MAX_WAIT_MS);
    return () => {
      clearTimeout(minTimer);
      clearTimeout(maxTimer);
    };
  }, []);

  // Once ready, move on. `replace` so the Back button doesn't return to the splash.
  useEffect(() => {
    if (ready) navigate(next, { replace: true });
  }, [ready, next, navigate]);

  return (
    <main id="preloader" className="loading-screen" aria-busy={!ready} aria-labelledby="loading-title">
      <h1 id="loading-title" className="pre-mark">
        AURELIA
      </h1>
      <div
        className="loader-track"
        role="progressbar"
        aria-label="Loading the collection"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
      >
        <span className="loader-fill" style={{ width: `${Math.max(8, percent)}%` }} />
      </div>
      <p className="pre-status" aria-live="polite">
        {ready ? 'Opening the store…' : `Loading the collection… ${percent}%`}
      </p>
      <Link to={next} replace className="pre-skip">
        Skip
      </Link>
    </main>
  );
}
