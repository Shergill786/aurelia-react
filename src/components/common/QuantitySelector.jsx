/**
 * QuantitySelector — "− 1 +" stepper. A controlled component: the parent owns
 * the number and passes it down as `value`; clicks call `onChange(newValue)`.
 */
export default function QuantitySelector({ value, onChange, min = 1, max = 20, label = 'Quantity' }) {
  return (
    <div className="qty-selector" role="group" aria-label={label}>
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label="Decrease quantity">
        −
      </button>
      <input type="text" value={value} readOnly aria-live="polite" aria-label={label} />
      <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label="Increase quantity">
        +
      </button>
    </div>
  );
}
