import { useInView } from '../../hooks/useAnimations';

/**
 * Reveal — fades its children in the first time they scroll into view.
 *
 * Props:
 *   as        which HTML element to render (default "div"), e.g. "section", "article"
 *   zoom      use the zoom-in animation instead of slide-up
 *   className extra classes
 *
 *   <Reveal as="article" className="why-card">...</Reveal>
 */
export default function Reveal({ as: Tag = 'div', zoom = false, className = '', children, ...rest }) {
  const [ref, inView] = useInView();
  const base = zoom ? 'reveal-zoom' : 'reveal';
  return (
    <Tag ref={ref} className={`${base} ${inView ? 'in' : ''} ${className}`.trim()} {...rest}>
      {children}
    </Tag>
  );
}
