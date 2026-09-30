import { Link } from 'react-router-dom';

/**
 * EmptyState — friendly message for empty cart / wishlist / orders / no results.
 *
 *   <EmptyState icon="🛒" title="Your cart is empty"
 *               text="Looks like you haven't added anything yet."
 *               actionTo="/shop" actionLabel="Continue Shopping" />
 */
export default function EmptyState({ icon, title, text, actionTo, actionLabel, style }) {
  return (
    <div className="empty-state" style={style}>
      <div className="icon-big" aria-hidden="true">
        {icon}
      </div>
      <h2 style={{ fontSize: '1.4rem' }}>{title}</h2>
      {text && <p style={{ color: 'var(--text-dim)', margin: '12px 0 24px' }}>{text}</p>}
      {actionTo && (
        <Link to={actionTo} className="btn btn-primary">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
