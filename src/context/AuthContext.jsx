import { useLocalStorage } from '../hooks/useLocalStorage';
import { AuthContext } from './contexts';

/** "jane.doe@mail.com" -> "Jane" (used to greet the shopper). */
function nameFromEmail(email) {
  const first = email.split('@')[0].split(/[._-]/)[0];
  return first.charAt(0).toUpperCase() + first.slice(1);
}

/**
 * AuthProvider — who is signed in (front-end demo: nothing is sent to a server).
 * `user` is null when signed out, or { name, email } when signed in.
 * Saved in localStorage so a refresh keeps you signed in.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useLocalStorage('aurelia_user', null);

  const signIn = (email, name) => {
    const clean = email.trim();
    setUser({ email: clean, name: name?.trim() || nameFromEmail(clean) });
  };

  const signOut = () => setUser(null);

  return <AuthContext.Provider value={{ user, signIn, signOut }}>{children}</AuthContext.Provider>;
}
