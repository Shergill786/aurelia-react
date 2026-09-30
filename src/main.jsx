import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { initRipple } from './dom/ripple';

// Global styles — order matters: design system → page styles → fixes/extras.
import './styles/style.css';
import './styles/home.css';
import './styles/product.css';
import './styles/cart.css';
import './styles/login.css';
import './styles/extras.css';
import './styles/responsive.css';

// Plain-DOM enhancement: click ripple on every .btn (see src/dom/ripple.js).
initRipple();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
