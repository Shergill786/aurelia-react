import { useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

import { ThemeContext } from './contexts';

/**
 * ThemeProvider — light/dark theme for the whole app.
 * State lives here; useEffect copies it onto <html data-theme="..."> so the
 * CSS variables in style.css switch colours (a direct DOM update).
 */
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useLocalStorage('aurelia_theme', 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

