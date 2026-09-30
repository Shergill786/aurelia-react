import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../components/common/EmptyState';
import FormField from '../components/common/FormField';
import { Breadcrumb, PageHero } from '../components/common/PageHeader';
import { useShop } from '../context/contexts';
import { useToast } from '../context/contexts';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { formatINR } from '../utils/format';
import { checkoutRules, validate } from '../utils/validation';
import { SummaryRows } from './Cart';

const PAYMENT_METHODS = [
  { value: 'Card', label: '💳 Credit / Debit Card' },
  { value: 'UPI', label: 'Ⓟ UPI' },
  { value: 'Net Banking', label: '🏦 Net Banking' },
  { value: 'Cash on Delivery', label: '💵 Cash on Delivery' },
];

const COUNTRIES = ['India', 'United States', 'United Kingdom', 'Canada', 'Australia'];

const EMPTY_FORM = { fullName: '', email: '', address: '', city: '', zip: '', phone: '', country: 'India' };

/**
 * Checkout — a controlled form: every input's value lives in `form` state,
 * errors live in `errors` state, and nothing is saved until validation passes.
 */
export default function Checkout() {
  useDocumentTitle('Checkout');
  const { cart, totals, placeOrder } = useShop();
  const showToast = useToast();
  const navigate = useNavigate();
  const formRef = useRef(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [payment, setPayment] = useState(PAYMENT_METHODS[0].value);
  const [placedOrder, setPlacedOrder] = useState(null);

  // One change handler for every input, using the input's `name`.
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((err) => ({ ...err, [name]: '' })); // clear error while typing
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const found = validate(form, checkoutRules);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      showToast('Please check the highlighted fields', 'error');
      // DOM: move keyboard focus to the first field with an error.
      formRef.current?.querySelector(`[name="${Object.keys(found)[0]}"]`)?.focus();
      return;
    }
    const { fullName, email, city, country } = form;
    const order = placeOrder({ name: fullName, email, city, country }, payment);
    if (order) setPlacedOrder(order);
  };

  if (placedOrder) {
    return (
      <div className="success-modal show" role="dialog" aria-modal="true" aria-labelledby="success-title">
        <div className="success-box">
          <div className="success-check" aria-hidden="true">
            ✓
          </div>
          <h2 id="success-title" style={{ fontFamily: 'var(--font-display)' }}>
            Order Placed!
          </h2>
          <p style={{ color: 'var(--text-dim)', margin: '14px 0 28px' }}>
            Thank you for shopping with Aurelia. Order <strong>{placedOrder.id}</strong> for {formatINR(placedOrder.total, 2)} is confirmed, and a
            confirmation has been sent to {placedOrder.shipTo.email}.
          </p>
          <button type="button" className="btn btn-gold" onClick={() => navigate('/orders')} autoFocus>
            View My Orders
          </button>
        </div>
      </div>
    );
  }

  const field = (name, label, props = {}) => (
    <FormField id={name} label={label} error={errors[name]} full={props.full}>
      <input
        id={name}
        name={name}
        value={form[name]}
        onChange={handleChange}
        aria-invalid={Boolean(errors[name])}
        aria-describedby={`${name}-error`}
        {...props.input}
      />
    </FormField>
  );

  return (
    <>
      <Breadcrumb items={[{ label: 'Home', to: '/home' }, { label: 'Cart', to: '/cart' }, { label: 'Checkout' }]} />
      <PageHero title="Checkout" />

      <section className="section" style={{ paddingTop: 20 }}>
        <div className="container">
          {cart.length === 0 ? (
            <EmptyState icon="🛒" title="Your cart is empty" text="Add something to your cart before checking out." actionTo="/shop" actionLabel="Continue Shopping" />
          ) : (
            <div className="checkout-layout">
              <form id="checkoutForm" ref={formRef} onSubmit={handleSubmit} noValidate aria-labelledby="shipping-title">
                <h2 id="shipping-title" style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: 20 }}>
                  Shipping Details
                </h2>
                <div className="form-grid">
                  {field('fullName', 'Full Name', { full: true, input: { placeholder: 'Jane Doe', autoComplete: 'name' } })}
                  {field('email', 'Email Address', { full: true, input: { type: 'email', placeholder: 'you@example.com', autoComplete: 'email' } })}
                  {field('address', 'Street Address', { full: true, input: { placeholder: '221B, MG Road', autoComplete: 'street-address' } })}
                  {field('city', 'City', { input: { placeholder: 'Mumbai', autoComplete: 'address-level2' } })}
                  {field('zip', 'PIN / Postal Code', { input: { placeholder: '400001', autoComplete: 'postal-code', inputMode: 'numeric' } })}
                  {field('phone', 'Phone Number', { input: { type: 'tel', placeholder: '+91 98765 43210', autoComplete: 'tel' } })}
                  <FormField id="country" label="Country">
                    <select id="country" name="country" value={form.country} onChange={handleChange}>
                      {COUNTRIES.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </FormField>
                </div>

                <fieldset className="pay-fieldset">
                  <legend>Payment Method</legend>
                  <div className="pay-methods" id="payMethods">
                    {PAYMENT_METHODS.map((m) => (
                      <label key={m.value} className={`pay-method ${payment === m.value ? 'active' : ''}`}>
                        <input type="radio" name="payment" value={m.value} checked={payment === m.value} onChange={() => setPayment(m.value)} /> {m.label}
                      </label>
                    ))}
                  </div>
                </fieldset>

                <button type="submit" className="btn btn-gold btn-block" style={{ marginTop: 26 }}>
                  Place Order · {formatINR(totals.total, 2)}
                </button>
              </form>

              <aside className="summary-box" aria-labelledby="checkout-summary-title">
                <h2 id="checkout-summary-title" style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: 20 }}>
                  Order Summary
                </h2>
                <ul style={{ listStyle: 'none' }} id="checkoutSummary">
                  {cart.map((item) => (
                    <li key={item.key} className="summary-row">
                      <span>
                        {item.name}
                        {item.options?.size ? ` (${item.options.size})` : ''} × {item.qty}
                      </span>
                      <span>{formatINR(item.price * item.qty, 2)}</span>
                    </li>
                  ))}
                </ul>
                <SummaryRows totals={totals} />
              </aside>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
