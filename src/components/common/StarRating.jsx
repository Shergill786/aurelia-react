/**
 * StarRating — shows filled/empty stars for a 0–5 rating plus the numbers.
 *
 *   <StarRating rating={4.6} reviews={98} />  ->  ★★★★★ 4.6 (98)
 */
export default function StarRating({ rating, reviews, reviewsLabel = '', className = 'pc-rating' }) {
  const full = Math.round(rating);
  return (
    <div className={className}>
      <span className="stars" aria-hidden="true">
        {'★'.repeat(full)}
        {'☆'.repeat(5 - full)}
      </span>
      <span className="visually-hidden">Rated {rating} out of 5.</span>{' '}
      {reviews !== undefined && (
        <span>
          {rating} ({reviews}
          {reviewsLabel && ` ${reviewsLabel}`})
        </span>
      )}
    </div>
  );
}
