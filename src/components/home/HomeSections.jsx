import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BRANDS, TYPES } from '../../data/products';
import { CATEGORY_CARDS } from '../../data/siteImages';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { isEmail } from '../../utils/validation';
import { SectionHead } from '../common/PageHeader';
import Reveal from '../common/Reveal';

/* ---------------------------------------------------------------------------
 * BrandMarquee — scrolling strip of brand names (pure CSS animation).
 * The list is rendered twice so the loop never shows a gap.
 * ------------------------------------------------------------------------- */
export function BrandMarquee() {
  const names = BRANDS.map((b) => b.toUpperCase());
  return (
    <div className="marquee-wrap" aria-label="Our brands">
      <div className="marquee-track">
        {[...names, ...names].map((name, i) => (
          <span key={`${name}-${i}`} aria-hidden={i >= names.length}>
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * CategoryGrid — Men / Women / Kids cards + clothing-type pills.
 * ------------------------------------------------------------------------- */
const CATEGORIES = CATEGORY_CARDS;

export function CategoryGrid() {
  return (
    <section className="section" id="categories" aria-labelledby="categories-title">
      <div className="container">
        <Reveal>
          <SectionHead eyebrow="Browse" title="Top Categories" id="categories-title" />
        </Reveal>
        <div className="cat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          {CATEGORIES.map((c) => (
            <Reveal key={c.section}>
              <Link className="cat-card" to={`/shop?section=${c.section}`} style={{ display: 'block' }}>
                <img src={c.img} alt={c.alt} loading="lazy" />
                <span className="overlay">{c.section}</span>
              </Link>
            </Reveal>
          ))}
        </div>
        <div className="tag-row">
          {TYPES.map((type) => (
            <Link key={type} to={`/shop?type=${encodeURIComponent(type)}`} className="tag-pill">
              {type}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------------
 * Countdown — ticks every second with setInterval inside useEffect.
 * The end time is saved so a refresh doesn't restart the sale.
 * ------------------------------------------------------------------------- */
const SALE_LENGTH_MS = (6 * 3600 + 24 * 60 + 10) * 1000;
const pad = (n) => String(n).padStart(2, '0');

export function Countdown() {
  const [endsAt, setEndsAt] = useLocalStorage('aurelia_flash_end', 0);
  const [now, setNow] = useState(() => Date.now());

  // Start (or restart) the sale window if there isn't a live one.
  useEffect(() => {
    if (!endsAt || endsAt < Date.now()) setEndsAt(Date.now() + SALE_LENGTH_MS);
  }, [endsAt, setEndsAt]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id); // stop ticking when the component unmounts
  }, []);

  const left = Math.max(0, endsAt - now);
  const parts = [
    { value: Math.floor(left / 3600000), label: 'Hrs' },
    { value: Math.floor((left % 3600000) / 60000), label: 'Min' },
    { value: Math.floor((left % 60000) / 1000), label: 'Sec' },
  ];

  return (
    <div className="countdown" role="timer" aria-label="Time left in the flash sale">
      {parts.map((p) => (
        <div key={p.label}>
          <span className="val">{pad(p.value)}</span>
          <span className="lbl">{p.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * WhyAurelia — four value cards, data-driven with map().
 * ------------------------------------------------------------------------- */
const REASONS = [
  { icon: '🚚', title: 'Free Delivery', text: 'On every order over ₹4,999, delivered in 3–5 business days.' },
  { icon: '↩', title: '30-Day Returns', text: 'Changed your mind? Send it back, no questions asked.' },
  { icon: '🔒', title: 'Secure Checkout', text: 'Cards, UPI, net banking or cash on delivery.' },
  { icon: '✂️', title: 'Considered Craft', text: 'Every pattern is cut for how people actually move.' },
];

export function WhyAurelia() {
  return (
    <section className="section section-alt" aria-labelledby="why-title">
      <div className="container">
        <Reveal>
          <SectionHead eyebrow="The Aurelia Promise" title="Why Shop With Us" id="why-title" />
        </Reveal>
        <div className="why-grid">
          {REASONS.map((r) => (
            <Reveal as="article" key={r.title} className="why-card">
              <div className="why-icon" aria-hidden="true">
                {r.icon}
              </div>
              <h3 style={{ fontSize: '1.05rem' }}>{r.title}</h3>
              <p style={{ color: 'var(--text-dim)', fontSize: '.9rem', marginTop: 8 }}>{r.text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------------
 * NewsletterBlock — controlled email input; confirms in place (no page reload).
 * ------------------------------------------------------------------------- */
export function NewsletterBlock() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'error' | 'done'

  const handleSubmit = (e) => {
    e.preventDefault(); // stop the browser's default full-page form submit
    setStatus(isEmail(email) ? 'done' : 'error');
  };

  return (
    <section className="section" aria-labelledby="newsletter-title">
      <div className="container">
        <Reveal zoom className="newsletter-block">
          <h2 id="newsletter-title">Join the Inner Circle</h2>
          <p>Get early access to drops, private sales and style edits — straight to your inbox.</p>
          {status === 'done' ? (
            <p role="status" style={{ fontWeight: 600 }}>
              ✓ You&rsquo;re on the list — watch your inbox for early access.
            </p>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <label htmlFor="newsletterEmail" className="visually-hidden">
                Email address
              </label>
              <input
                id="newsletterEmail"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setStatus('idle');
                }}
                aria-invalid={status === 'error'}
                aria-describedby="newsletterError"
              />
              <button type="submit">Subscribe</button>
            </form>
          )}
          {status === 'error' && (
            <p id="newsletterError" role="alert" style={{ marginTop: 12 }}>
              Please enter a valid email address.
            </p>
          )}
        </Reveal>
      </div>
    </section>
  );
}
