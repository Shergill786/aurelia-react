import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Breadcrumb, PageHero } from '../components/common/PageHeader';
import FilterPanel, { PRICE_MAX } from '../components/product/FilterPanel';
import ProductGrid from '../components/product/ProductGrid';
import QuickViewModal from '../components/product/QuickViewModal';
import { PRODUCTS } from '../data/products';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { matchesSearch } from '../utils/search';

const SORTERS = {
  featured: null, // catalogue order
  'price-asc': (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
  newest: (a, b) => b.id - a.id,
  rating: (a, b) => b.rating - a.rating,
};

/** Build the starting filters from the URL, e.g. /shop?section=Men&type=Activewear */
function filtersFromParams(params) {
  return {
    search: params.get('search') || params.get('q') || '',
    sections: params.get('section') ? [params.get('section')] : [],
    types: params.get('type') ? [params.get('type')] : [],
    brands: [],
    rating: 0,
    maxPrice: PRICE_MAX,
  };
}

/** Pure function: which products pass the current filters, in which order. */
function applyFilters(products, filters, sort) {
  const list = products.filter(
    (p) =>
      matchesSearch(p, filters.search) &&
      (filters.sections.length === 0 || filters.sections.includes(p.section)) &&
      (filters.types.length === 0 || filters.types.includes(p.type)) &&
      (filters.brands.length === 0 || filters.brands.includes(p.brand)) &&
      p.rating >= filters.rating &&
      p.price <= filters.maxPrice,
  );
  const sorter = SORTERS[sort];
  return sorter ? [...list].sort(sorter) : list;
}

/**
 * Shop — reads the URL (?search=, ?section=, ?type=, ?sort=) and renders the
 * view with key={URL}. When the URL changes while you're already on /shop
 * (a new navbar search, a footer "Men" link), the key changes, so React
 * mounts a fresh ShopView whose state starts from the new URL.
 */
export default function Shop() {
  useDocumentTitle('Shop All Products');
  const [params] = useSearchParams();
  return <ShopView key={params.toString()} params={params} />;
}

function ShopView({ params }) {
  const [filters, setFilters] = useState(() => filtersFromParams(params));
  const [sort, setSort] = useState(() => (SORTERS[params.get('sort')] !== undefined ? params.get('sort') : 'featured'));
  const [quickView, setQuickView] = useState(null);

  // useMemo: re-filter only when filters or sort actually change.
  const results = useMemo(() => applyFilters(PRODUCTS, filters, sort), [filters, sort]);

  const clearFilters = () => {
    setFilters(filtersFromParams(new URLSearchParams()));
    setSort('featured');
  };

  return (
    <>
      <Breadcrumb items={[{ label: 'Home', to: '/home' }, { label: 'Shop' }]} />
      <PageHero eyebrow="Full Catalogue" title="Shop All Products" />

      <section className="section" style={{ paddingTop: 20 }} aria-label="Products">
        <div className="container shop-layout">
          <FilterPanel filters={filters} onChange={setFilters} onClear={clearFilters} />

          <div>
            <div className="shop-toolbar">
              <p className="result-count" id="resultCount" aria-live="polite">
                {results.length} product{results.length !== 1 ? 's' : ''} found
              </p>
              <label htmlFor="sortSelect" className="visually-hidden">
                Sort products
              </label>
              <select id="sortSelect" className="sort-select" value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="featured">Sort by: Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="newest">Newest First</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
            <ProductGrid products={results} onQuickView={setQuickView} />
          </div>
        </div>
      </section>

      <QuickViewModal product={quickView} onClose={() => setQuickView(null)} />
    </>
  );
}
