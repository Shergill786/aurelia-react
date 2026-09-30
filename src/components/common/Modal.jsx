import { useEffect, useRef } from 'react';
import { useKeyDown, useLockBodyScroll } from '../../hooks/useEvents';

/**
 * Modal — accessible dialog used for Quick View.
 *
 * DOM behaviour handled here:
 *  - Escape key closes it (document keydown listener)
 *  - Clicking the dim backdrop closes it (event.target === event.currentTarget)
 *  - Page behind stops scrolling (document.body.style)
 *  - Focus moves into the dialog on open and back to the trigger on close
 */
export default function Modal({ open, onClose, labelledBy, children }) {
  const boxRef = useRef(null);

  useKeyDown('Escape', onClose, open);
  useLockBodyScroll(open);

  useEffect(() => {
    if (!open) return undefined;
    const previouslyFocused = document.activeElement;
    boxRef.current?.focus();
    return () => previouslyFocused?.focus?.();
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="modal-overlay show"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
        ✕
      </button>
      <div ref={boxRef} className="modal-box" role="dialog" aria-modal="true" aria-labelledby={labelledBy} tabIndex={-1}>
        {children}
      </div>
    </div>
  );
}
