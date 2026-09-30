import { formatINR } from '../../utils/format';

/**
 * Price — current price with the original price struck through.
 *
 *   <Price price={8399} oldPrice={10699} />
 */
export default function Price({ price, oldPrice, className = 'pc-price' }) {
  return (
    <div className={className}>
      <span className="now">{formatINR(price)}</span>
      {oldPrice > price && (
        <>
          <span className="visually-hidden">, was </span>
          <del className="old">{formatINR(oldPrice)}</del>
        </>
      )}
    </div>
  );
}
