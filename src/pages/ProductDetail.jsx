import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import EmptyState from '../components/common/EmptyState';
import FaqItem from '../components/common/FaqItem';
import { Breadcrumb, SectionHead } from '../components/common/PageHeader';
import QuantitySelector from '../components/common/QuantitySelector';
import StarRating from '../components/common/StarRating';
import ProductGrid from '../components/product/ProductGrid';
import { useShop } from '../context/contexts';
import { getProductById, PRODUCTS } from '../data/products';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { discountPercent, formatINR } from '../utils/format';

const TABS = ['Description', 'Specifications', 'Reviews', 'FAQ'];

/**
 * ImageGallery — main image with click-to-zoom + thumbnails.
 * DOM manipulation: on mousemove we read the cursor position with
 * getBoundingClientRect() and set the image's transform-origin directly
 * through a ref, so zoom follows the cursor without re-rendering React.
 */
function ImageGallery({ images, alt }) {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const imgRef = useRef(null);

  const handleMove = (e) => {
    if (!zoomed || !imgRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    imgRef.current.style.transformOrigin = `${x}% ${y}%`;
  };

  return (
    <div>
      <button
        type="button"
        className={`pd-gallery-main ${zoomed ? 'zoomed' : ''}`}
        onClick={() => setZoomed((z) => !z)}
        onMouseMove={handleMove}
        onMouseLeave={() => setZoomed(false)}
        aria-label={zoomed ? 'Zoom out' : 'Zoom in'}
        style={{ display: 'block', width: '100%', padding: 0 }}
      >
        <img id="pdMainImage" ref={imgRef} src={images[active]} alt={alt} />
      </button>
      <div className="pd-thumbs" role="group" aria-label="Product images">
        {images.map((src, i) => (
          <button key={i} type="button" onClick={() => setActive(i)} aria-label={`Show image ${i + 1}`} aria-pressed={i === active} style={{ padding: 0 }}>
            <img src={src} alt="" className={i === active ? 'active' : ''} />
          </button>
        ))}
      </div>
    </div>
  );
}

/** Colour swatches or size pills — a single-choice group controlled by the parent. */
function OptionPicker({ label, options, value, onChange, renderOption, className }) {
  return (
    <div className="option-row">
      <h2 id={`${label}-label`}>
        {label}
      </h2>
      <div className={className} role="radiogroup" aria-labelledby={`${label}-label`}>
        {options.map((opt, i) => renderOption(opt, i, opt === value, () => onChange(opt)))}
      </div>
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const product = getProductById(id);
  useDocumentTitle(product ? product.name : 'Product not found');

  if (!product) {
    return (
      <>
        <Breadcrumb items={[{ label: 'Home', to: '/home' }, { label: 'Shop', to: '/shop' }, { label: 'Not found' }]} />
        <EmptyState
          icon="🔍"
          title="We couldn't find that product"
          text="It may have been removed, or the link is incorrect."
          actionTo="/shop"
          actionLabel="Browse All Products"
          style={{ padding: '80px 0' }}
        />
      </>
    );
  }

  // key={product.id} resets all the local state (size, qty, tab...) when
  // you open a related product from this same page.
  return <ProductView key={product.id} product={product} />;
}

function ProductView({ product }) {
  const { addToCart, isWishlisted, toggleWishlist } = useShop();
  const navigate = useNavigate();
  const [color, setColor] = useState(product.colors[0]);
  const [size, setSize] = useState(product.sizes[0]);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState(TABS[0]);
  const wished = isWishlisted(product.id);

  const related = [
    ...PRODUCTS.filter((p) => p.section === product.section && p.type === product.type && p.id !== product.id),
    ...PRODUCTS.filter((p) => p.section === product.section && p.type !== product.type),
  ].slice(0, 4);

  const add = () => addToCart(product.id, qty, { size, color });
  const buyNow = () => {
    add();
    navigate('/cart');
  };

  return (
    <>
      <Breadcrumb items={[{ label: 'Home', to: '/home' }, { label: 'Shop', to: '/shop' }, { label: product.name }]} />

      <article className="container" aria-labelledby="pdTitle">
        <div className="pd-layout">
          <ImageGallery images={[product.img, product.img, product.img]} alt={product.name} />

          <div>
            <span className="pd-cat">
              {product.section} · {product.type} · {product.brand}
            </span>
            <h1 className="pd-title" id="pdTitle">
              {product.name}
            </h1>
            <StarRating className="pd-rating" rating={product.rating} reviews={product.reviews} reviewsLabel="reviews" />
            <div className="pd-price-row">
              <span className="now" id="pdPrice">
                {formatINR(product.price)}
              </span>
              <del className="old">{formatINR(product.oldPrice)}</del>
              <span className="off">{discountPercent(product.price, product.oldPrice)}% OFF</span>
            </div>
            <p className="pd-desc">{product.desc}</p>

            <OptionPicker
              label="Colour"
              className="swatches"
              options={product.colors}
              value={color}
              onChange={setColor}
              renderOption={(c, i, selected, select) => (
                <button
                  key={c}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={`Colour ${i + 1}`}
                  className={`swatch ${selected ? 'active' : ''}`}
                  style={{ background: c }}
                  onClick={select}
                />
              )}
            />
            <OptionPicker
              label="Size"
              className="size-pills"
              options={product.sizes}
              value={size}
              onChange={setSize}
              renderOption={(s, i, selected, select) => (
                <button key={s} type="button" role="radio" aria-checked={selected} className={`size-pill ${selected ? 'active' : ''}`} onClick={select}>
                  {s}
                </button>
              )}
            />
            <div className="option-row">
              <h2>Quantity</h2>
              <QuantitySelector value={qty} onChange={setQty} />
            </div>

            <div className="pd-actions">
              <button type="button" className="btn btn-primary" onClick={add} id="pdAddCart">
                Add to Cart
              </button>
              <button type="button" className="btn btn-gold" onClick={buyNow}>
                Buy Now
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => toggleWishlist(product.id)} aria-pressed={wished}>
                {wished ? '♥ Wishlisted' : '♡ Wishlist'}
              </button>
            </div>

            <ul className="pd-meta-list" style={{ listStyle: 'none' }}>
              <li>🚚 Free delivery in 3–5 business days on orders over ₹4,999.</li>
              <li>↩ 30-day hassle-free returns.</li>
              <li>🔒 Secure payment — all major cards accepted.</li>
            </ul>
          </div>
        </div>

        {/* Tabs: state `tab` decides which panel is visible */}
        <div className="pd-tabs" role="tablist" aria-label="Product information">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              id={`tab-${t}`}
              aria-selected={tab === t}
              aria-controls={`panel-${t}`}
              className={`pd-tab ${tab === t ? 'active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="pd-tab-panel active" role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
          {tab === 'Description' && (
            <p style={{ color: 'var(--text-dim)', maxWidth: 760, lineHeight: 1.8 }}>
              {product.desc} Every Aurelia piece is quality-checked twice before it ships, so what arrives at your door matches exactly what you saw on screen.
            </p>
          )}
          {tab === 'Specifications' && (
            <table className="spec-table">
              <caption className="visually-hidden">Product specifications</caption>
              <tbody>
                {[
                  ['Brand', product.brand],
                  ['Section', product.section],
                  ['Style', product.type],
                  ['Category', product.cat],
                  ['Available sizes', product.sizes.join(', ')],
                  ['Material', 'Premium sourced materials, cruelty-free'],
                  ['Warranty', '1-year limited manufacturer warranty'],
                ].map(([k, v]) => (
                  <tr key={k}>
                    <th scope="row">
                      {k}
                    </th>
                    <td>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {tab === 'Reviews' && (
            <div className="review-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
              <blockquote className="review-card">
                <div className="review-stars">★★★★★</div>
                <p className="review-quote">&ldquo;Exceeded expectations — the finish is fantastic for the price.&rdquo;</p>
                <footer className="review-user">
                  <strong>Verified buyer</strong>
                </footer>
              </blockquote>
              <blockquote className="review-card">
                <div className="review-stars">★★★★☆</div>
                <p className="review-quote">&ldquo;Great product overall, sizing ran slightly small so consider going up.&rdquo;</p>
                <footer className="review-user">
                  <strong>Verified buyer</strong>
                </footer>
              </blockquote>
            </div>
          )}
          {tab === 'FAQ' && (
            <>
              <FaqItem question="What is your return policy?" answer="You can return any item within 30 days of delivery for a full refund, provided it's unused and in its original packaging." />
              <FaqItem question="How long does delivery take?" answer="Standard delivery takes 3–5 business days. Express options are available at checkout." />
              <FaqItem question="Is this item covered by warranty?" answer="Yes, all Aurelia products include a 1-year limited manufacturer warranty against defects." />
            </>
          )}
        </div>

        <section aria-labelledby="related-title" style={{ marginTop: 70 }}>
          <SectionHead eyebrow="You Might Also Like" title="Related Products" id="related-title" />
          <ProductGrid products={related} className="product-grid" />
        </section>
        <div style={{ marginBottom: 80 }} />
      </article>
    </>
  );
}
