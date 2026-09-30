import { Link } from 'react-router-dom';
import { useShop } from '../../context/contexts';
import Modal from '../common/Modal';
import Price from '../common/Price';
import StarRating from '../common/StarRating';

/**
 * QuickViewModal — product preview without leaving the list.
 * `product` is null when closed; the parent owns that state.
 */
export default function QuickViewModal({ product, onClose }) {
  const { addToCart } = useShop();

  return (
    <Modal open={Boolean(product)} onClose={onClose} labelledBy="qv-title">
      {product && (
        <>
          <div className="modal-img">
            <img src={product.img} alt={product.name} />
          </div>
          <div className="modal-info">
            <span className="pc-cat">
              {product.section} · {product.brand}
            </span>
            <h3 id="qv-title">{product.name}</h3>
            <StarRating rating={product.rating} reviews={product.reviews} reviewsLabel="reviews" />
            <Price price={product.price} oldPrice={product.oldPrice} className="pc-price" />
            <p style={{ color: 'var(--text-dim)', margin: '14px 0 20px' }}>{product.desc}</p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  addToCart(product.id);
                  onClose();
                }}
              >
                Add to Cart
              </button>
              <Link to={`/product/${product.id}`} className="btn btn-ghost" onClick={onClose}>
                View Full Details
              </Link>
            </div>
          </div>
        </>
      )}
    </Modal>
  );
}
