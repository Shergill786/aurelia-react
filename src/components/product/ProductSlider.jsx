import { useRef } from 'react';
import ProductCard from './ProductCard';

/**
 * ProductSlider — horizontal row of product cards with ‹ › buttons.
 * useRef gives direct access to the scrolling <div> so the buttons can call
 * the DOM method element.scrollBy().
 */
export default function ProductSlider({ products, label, onQuickView }) {
  const trackRef = useRef(null);
  const scroll = (direction) => trackRef.current?.scrollBy({ left: direction * 300, behavior: 'smooth' });

  return (
    <div className="hslider-wrap">
      <button type="button" className="hslider-nav prev" onClick={() => scroll(-1)} aria-label={`Scroll ${label} left`}>
        ‹
      </button>
      <div className="hslider" ref={trackRef} role="region" aria-label={label} tabIndex={0}>
        {products.map((p) => (
          <ProductCard key={p.id} product={p} onQuickView={onQuickView} />
        ))}
      </div>
      <button type="button" className="hslider-nav next" onClick={() => scroll(1)} aria-label={`Scroll ${label} right`}>
        ›
      </button>
    </div>
  );
}
