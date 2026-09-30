import EmptyState from '../components/common/EmptyState';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

/** NotFound — shown for any URL that doesn't match a route. */
export default function NotFound() {
  useDocumentTitle('Page not found');
  return (
    <section className="section">
      <EmptyState icon="🧭" title="Page not found" text="The page you're looking for doesn't exist or has moved." actionTo="/home" actionLabel="Back to Home" />
    </section>
  );
}
