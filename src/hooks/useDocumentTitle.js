import { useEffect } from 'react';

/**
 * useDocumentTitle — sets the browser tab title for the current page.
 * A side effect on the real DOM (document.title), so it lives in useEffect.
 */
export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} — Aurelia` : 'Aurelia — Premium Shopping, Redefined';
  }, [title]);
}
