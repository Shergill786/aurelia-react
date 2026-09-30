import { useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PRODUCTS } from '../../data/products';
import { useClickOutside } from '../../hooks/useEvents';
import { formatINR } from '../../utils/format';
import { matchesSearch } from '../../utils/search';


/**
 * SearchBox — navbar search with live suggestions.
 * Typing updates state → suggestions re-render; Enter goes to the Shop page
 * with ?search=...; clicking outside closes the list.
 */
export default function SearchBox() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);
  const navigate = useNavigate();

  useClickOutside(boxRef, () => setOpen(false));

  // useMemo: only re-filter 119 products when the query actually changes.
  const suggestions = useMemo(
    () => (query.trim() ? PRODUCTS.filter((p) => matchesSearch(p, query)).slice(0, 6) : []),
    [query],
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    setOpen(false);
    navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
  };

  const close = () => {
    setOpen(false);
    setQuery('');
  };

  return (
    <form className="nav-search" role="search" onSubmit={handleSubmit} ref={boxRef}>
      <label htmlFor="navSearchInput" className="visually-hidden">
        Search products
      </label>
      <input
        type="search"
        id="navSearchInput"
        placeholder="Search for products, brands..."
        autoComplete="off"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
      />
      <span className="icon" aria-hidden="true">
        ⌕
      </span>
      {open && query.trim() && (
        <div id="searchSuggestions" style={{ display: 'block' }}>
          {suggestions.length === 0 ? (
            <span style={{ display: 'block', padding: '10px 16px', fontSize: '.86rem' }}>No matches found</span>
          ) : (
            suggestions.map((p) => (
              <Link key={p.id} to={`/product/${p.id}`} onClick={close}>
                <span>{p.name}</span>
                <span style={{ color: 'var(--text-dim)' }}>{formatINR(p.price)}</span>
              </Link>
            ))
          )}
        </div>
      )}
    </form>
  );
}
