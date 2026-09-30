import { useEffect, useState } from 'react';

/**
 * useLocalStorage — useState that is also saved in the browser.
 *
 *   const [cart, setCart] = useLocalStorage('aurelia_cart', []);
 *
 * - The initial value is read once from localStorage (lazy initialiser).
 * - useEffect writes the value back every time it changes.
 * - try/catch keeps the app working in private mode or when storage is full.
 */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved !== null ? JSON.parse(saved) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      if (value === null || value === undefined) localStorage.removeItem(key);
      else localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage unavailable — keep working with in-memory state */
    }
  }, [key, value]);

  return [value, setValue];
}
