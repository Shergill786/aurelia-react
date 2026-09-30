/**
 * contexts.js — the context objects and the hooks that read them.
 * Kept apart from the Provider components so each file exports one kind of
 * thing (components vs. plain functions), which keeps Fast Refresh working.
 *
 *   const { cart, addToCart } = useShop();
 */
import { createContext, useContext } from 'react';

export const ThemeContext = createContext(null);
export const ToastContext = createContext(null);
export const ShopContext = createContext(null);
export const AuthContext = createContext(null);

export const useTheme = () => useContext(ThemeContext);
export const useToast = () => useContext(ToastContext);
export const useShop = () => useContext(ShopContext);
export const useAuth = () => useContext(AuthContext);
