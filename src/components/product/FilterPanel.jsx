import { useState } from 'react';
import { BRANDS, SECTIONS, TYPES } from '../../data/products';
import { formatINR } from '../../utils/format';

export const PRICE_MIN = 2000;
export const PRICE_MAX = 10000;

/** A group of checkboxes bound to an array in the filters state. */
function CheckboxGroup({ legend, options, selected, onToggle }) {
  return (
    <fieldset className="filter-group">
      <legend className="filter-title">{legend}</legend>
      {options.map((option) => (
        <label key={option}>
          <input type="checkbox" checked={selected.includes(option)} onChange={() => onToggle(option)} /> {option}
        </label>
      ))}
    </fieldset>
  );
}

/**
 * FilterPanel — the Shop sidebar. Fully controlled: it receives the current
 * `filters` object and reports every change through `onChange(newFilters)`.
 * The Shop page owns the state; this component only displays it.
 */
export default function FilterPanel({ filters, onChange, onClear }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const update = (patch) => onChange({ ...filters, ...patch });

  // Add the value if missing, remove it if present.
  const toggleIn = (field) => (value) => {
    const list = filters[field];
    update({ [field]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value] });
  };

  return (
    <aside className={`filter-panel${mobileOpen ? ' is-open' : ''}`} aria-label="Product filters">
      <button
        type="button"
        className="filter-toggle"
        aria-expanded={mobileOpen}
        aria-controls="filter-panel-content"
        onClick={() => setMobileOpen((open) => !open)}
      >
        <span>Filters</span>
        <span aria-hidden="true">{mobileOpen ? '−' : '+'}</span>
      </button>

      <div id="filter-panel-content" className="filter-panel-content">
      <div className="filter-group">
        <label htmlFor="pageSearchInput" className="filter-title">
          Search
        </label>
        <input
          type="search"
          id="pageSearchInput"
          placeholder="Search products..."
          value={filters.search}
          onChange={(e) => update({ search: e.target.value })}
          style={{
            width: '100%',
            padding: '10px 14px',
            borderRadius: 8,
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            color: 'var(--text)',
          }}
        />
      </div>

      <CheckboxGroup legend="Shop By" options={SECTIONS} selected={filters.sections} onToggle={toggleIn('sections')} />
      <CheckboxGroup legend="Type" options={TYPES} selected={filters.types} onToggle={toggleIn('types')} />
      <CheckboxGroup legend="Brand" options={BRANDS} selected={filters.brands} onToggle={toggleIn('brands')} />

      <div className="filter-group">
        <label htmlFor="priceRange" className="filter-title">
          Price Range
        </label>
        <input
          type="range"
          id="priceRange"
          className="price-range"
          min={PRICE_MIN}
          max={PRICE_MAX}
          step="100"
          value={filters.maxPrice}
          onChange={(e) => update({ maxPrice: Number(e.target.value) })}
        />
        <div className="price-vals">
          <span>{formatINR(PRICE_MIN)}</span>
          <span>up to {formatINR(filters.maxPrice)}</span>
        </div>
      </div>

      <fieldset className="filter-group">
        <legend className="filter-title">Rating</legend>
        {[0, 4.5, 4, 3].map((r) => (
          <label key={r}>
            <input type="radio" name="rating" checked={filters.rating === r} onChange={() => update({ rating: r })} />{' '}
            {r === 0 ? 'Any rating' : `${r.toFixed(1)} & up`}
          </label>
        ))}
      </fieldset>

      <button type="button" className="btn btn-outline btn-block btn-sm" onClick={onClear}>
        Clear Filters
      </button>
      </div>
    </aside>
  );
}
