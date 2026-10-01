import { useCallback, useEffect, useState } from "react";
import { loginUser, registerUser, SESSION_EXPIRED_EVENT } from "../utils/api";
import { AuthContext, useToast } from "./contexts";

/** Read the saved user once at start-up (bad JSON clears the saved session). */
function readSavedUser() {
  try {
    const saved = localStorage.getItem("user");
    return saved && localStorage.getItem("token") ? JSON.parse(saved) : null;
  } catch {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    return null;
  }
}

/**
 * AuthProvider — the signed-in user, backed by the Aurelia server.
 * The JWT token and user are kept in localStorage so a refresh stays signed in.
 * If the server ever rejects the token (expired, or JWT_SECRET changed),
 * api.js fires SESSION_EXPIRED_EVENT and we sign the user out here.
 */
export function AuthProvider({ children }) {
  const showToast = useToast();
  const [user, setUser] = useState(readSavedUser);

  const saveSession = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
  };

  const login = async (email, password) => {
    const data = await loginUser(email, password);
    saveSession(data);
    return data;
  };

  const register = async (name, email, password) => {
    const data = await registerUser(name, email, password);
    saveSession(data);
    return data;
  };

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }, []);

  // Sign out automatically when the server says the token is no good.
  useEffect(() => {
    const onExpired = () => {
      logout();
      showToast?.("Your session has expired — please sign in again", "error");
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  }, [logout, showToast]);

  const value = {
    user,
    login,
    register,
    logout,
    isAuthenticated: Boolean(user),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}