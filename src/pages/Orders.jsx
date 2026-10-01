// src/pages/Orders.jsx

import EmptyState from '../components/common/EmptyState';
import {
  Breadcrumb,
  PageHero,
} from '../components/common/PageHeader';

import { useShop } from '../context/contexts';

import { useDocumentTitle } from '../hooks/useDocumentTitle';

import { normalizeCart } from '../utils/cart';
import { formatINR } from '../utils/format';


// =========================================================
// ORDER STATUS
// =========================================================

const STEPS = [
  'Placed',
  'Processing',
  'Shipped',
  'Delivered',
];


const STEPS_DONE = {
  processing: 2,
  transit: 3,
  shipped: 3,
  delivered: 4,
};


// =========================================================
// ORDER CARD
// =========================================================

function OrderCard({
  order,
}) {
  const done =
    STEPS_DONE[
      order.status
    ] ?? 1;


  const items =
    normalizeCart(
      Array.isArray(
        order.items
      )
        ? order.items
        : []
    );


  const itemCount =
    items.reduce(
      (sum, item) =>
        sum +
        (Number(
          item.qty
        ) || 0),
      0
    );


  return (
    <article
      className="order-card"
      aria-labelledby={`order-${order.id}`}
    >

      {/* =================================================
          ORDER HEADER
      ================================================= */}

      <header className="order-top">

        <div>

          <h2
            id={`order-${order.id}`}
            style={{
              fontSize: '1rem',
            }}
          >
            Order {order.id}
          </h2>


          <div
            style={{
              fontSize: '.8rem',
              color:
                'var(--text-dim)',
            }}
          >

            {order.date}

            {order.payment &&
              ` · Paid by ${order.payment}`}

          </div>

        </div>


        <span
          className={`order-status ${order.status}`}
        >
          {String(
            order.status ||
              'processing'
          )
            .charAt(0)
            .toUpperCase() +
            String(
              order.status ||
                'processing'
            ).slice(1)}
        </span>

      </header>


      {/* =================================================
          DELIVERY PROGRESS
      ================================================= */}

      <ol
        className="order-track"
        style={{
          listStyle:
            'none',
        }}
        aria-label="Delivery progress"
      >

        {STEPS.map(
          (step, i) => (

            <li
              key={step}
              className={`track-step ${
                i < done
                  ? 'done'
                  : ''
              }`}
            >

              <div
                className="track-dot"
                aria-hidden="true"
              />


              <span>

                {step}

                {i < done && (
                  <span className="visually-hidden">
                    {' '}
                    (done)
                  </span>
                )}

              </span>

            </li>

          )
        )}

      </ol>


      {/* =================================================
          ORDER ITEMS
      ================================================= */}

      {items.length > 0 && (

        <div
          style={{
            display: 'flex',
            flexWrap:
              'wrap',
            gap: 14,
            marginTop: 10,
          }}
        >

          {items.map(
            (item) => (

              <div
                key={
                  item.key ||
                  item.dbId ||
                  item.id
                }
                style={{
                  position:
                    'relative',
                }}
              >

                <img
                  src={
                    item.img ||
                    ''
                  }
                  alt={
                    item.name ||
                    'Ordered product'
                  }
                  title={
                    item.name ||
                    'Ordered product'
                  }
                  style={{
                    width: 56,
                    height: 56,
                    objectFit:
                      'cover',
                    borderRadius: 8,
                  }}
                />


                {item.qty >
                  1 && (

                  <span
                    style={{
                      position:
                        'absolute',
                      right: -6,
                      bottom: -6,
                      minWidth: 20,
                      height: 20,
                      padding:
                        '0 5px',
                      display:
                        'inline-flex',
                      alignItems:
                        'center',
                      justifyContent:
                        'center',
                      borderRadius:
                        999,
                      background:
                        'var(--gold)',
                      color:
                        '#111',
                      fontSize:
                        '.7rem',
                      fontWeight:
                        700,
                    }}
                  >
                    ×{item.qty}
                  </span>

                )}

              </div>

            )
          )}

        </div>

      )}


      {/* =================================================
          ORDER FOOTER
      ================================================= */}

      <footer
        style={{
          display:
            'flex',
          justifyContent:
            'space-between',
          alignItems:
            'center',
          gap: 16,
          marginTop: 16,
          paddingTop: 16,
          borderTop:
            '1px solid var(--border)',
        }}
      >

        <span
          style={{
            color:
              'var(--text-dim)',
          }}
        >
          {itemCount}{' '}
          item
          {itemCount !==
          1
            ? 's'
            : ''}
        </span>


        <strong>
          {formatINR(
            order.total,
            2
          )}
        </strong>

      </footer>

    </article>
  );
}


// =========================================================
// ORDERS PAGE
// =========================================================

export default function Orders() {

  useDocumentTitle(
    'My Orders'
  );


  const {
    orders,
    ordersLoading,
  } = useShop();


  // Make sure we always
  // work with an array.
  const safeOrders =
    Array.isArray(orders)
      ? orders
      : [];


  return (
    <>
      <Breadcrumb
        items={[
          {
            label: 'Home',
            to: '/home',
          },
          {
            label: 'My Orders',
          },
        ]}
      />


      <PageHero
        title="My Orders"
      />


      <section
        className="section"
        style={{
          paddingTop: 20,
        }}
      >

        <div
          className="container"
          id="ordersWrap"
        >

          {/* =================================================
              LOADING
          ================================================= */}

          {ordersLoading ? (

            <div
              style={{
                minHeight: 220,
                display:
                  'flex',
                alignItems:
                  'center',
                justifyContent:
                  'center',
                color:
                  'var(--text-dim)',
                textAlign:
                  'center',
              }}
              aria-live="polite"
            >

              <div>

                <div
                  style={{
                    fontSize:
                      '2rem',
                    marginBottom:
                      10,
                  }}
                  aria-hidden="true"
                >
                  📦
                </div>

                Loading your orders…

              </div>

            </div>

          ) : safeOrders.length ===
            0 ? (

            /* =================================================
                EMPTY
            ================================================= */

            <EmptyState
              icon="📦"
              title="No orders yet"
              text="Once you place an order, it will show up here."
              actionTo="/shop"
              actionLabel="Start Shopping"
            />

          ) : (

            /* =================================================
                ORDERS
            ================================================= */

            safeOrders.map(
              (order) => (

                <OrderCard
                  key={
                    order.id
                  }
                  order={
                    order
                  }
                />

              )
            )

          )}

        </div>

      </section>
    </>
  );
}