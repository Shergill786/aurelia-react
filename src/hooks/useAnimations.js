import { useEffect, useRef, useState } from 'react';

/**
 * useInView — true once the element has scrolled into view.
 * Uses the IntersectionObserver DOM API and stops observing after the first hit.
 */
export function useInView(options = { threshold: 0.12 }) {
  const ref = useRef(null);
  // Browsers without IntersectionObserver simply show the content straight away.
  const [inView, setInView] = useState(() => typeof window !== 'undefined' && !('IntersectionObserver' in window));
  const { threshold, rootMargin } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold, rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return [ref, inView];
}

/**
 * useCountUp — animates a number from 0 to `target` once `start` is true,
 * using requestAnimationFrame for a smooth 60fps count.
 */
export function useCountUp(target, start, duration = 1200) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!start) return undefined;
    let frame;
    const begin = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - begin) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out
      setValue(Math.round(target * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, start, duration]);

  return value;
}

/**
 * useTypewriter — types and deletes each word in turn (hero headline).
 * setTimeout inside useEffect, cleared on every re-run to avoid leaks.
 */
export function useTypewriter(words, { typeSpeed = 90, deleteSpeed = 45, pause = 1400 } = {}) {
  const [text, setText] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = words[wordIndex % words.length];
    let delay = deleting ? deleteSpeed : typeSpeed;

    if (!deleting && text === word) delay = pause;
    if (deleting && text === '') delay = 400;

    const timer = setTimeout(() => {
      if (!deleting && text === word) setDeleting(true);
      else if (deleting && text === '') {
        setDeleting(false);
        setWordIndex((i) => (i + 1) % words.length);
      } else {
        setText(deleting ? word.slice(0, text.length - 1) : word.slice(0, text.length + 1));
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [text, deleting, wordIndex, words, typeSpeed, deleteSpeed, pause]);

  return text;
}
