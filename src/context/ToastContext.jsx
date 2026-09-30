import { useCallback, useRef, useState } from 'react';
import { ToastContext } from './contexts';

const ICONS = { check: '✓', cart: '🛍', heart: '♥', error: '!' };
const TOAST_MS = 3100;

/**
 * ToastProvider — small pop-up notifications ("Added to cart").
 * Any component can call showToast(message, icon) via the useToast() hook.
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(1);

  const showToast = useCallback((message, icon = 'check') => {
    const id = nextId.current++;
    setToasts((list) => [...list, { id, message, icon }]);
    // Remove this toast again after its animation finishes.
    setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), TOAST_MS);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {/* aria-live makes screen readers announce new toasts */}
      <div id="toastContainer" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className="toast">
            <span aria-hidden="true">{ICONS[t.icon] || ICONS.check}</span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

