import EmptyState from '../common/EmptyState';
import ProductCard from './ProductCard';

/**
 * ProductGrid — renders a list of products as cards.
 * Uses Array.map() with a stable `key` (the product id) so React can
 * update only the cards that changed when filters change.
 */
export default function ProductGrid({ products, onQuickView, className = 'product-grid', emptyTitle = 'No products found' }) {
  if (products.length === 0) {
    return (
      <div className={className}>
        <EmptyState icon="🔍" title={emptyTitle} text="Try adjusting your filters or search term." style={{ gridColumn: '1 / -1' }} />
      </div>
    );
  }

  return (
    <div className={className}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onQuickView={onQuickView} />
      ))}
    </div>
  );
}
