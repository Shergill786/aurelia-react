import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth, useShop, useTheme } from '../../context/contexts';
import { useKeyDown, useLockBodyScroll } from '../../hooks/useEvents';
import { useScroll } from '../../hooks/useScroll';
import SearchBox from './SearchBox';

/** Main links — one array feeds both the desktop nav and the mobile drawer. */
const NAV_LINKS = [
  { to: '/home', label: 'Home' },
  { to: '/shop', label: 'Shop' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
  { to: '/orders', label: 'Orders' },
];

const DRAWER_EXTRA = [
  { to: '/wishlist', label: 'Wishlist' },
  { to: '/cart', label: 'Cart' },
];

/** Logo — reused in the navbar and footer. */
export function Logo({ style }) {
  return (
    <Link to="/home" className="logo" style={style} aria-label="Aurelia home">
      AUR<span>ELIA</span>
    </Link>
  );
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const dark = theme === 'dark';
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-pressed={dark}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title="Toggle dark mode"
    >
      <span className="knob" />
    </button>
  );
}

/** Icon link with a live count badge (cart / wishlist). */
function IconLink({ to, icon, label, count }) {
  return (
    <Link to={to} className="nav-icon" title={label} aria-label={count !== undefined ? `${label} (${count} items)` : label}>
      <span aria-hidden="true">{icon}</span>
      {count !== undefined && (
        <span className="badge" aria-hidden="true">
          {count}
        </span>
      )}
    </Link>
  );
}

function MobileDrawer({ open, onClose, accountLabel }) {
  useKeyDown('Escape', onClose, open);
  useLockBodyScroll(open);
  return (
    <>
      <div className={`drawer-overlay ${open ? 'show' : ''}`} onClick={onClose} aria-hidden="true" />
      <nav id="navDrawer" className={`nav-drawer ${open ? 'open' : ''}`} aria-label="Mobile" aria-hidden={!open} inert={open ? undefined : true}>
        <button type="button" className="nav-drawer-close" onClick={onClose} aria-label="Close menu">
          ✕
        </button>
        {[...NAV_LINKS, ...DRAWER_EXTRA, { to: '/login', label: accountLabel }].map((link) => (
          <NavLink key={link.to} to={link.to} end={link.to === '/home'} onClick={onClose}>
            {link.label}
          </NavLink>
        ))}
      </nav>
    </>
  );
}

/**
 * Navbar — sticky site header: logo, links, search, theme switch, badges.
 * Reads cart/wishlist counts from ShopContext, so badges update instantly.
 */
export default function Navbar() {
  const { cartCount, wishlist } = useShop();
  const { user } = useAuth();
  const { y } = useScroll();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <header className={`navbar ${y > 10 ? 'scrolled' : ''}`}>
        <div className="container nav-inner">
          <Logo />

          <nav className="nav-links" aria-label="Main">
            {NAV_LINKS.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.to === '/home'}>
                {link.label}
              </NavLink>
            ))}
          </nav>

          <SearchBox />

          <div className="nav-icons">
            <ThemeToggle />
            <IconLink to="/wishlist" icon="♡" label="Wishlist" count={wishlist.length} />
            <IconLink to="/cart" icon="🛍" label="Cart" count={cartCount} />
            {/* Signed in: show the shopper's initial; the /login page then offers Sign Out */}
            <IconLink to="/login" icon={user ? <span className="nav-avatar">{user.name.charAt(0)}</span> : '☺'} label={user ? `Account — signed in as ${user.name}` : 'Sign in'} />
            <button
              type="button"
              className="hamburger"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
              aria-expanded={drawerOpen}
              aria-controls="navDrawer"
            >
              ☰
            </button>
          </div>
        </div>
      </header>
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} accountLabel={user ? `Account (${user.name})` : 'Login'} />
    </>
  );
}
