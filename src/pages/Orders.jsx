import EmptyState from '../components/common/EmptyState';
import { Breadcrumb, PageHero } from '../components/common/PageHeader';
import { useShop } from '../context/contexts';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { formatINR } from '../utils/format';

const STEPS = ['Placed', 'Processing', 'Shipped', 'Delivered'];
const STEPS_DONE = { processing: 2, transit: 3, delivered: 4 };

/** OrderCard — one past order with its tracking steps. */
function OrderCard({ order }) {
  const done = STEPS_DONE[order.status] ?? 1;
  const itemCount = order.items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <article className="order-card" aria-labelledby={`order-${order.id}`}>
      <header className="order-top">
        <div>
          <h2 id={`order-${order.id}`} style={{ fontSize: '1rem' }}>
            Order {order.id}
          </h2>
          <div style={{ fontSize: '.8rem', color: 'var(--text-dim)' }}>
            {order.date}
            {order.payment && ` · Paid by ${order.payment}`}
          </div>
        </div>
        <span className={`order-status ${order.status}`}>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
      </header>

      <ol className="order-track" style={{ listStyle: 'none' }} aria-label="Delivery progress">
        {STEPS.map((step, i) => (
          <li key={step} className={`track-step ${i < done ? 'done' : ''}`}>
            <div className="track-dot" aria-hidden="true" />
            <span>
              {step}
              {i < done && <span className="visually-hidden"> (done)</span>}
            </span>
          </li>
        ))}
      </ol>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 10 }}>
        {order.items.map((i) => (
          <img key={i.key} src={i.img} alt={i.name} title={i.name} style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8 }} />
        ))}
      </div>

      <footer style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
        <span style={{ color: 'var(--text-dim)' }}>{itemCount} item(s)</span>
        <strong>{formatINR(order.total, 2)}</strong>
      </footer>
    </article>
  );
}

export default function Orders() {
  useDocumentTitle('My Orders');
  const { orders } = useShop();

  return (
    <>
      <Breadcrumb items={[{ label: 'Home', to: '/home' }, { label: 'My Orders' }]} />
      <PageHero title="My Orders" />
      <section className="section" style={{ paddingTop: 20 }}>
        <div className="container" id="ordersWrap">
          {orders.length === 0 ? (
            <EmptyState icon="📦" title="No orders yet" text="Once you place an order, it will show up here." actionTo="/shop" actionLabel="Start Shopping" />
          ) : (
            orders.map((order) => <OrderCard key={order.id} order={order} />)
          )}
        </div>
      </section>
    </>
  );
}
