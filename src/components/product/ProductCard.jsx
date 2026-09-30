import { Link } from 'react-router-dom';
import { useShop } from '../../context/contexts';
import Price from '../common/Price';
import Reveal from '../common/Reveal';
import StarRating from '../common/StarRating';

/**
 * ProductCard — one product tile, reused on Home, Shop, Wishlist and Product pages.
 *
 * Props:
 *   product      the product object from data/products.js
 *   onQuickView  optional callback(product) — shows the "Quick View" button when given
 */
export default function ProductCard({ product, onQuickView }) {
  const { addToCart, isWishlisted, toggleWishlist } = useShop();
  const { id, name, img, badge, section, type, brand, rating, reviews, price, oldPrice } = product;
  const wished = isWishlisted(id);
  const url = `/product/${id}`;

  return (
    <Reveal as="article" className="product-card" aria-label={name}>
      <div className="pc-media">
        <Link to={url} tabIndex={-1} aria-hidden="true">
          <img src={img} alt={name} loading="lazy" width="600" height="750" />
        </Link>
        {badge && <span className="pc-badge">{badge}</span>}
        <button
          type="button"
          className={`pc-wish ${wished ? 'active' : ''}`}
          onClick={() => toggleWishlist(id)}
          aria-pressed={wished}
          aria-label={wished ? `Remove ${name} from wishlist` : `Add ${name} to wishlist`}
          title={wished ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          {wished ? '♥' : '♡'}
        </button>
        {onQuickView && (
          <div className="pc-quick">
            <button type="button" className="btn btn-ghost btn-sm btn-block" onClick={() => onQuickView(product)}>
              Quick View
            </button>
          </div>
        )}
      </div>

      <div className="pc-body">
        <span className="pc-cat">
          {section} · {type}
        </span>
        <h3 style={{ fontSize: 'inherit', fontWeight: 'inherit' }}>
          <Link to={url} className="pc-name">
            {name}
          </Link>
        </h3>
        <span style={{ fontSize: '.72rem', color: 'var(--text-dim)' }}>{brand}</span>
        <StarRating rating={rating} reviews={reviews} />
        <Price price={price} oldPrice={oldPrice} />
        <div className="pc-actions">
          <button type="button" className="btn btn-primary" onClick={() => addToCart(id)}>
            Add to Cart
          </button>
        </div>
      </div>
    </Reveal>
  );
}
