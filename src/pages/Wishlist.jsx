import { useState } from 'react';
import EmptyState from '../components/common/EmptyState';
import { Breadcrumb, PageHero } from '../components/common/PageHeader';
import ProductGrid from '../components/product/ProductGrid';
import QuickViewModal from '../components/product/QuickViewModal';
import { useShop } from '../context/contexts';
import { PRODUCTS } from '../data/products';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

/**
 * Wishlist — because the list comes from ShopContext state, un-wishing a
 * card re-renders this page and the card disappears straight away.
 */
export default function Wishlist() {
  useDocumentTitle('Your Wishlist');
  const { wishlist } = useShop();
  const [quickView, setQuickView] = useState(null);
  const items = PRODUCTS.filter((p) => wishlist.includes(p.id));

  return (
    <>
      <Breadcrumb items={[{ label: 'Home', to: '/home' }, { label: 'Wishlist' }]} />
      <PageHero title="Your Wishlist" subtitle={items.length ? `${items.length} saved item${items.length > 1 ? 's' : ''}` : undefined} />
      <section className="section" style={{ paddingTop: 20 }}>
        <div className="container" id="wishlistWrap">
          {items.length === 0 ? (
            <EmptyState icon="♡" title="Your wishlist is empty" text="Save items you love and find them here later." actionTo="/shop" actionLabel="Browse Products" />
          ) : (
            <ProductGrid products={items} className="wishlist-grid product-grid" onQuickView={setQuickView} />
          )}
        </div>
      </section>
      <QuickViewModal product={quickView} onClose={() => setQuickView(null)} />
    </>
  );
}
