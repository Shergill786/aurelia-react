import { Link } from 'react-router-dom';

/**
 * Breadcrumb — "Home / Shop / Product" trail.
 * items: [{ label, to? }] — the last item is the current page (no link).
 */
export function Breadcrumb({ items }) {
  return (
    <nav className="container" aria-label="Breadcrumb">
      <ol className="breadcrumb" style={{ listStyle: 'none', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={item.label}>
              {item.to && !last ? <Link to={item.to}>{item.label}</Link> : <span aria-current={last ? 'page' : undefined}>{item.label}</span>}
              {!last && <span aria-hidden="true"> /</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * PageHero — the heading block at the top of inner pages.
 *   <PageHero eyebrow="Our Story" title="Crafted for Every Wardrobe" subtitle="..." />
 */
export function PageHero({ eyebrow, title, subtitle }) {
  return (
    <header className="page-hero" style={{ paddingTop: 0 }}>
      <div className="container">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {subtitle && <p style={{ color: 'var(--text-dim)', maxWidth: 620, margin: '16px auto 0' }}>{subtitle}</p>}
      </div>
    </header>
  );
}

/**
 * SectionHead — eyebrow + section title, optionally with something on the right.
 */
export function SectionHead({ eyebrow, title, id, children, className = '' }) {
  return (
    <div className={`section-head ${className}`.trim()}>
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2 className="section-title" id={id}>
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}
