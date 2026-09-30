import { useEffect, useRef } from 'react';

/**
 * useClickOutside — calls `handler` when the user clicks outside `ref`.
 * Used to close the search suggestions dropdown.
 */
export function useClickOutside(ref, handler) {
  const handlerRef = useRef(handler);
  useEffect(() => {
    handlerRef.current = handler;
  });

  useEffect(() => {
    const onPointerDown = (event) => {
      // Node.contains() is a DOM API: is the clicked element inside our box?
      if (ref.current && !ref.current.contains(event.target)) handlerRef.current(event);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
    };
  }, [ref]);
}

/**
 * useKeyDown — run `handler` when a specific key is pressed anywhere.
 * Used so Escape closes modals and the mobile menu.
 */
export function useKeyDown(key, handler, active = true) {
  const handlerRef = useRef(handler);
  useEffect(() => {
    handlerRef.current = handler;
  });

  useEffect(() => {
    if (!active) return undefined;
    const onKeyDown = (event) => {
      if (event.key === key) handlerRef.current(event);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [key, active]);
}

/**
 * useLockBodyScroll — stop the page behind a modal/drawer from scrolling.
 * Directly edits document.body.style and restores it on cleanup.
 */
export function useLockBodyScroll(locked) {
  useEffect(() => {
    if (!locked) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [locked]);
}
