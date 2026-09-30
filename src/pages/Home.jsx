import { useState } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/home/Hero';
import { BrandMarquee, CategoryGrid, Countdown, NewsletterBlock, WhyAurelia } from '../components/home/HomeSections';
import { SectionHead } from '../components/common/PageHeader';
import ProductSlider from '../components/product/ProductSlider';
import QuickViewModal from '../components/product/QuickViewModal';
import { PRODUCTS } from '../data/products';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { discountPercent } from '../utils/format';

// Derived lists (computed once when the module loads).
const TRENDING = [...PRODUCTS].sort((a, b) => b.rating - a.rating || b.reviews - a.reviews).slice(0, 10);
const NEW_ARRIVALS = [...PRODUCTS].sort((a, b) => b.id - a.id).slice(0, 10);
const FLASH_SALE = PRODUCTS.filter((p) => discountPercent(p.price, p.oldPrice) >= 25).slice(0, 10);

export default function Home() {
  useDocumentTitle('');
  const [quickView, setQuickView] = useState(null);

  return (
    <>
      <Hero />
      <BrandMarquee />
      <CategoryGrid />

      <section className="section section-alt" aria-labelledby="trending-title">
        <div className="container">
          <SectionHead eyebrow="Most Loved" title="Trending Now" id="trending-title">
            <Link to="/shop?sort=rating" className="btn btn-outline btn-sm">
              View All
            </Link>
          </SectionHead>
          <ProductSlider products={TRENDING} label="Trending products" onQuickView={setQuickView} />
        </div>
      </section>

      <section className="section" aria-labelledby="flash-title">
        <div className="container">
          <div className="flash-sale">
            <div className="flash-head">
              <div>
                <span className="eyebrow">Limited Time</span>
                <h2 id="flash-title">Flash Sale — 25% Off & More</h2>
              </div>
              <Countdown />
            </div>
            <ProductSlider products={FLASH_SALE} label="Flash sale products" onQuickView={setQuickView} />
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="new-title" style={{ paddingTop: 0 }}>
        <div className="container">
          <SectionHead eyebrow="Just Landed" title="New Arrivals" id="new-title">
            <Link to="/shop?sort=newest" className="btn btn-outline btn-sm">
              View All
            </Link>
          </SectionHead>
          <ProductSlider products={NEW_ARRIVALS} label="New arrivals" onQuickView={setQuickView} />
        </div>
      </section>

      <WhyAurelia />
      <NewsletterBlock />

      <QuickViewModal product={quickView} onClose={() => setQuickView(null)} />
    </>
  );
}
