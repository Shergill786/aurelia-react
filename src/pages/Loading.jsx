import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PRELOAD_IMAGES } from '../data/siteImages';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const MIN_SHOW_MS = 1800;
const MAX_WAIT_MS = 4500;

export default function Loading() {
  useDocumentTitle('Loading');

  const navigate = useNavigate();
  const { user } = useAuth();

  const [loaded, setLoaded] = useState(0);
  const [minTimePassed, setMinTimePassed] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  const total = PRELOAD_IMAGES.length;

  const next = user ? '/home' : '/login';

  const ready =
    minTimePassed &&
    (loaded >= total || timedOut);

  const percent =
    total > 0
      ? Math.round((loaded / total) * 100)
      : 100;

  // Preload images
  useEffect(() => {
    let cancelled = false;

    const images = PRELOAD_IMAGES.map((src) => {
      const img = new Image();

      img.onload = img.onerror = () => {
        if (!cancelled) {
          setLoaded((n) => n + 1);
        }
      };

      img.src = src;

      return img;
    });

    return () => {
      cancelled = true;

      images.forEach((img) => {
        img.onload = null;
        img.onerror = null;
      });
    };
  }, []);

  // Minimum loading time and timeout
  useEffect(() => {
    const minTimer = setTimeout(() => {
      setMinTimePassed(true);
    }, MIN_SHOW_MS);

    const maxTimer = setTimeout(() => {
      setTimedOut(true);
    }, MAX_WAIT_MS);

    return () => {
      clearTimeout(minTimer);
      clearTimeout(maxTimer);
    };
  }, []);

  // Navigate when loading is complete
  useEffect(() => {
    if (ready) {
      navigate(next, {
        replace: true,
      });
    }
  }, [ready, next, navigate]);

  return (
    <main
      id="preloader"
      className="loading-screen"
      aria-busy={!ready}
      aria-labelledby="loading-title"
    >
      <h1
        id="loading-title"
        className="pre-mark"
      >
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
        <span
          className="loader-fill"
          style={{
            width: `${Math.max(8, percent)}%`,
          }}
        />
      </div>

      <p
        className="pre-status"
        aria-live="polite"
      >
        {ready
          ? 'Opening the store…'
          : `Loading the collection… ${percent}%`}
      </p>

      <Link
        to={next}
        replace
        className="pre-skip"
      >
        Skip
      </Link>
    </main>
  );
}