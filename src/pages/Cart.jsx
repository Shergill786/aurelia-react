import { useState } from 'react';
import { Link } from 'react-router-dom';
import EmptyState from '../components/common/EmptyState';
import { Breadcrumb, PageHero } from '../components/common/PageHeader';
import QuantitySelector from '../components/common/QuantitySelector';
import { useShop } from '../context/contexts';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { COUPONS, FREE_SHIP_THRESHOLD } from '../utils/cart';
import { formatINR } from '../utils/format';

/** Readable size / colour for a cart line. */
function LineOptions({ options }) {
  if (!options?.size && !options?.color) return 'Standard';
  return (
    <>
      {options.size && `Size ${options.size}`}
      {options.size && options.color && ' · '}
      {options.color && (
        <span
          title="Colour"
          aria-label="Colour"
          style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', verticalAlign: -1, background: options.color, boxShadow: '0 0 0 1px var(--border)' }}
        />
      )}
    </>
  );
}

/** CartItem — one line in the cart. Receives the item and callbacks as props. */
function CartItem({ item, onQtyChange, onRemove }) {
  return (
    <li className="cart-item">
      <img src={item.img} alt={item.name} />
      <div>
        <h2 className="ci-name" style={{ fontSize: '1rem' }}>
          <Link to={`/product/${item.id}`}>{item.name}</Link>
        </h2>
        <div className="ci-meta">
          <LineOptions options={item.options} />
        </div>
        <QuantitySelector value={item.qty} onChange={(q) => onQtyChange(item.key, q - item.qty)} label={`Quantity of ${item.name}`} />
        <button type="button" className="ci-remove" onClick={() => onRemove(item.key)}>
          Remove
        </button>
      </div>
      <div />
      <div className="ci-price">
        <del className="old">{formatINR(item.oldPrice * item.qty)}</del>
        {formatINR(item.price * item.qty)}
      </div>
    </li>
  );
}

/** Coupon form — local state for the input and the message under it. */
function CouponForm() {
  const { coupon, applyCoupon } = useShop();
  const [code, setCode] = useState(coupon || '');
  const [message, setMessage] = useState(coupon ? { ok: true, text: `Coupon applied — ${COUPONS[coupon] * 100}% off` } : null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const ok = applyCoupon(code);
    const upper = code.trim().toUpperCase();
    setMessage(ok ? { ok, text: `Coupon applied — ${COUPONS[upper] * 100}% off` } : { ok, text: 'Invalid coupon code' });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="coupon-row">
        <label htmlFor="couponInput" className="visually-hidden">
          Coupon code
        </label>
        <input id="couponInput" type="text" placeholder="Coupon code (try AURELIA10)" value={code} onChange={(e) => setCode(e.target.value)} />
        <button type="submit" className="btn btn-outline btn-sm">
          Apply
        </button>
      </div>
      <p id="couponMsg" role="status" style={{ fontSize: '.8rem', margin: '-10px 0 20px', color: message?.ok ? 'var(--success)' : 'var(--sale)' }}>
        {message?.text}
      </p>
    </form>
  );
}

/** OrderSummary — reused on the Cart page (totals come from computeTotals). */
export function SummaryRows({ totals }) {
  return (
    <dl style={{ margin: 0 }}>
      <div className="summary-row">
        <dt>Subtotal</dt>
        <dd id="sumSubtotal">{formatINR(totals.subtotal, 2)}</dd>
      </div>
      {totals.discount > 0 && (
        <div className="summary-row">
          <dt>Discount ({totals.coupon})</dt>
          <dd>-{formatINR(totals.discount, 2)}</dd>
        </div>
      )}
      <div className="summary-row">
        <dt>GST (18%)</dt>
        <dd>{formatINR(totals.gst, 2)}</dd>
      </div>
      <div className="summary-row">
        <dt>Shipping</dt>
        <dd>{totals.shipping === 0 ? 'Free' : formatINR(totals.shipping, 2)}</dd>
      </div>
      <div className="summary-row total">
        <dt>Total</dt>
        <dd id="sumTotal">{formatINR(totals.total, 2)}</dd>
      </div>
    </dl>
  );
}

export default function Cart() {
  useDocumentTitle('Your Cart');
  const { cart, totals, changeQty, removeFromCart } = useShop();

  return (
    <>
      <Breadcrumb items={[{ label: 'Home', to: '/home' }, { label: 'Your Cart' }]} />
      <PageHero title="Your Cart" />

      <section className="section" style={{ paddingTop: 20 }}>
        <div className="container">
          {cart.length === 0 ? (
            <EmptyState icon="🛒" title="Your cart is empty" text="Looks like you haven't added anything yet." actionTo="/shop" actionLabel="Continue Shopping" />
          ) : (
            <div className="cart-layout">
              <ul style={{ listStyle: 'none' }} aria-label="Items in your cart">
                {cart.map((item) => (
                  <CartItem key={item.key} item={item} onQtyChange={changeQty} onRemove={removeFromCart} />
                ))}
              </ul>

              <aside className="summary-box" aria-labelledby="summary-title">
                <h2 id="summary-title" style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: 20 }}>
                  Order Summary
                </h2>
                <SummaryRows totals={totals} />
                <p id="shipMsg" style={{ fontSize: '.78rem', color: 'var(--text-dim)', margin: '8px 0 16px' }}>
                  {totals.shipping === 0 ? 'Free shipping applied' : `Add ${formatINR(FREE_SHIP_THRESHOLD - totals.subtotal, 2)} more for free shipping`}
                </p>
                <CouponForm />
                <Link to="/checkout" className="btn btn-gold btn-block">
                  Proceed to Checkout
                </Link>
                <Link to="/shop" className="btn btn-ghost btn-block" style={{ marginTop: 10 }}>
                  Continue Shopping
                </Link>
              </aside>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
