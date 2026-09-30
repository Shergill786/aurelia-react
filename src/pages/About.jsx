import { Link } from 'react-router-dom';
import { PageHero, SectionHead } from '../components/common/PageHeader';
import Reveal from '../components/common/Reveal';
import { BRANDS } from '../data/products';
import { useCountUp, useInView } from '../hooks/useAnimations';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const VALUES = [
  { icon: '✂️', title: 'Considered Craft', text: 'Every pattern is cut for how people actually move, not just how they photograph.' },
  { icon: '🌿', title: 'Responsible Sourcing', text: "Natural fibres, low-impact dyes, and partner mills we've visited ourselves." },
  { icon: '👨‍👩‍👧', title: 'For the Whole Family', text: "Men's, women's and kids' collections designed to sit well together." },
  { icon: '↩', title: 'Stand-Behind Quality', text: '30-day returns and a 1-year warranty because we trust what we make.' },
];

const STATS = [
  { value: 120000, suffix: '+', label: 'Customers' },
  { value: 4800, suffix: '+', label: 'Garments Shipped Daily' },
  { value: BRANDS.length, suffix: '', label: 'House Brands' },
  { value: 98, suffix: '%', label: 'Satisfaction Rate' },
];

const TEAM = [
  { name: 'Daniel Cole', role: 'Founder & Creative Director', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80&auto=format&fit=crop', quote: "We design for the wardrobe you'll actually reach for — season after season." },
  { name: 'Amelia Rhodes', role: 'Head of Womenswear', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80&auto=format&fit=crop', quote: "Fabric first, trend second. That's how pieces earn a permanent place in your closet." },
  { name: 'Priya Shah', role: 'Head of Kidswear', img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80&auto=format&fit=crop', quote: "Kids don't care about trends — they care if it survives recess. So do we." },
];

/** StatCounter — counts up from 0 when scrolled into view (props: value, suffix, label). */
function StatCounter({ value, suffix, label }) {
  const [ref, inView] = useInView({ threshold: 0.5 });
  const current = useCountUp(value, inView);
  return (
    <div ref={ref}>
      <div className="stat-counter" aria-hidden="true">
        {current.toLocaleString('en-IN')}
        {suffix}
      </div>
      <p style={{ color: 'var(--text-dim)' }}>
        <span className="visually-hidden">
          {value.toLocaleString('en-IN')}
          {suffix}{' '}
        </span>
        {label}
      </p>
    </div>
  );
}

export default function About() {
  useDocumentTitle('About Us');
  return (
    <>
      <PageHero
        eyebrow="Our Story"
        title="Crafted for Every Wardrobe"
        subtitle="Aurelia began with a simple idea — that quality clothing for men, women and kids shouldn't mean compromising on craft, comfort, or conscience."
      />

      <section className="section" aria-labelledby="story-title">
        <div className="container story-grid">
          <Reveal>
            <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=900&q=80&auto=format&fit=crop" alt="Clothing rails in the Aurelia studio" loading="lazy" />
          </Reveal>
          <Reveal>
            <span className="eyebrow">Since 2018</span>
            <h2 className="section-title" id="story-title">
              A House Built on Fabric &amp; Detail
            </h2>
            <p style={{ color: 'var(--text-dim)', marginBottom: 18, lineHeight: 1.8 }}>
              What started as a small atelier making made-to-order jackets has grown into a full wardrobe destination — spanning tailored menswear,
              fluid womenswear, and playground-ready kidswear.
            </p>
            <p style={{ color: 'var(--text-dim)', lineHeight: 1.8 }}>
              Every Aurelia piece passes through the hands of people who genuinely care about stitching, drape, and how a garment feels after the
              fiftieth wash — not just the first.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section section-alt" aria-labelledby="values-title">
        <div className="container">
          <SectionHead eyebrow="What We Stand For" title="Our Values" id="values-title" />
          <div className="why-grid">
            {VALUES.map((v) => (
              <Reveal as="article" key={v.title} className="why-card">
                <div className="why-icon" aria-hidden="true">
                  {v.icon}
                </div>
                <h3 style={{ fontSize: '1.05rem' }}>{v.title}</h3>
                <p style={{ color: 'var(--text-dim)', fontSize: '.9rem', marginTop: 8 }}>{v.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 60 }} aria-label="Aurelia in numbers">
        <div className="container stats-strip">
          {STATS.map((s) => (
            <StatCounter key={s.label} {...s} />
          ))}
        </div>
      </section>

      <div className="ribbon-divider" aria-hidden="true" />

      <section className="section" aria-labelledby="team-title">
        <div className="container">
          <SectionHead eyebrow="The People Behind Aurelia" title="Meet the Team" id="team-title" />
          <div className="review-grid">
            {TEAM.map((person) => (
              <Reveal as="figure" key={person.name} className="review-card">
                <img src={person.img} alt={person.name} className="team-avatar" loading="lazy" />
                <figcaption>
                  <strong style={{ display: 'block', marginBottom: 2 }}>{person.name}</strong>
                  <span style={{ fontSize: '.8rem', color: 'var(--text-dim)' }}>{person.role}</span>
                </figcaption>
                <blockquote className="review-quote" style={{ marginTop: 14 }}>
                  &ldquo;{person.quote}&rdquo;
                </blockquote>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt" aria-labelledby="cta-title">
        <div className="container" style={{ textAlign: 'center' }}>
          <span className="eyebrow">Ready When You Are</span>
          <h2 className="section-title" id="cta-title">
            Explore the Full Collection
          </h2>
          <p className="section-sub" style={{ marginLeft: 'auto', marginRight: 'auto' }}>
            Men&rsquo;s, women&rsquo;s and kids&rsquo; clothing, all in one place.
          </p>
          <Link to="/shop" className="btn btn-gold">
            Shop Now
          </Link>
        </div>
      </section>
    </>
  );
}
