import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import EmptyState from '../components/common/EmptyState';
import FormField from '../components/common/FormField';
import { Breadcrumb, PageHero } from '../components/common/PageHeader';

import { useShop, useToast } from '../context/contexts';

import { useDocumentTitle } from '../hooks/useDocumentTitle';

import { formatINR } from '../utils/format';
import { checkoutRules, validate } from '../utils/validation';

import { SummaryRows } from './Cart';


const PAYMENT_METHODS = [
  {
    value: 'Card',
    label: '💳 Credit / Debit Card',
  },
  {
    value: 'UPI',
    label: 'Ⓟ UPI',
  },
  {
    value: 'Net Banking',
    label: '🏦 Net Banking',
  },
  {
    value: 'Cash on Delivery',
    label: '💵 Cash on Delivery',
  },
];


const COUNTRIES = [
  'India',
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
];


const EMPTY_FORM = {
  fullName: '',
  email: '',
  address: '',
  city: '',
  zip: '',
  phone: '',
  country: 'India',
};


/**
 * Checkout page
 *
 * Handles:
 * - Shipping details
 * - Payment method
 * - Form validation
 * - Order placement
 * - Order success screen
 */
export default function Checkout() {
  useDocumentTitle('Checkout');

  const {
    cart,
    totals,
    placeOrder,
  } = useShop();

  const showToast = useToast();

  const navigate = useNavigate();

  const formRef = useRef(null);

  const [form, setForm] = useState(EMPTY_FORM);

  const [errors, setErrors] = useState({});

  const [payment, setPayment] = useState(
    PAYMENT_METHODS[0].value
  );

  const [placedOrder, setPlacedOrder] = useState(null);


  /* =========================================================
     HANDLE INPUT CHANGE
     ========================================================= */

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((current) => ({
        ...current,
        [name]: '',
      }));
    }
  };


  /* =========================================================
     HANDLE CHECKOUT
     ========================================================= */

  const handleSubmit = (e) => {
    e.preventDefault();

    const found = validate(
      form,
      checkoutRules
    );

    setErrors(found);

    /* Validation failed */
    if (Object.keys(found).length > 0) {
      showToast(
        'Please check the highlighted fields',
        'error'
      );

      const firstError =
        Object.keys(found)[0];

      formRef.current
        ?.querySelector(
          `[name="${firstError}"]`
        )
        ?.focus();

      return;
    }


    /* Create shipping object */
    const {
      fullName,
      email,
      address,
      city,
      zip,
      phone,
      country,
    } = form;


    const shippingDetails = {
      name: fullName,
      email,
      address,
      city,
      zip,
      phone,
      country,
    };


    /* Place order */
    const order = placeOrder(
      shippingDetails,
      payment
    );


    if (order) {
      setPlacedOrder(order);
    }
  };


  /* =========================================================
     SUCCESS SCREEN
     ========================================================= */

  if (placedOrder) {
    return (
      <div
        className="success-modal show"
        role="dialog"
        aria-modal="true"
        aria-labelledby="success-title"
      >
        <div className="success-box">

          <div
            className="success-check"
            aria-hidden="true"
          >
            ✓
          </div>


          <h2 id="success-title">
            Order Placed!
          </h2>


          <p>
            Thank you for shopping with Aurelia.

            {' '}

            Order{' '}
            <strong>
              {placedOrder.id}
            </strong>

            {' '}

            for{' '}

            <strong>
              {formatINR(
                placedOrder.total,
                2
              )}
            </strong>

            {' '}

            is confirmed, and a confirmation
            has been sent to{' '}

            <strong>
              {placedOrder.shipTo.email}
            </strong>.
          </p>


          <button
            type="button"
            className="btn btn-gold"
            onClick={() =>
              navigate('/orders')
            }
            autoFocus
          >
            View My Orders
          </button>

        </div>
      </div>
    );
  }


  /* =========================================================
     FORM FIELD HELPER
     ========================================================= */

  const field = (
    name,
    label,
    props = {}
  ) => (
    <FormField
      id={name}
      label={label}
      error={errors[name]}
      full={props.full}
    >
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


  /* =========================================================
     MAIN CHECKOUT PAGE
     ========================================================= */

  return (
    <>
      <Breadcrumb
        items={[
          {
            label: 'Home',
            to: '/home',
          },
          {
            label: 'Cart',
            to: '/cart',
          },
          {
            label: 'Checkout',
          },
        ]}
      />


      <PageHero title="Checkout" />


      <section
        className="section"
        style={{
          paddingTop: 20,
        }}
      >
        <div className="container">

          {cart.length === 0 ? (

            <EmptyState
              icon="🛒"
              title="Your cart is empty"
              text="Add something to your cart before checking out."
              actionTo="/shop"
              actionLabel="Continue Shopping"
            />

          ) : (

            <div className="checkout-layout">

              {/* =================================================
                  SHIPPING FORM
              ================================================= */}

              <form
                id="checkoutForm"
                ref={formRef}
                onSubmit={handleSubmit}
                noValidate
                aria-labelledby="shipping-title"
              >

                <h2
                  id="shipping-title"
                  style={{
                    fontFamily:
                      'var(--font-display)',
                    fontSize: '1.3rem',
                    marginBottom: 20,
                  }}
                >
                  Shipping Details
                </h2>


                <div className="form-grid">

                  {field(
                    'fullName',
                    'Full Name',
                    {
                      full: true,
                      input: {
                        placeholder:
                          'Jane Doe',
                        autoComplete:
                          'name',
                      },
                    }
                  )}


                  {field(
                    'email',
                    'Email Address',
                    {
                      full: true,
                      input: {
                        type: 'email',
                        placeholder:
                          'you@example.com',
                        autoComplete:
                          'email',
                      },
                    }
                  )}


                  {field(
                    'address',
                    'Street Address',
                    {
                      full: true,
                      input: {
                        placeholder:
                          '221B, MG Road',
                        autoComplete:
                          'street-address',
                      },
                    }
                  )}


                  {field(
                    'city',
                    'City',
                    {
                      input: {
                        placeholder:
                          'Mumbai',
                        autoComplete:
                          'address-level2',
                      },
                    }
                  )}


                  {field(
                    'zip',
                    'PIN / Postal Code',
                    {
                      input: {
                        placeholder:
                          '400001',
                        autoComplete:
                          'postal-code',
                        inputMode:
                          'numeric',
                      },
                    }
                  )}


                  {field(
                    'phone',
                    'Phone Number',
                    {
                      input: {
                        type: 'tel',
                        placeholder:
                          '+91 98765 43210',
                        autoComplete:
                          'tel',
                      },
                    }
                  )}


                  <FormField
                    id="country"
                    label="Country"
                  >
                    <select
                      id="country"
                      name="country"
                      value={form.country}
                      onChange={handleChange}
                    >
                      {COUNTRIES.map(
                        (country) => (
                          <option
                            key={country}
                            value={country}
                          >
                            {country}
                          </option>
                        )
                      )}
                    </select>
                  </FormField>

                </div>


                {/* =================================================
                    PAYMENT
                ================================================= */}

                <fieldset className="pay-fieldset">

                  <legend>
                    Payment Method
                  </legend>


                  <div
                    className="pay-methods"
                    id="payMethods"
                  >

                    {PAYMENT_METHODS.map(
                      (method) => (

                        <label
                          key={method.value}
                          className={`pay-method ${
                            payment === method.value
                              ? 'active'
                              : ''
                          }`}
                        >

                          <input
                            type="radio"
                            name="payment"
                            value={method.value}
                            checked={
                              payment ===
                              method.value
                            }
                            onChange={() =>
                              setPayment(
                                method.value
                              )
                            }
                          />

                          {' '}

                          {method.label}

                        </label>

                      )
                    )}

                  </div>

                </fieldset>


                {/* =================================================
                    PLACE ORDER BUTTON
                ================================================= */}

                <button
                  type="submit"
                  className="btn btn-gold btn-block"
                  style={{
                    marginTop: 26,
                  }}
                >
                  Place Order ·{' '}
                  {formatINR(
                    totals.total,
                    2
                  )}
                </button>

              </form>


              {/* =================================================
                  ORDER SUMMARY
              ================================================= */}

              <aside
                className="summary-box"
                aria-labelledby="checkout-summary-title"
              >

                <h2
                  id="checkout-summary-title"
                  style={{
                    fontFamily:
                      'var(--font-display)',
                    fontSize: '1.3rem',
                    marginBottom: 20,
                  }}
                >
                  Order Summary
                </h2>


                <ul
                  style={{
                    listStyle: 'none',
                  }}
                  id="checkoutSummary"
                >

                  {cart.map((item) => (

                    <li
                      key={item.key}
                      className="summary-row"
                    >

                      <span>

                        {item.name}

                        {item.options?.size
                          ? ` (${item.options.size})`
                          : ''}

                        {' × '}

                        {item.qty}

                      </span>


                      <span>
                        {formatINR(
                          item.price *
                            item.qty,
                          2
                        )}
                      </span>

                    </li>

                  ))}

                </ul>


                <SummaryRows
                  totals={totals}
                />

              </aside>

            </div>
          )}

        </div>
      </section>
    </>
  );
}