/**
 * ripple.js — "material" click ripple on every .btn, written in plain DOM
 * JavaScript (no React) to show core DOM manipulation:
 *
 *   1. Event delegation  — ONE listener on document handles clicks on every
 *                           button, including buttons React adds later.
 *   2. Traversal          — event.target.closest('.btn') finds the button.
 *   3. Measuring          — getBoundingClientRect() gives size and position.
 *   4. Creating elements  — document.createElement('span').
 *   5. Styling            — element.style.width / left / top.
 *   6. Inserting          — button.appendChild(circle).
 *   7. Removing           — circle.remove() once the animation ends.
 *
 * Called once from main.jsx. Returns a cleanup function that removes the listener.
 */
export function initRipple(root = document) {
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return () => {};

  const handleClick = (event) => {
    const button = event.target.closest('.btn');
    if (!button || button.disabled) return;

    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);

    const circle = document.createElement('span');
    circle.className = 'ripple-circle';
    circle.setAttribute('aria-hidden', 'true');
    circle.style.width = `${size}px`;
    circle.style.height = `${size}px`;
    // Keyboard "clicks" have no pointer position, so start from the centre.
    const x = event.clientX ? event.clientX - rect.left : rect.width / 2;
    const y = event.clientY ? event.clientY - rect.top : rect.height / 2;
    circle.style.left = `${x - size / 2}px`;
    circle.style.top = `${y - size / 2}px`;

    button.appendChild(circle);
    circle.addEventListener('animationend', () => circle.remove());
    setTimeout(() => circle.remove(), 800); // safety net if animationend never fires
  };

  root.addEventListener('click', handleClick);
  return () => root.removeEventListener('click', handleClick);
}
