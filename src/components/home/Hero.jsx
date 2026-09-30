import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HERO_SLIDES } from '../../data/siteImages';
import { useTypewriter } from '../../hooks/useAnimations';

const SLIDES = HERO_SLIDES;

const HEADLINE_WORDS = ['softly.', 'boldly.', 'for you.'];
const SLIDE_MS = 4500;

const STATS = [
  { num: '120K+', label: 'Happy Customers' },
  { num: '4.8/5', label: 'Average Rating' },
  { num: '8', label: 'House Brands' },
];

/**
 * Hero — typing headline + auto-playing image slider.
 * State: `current` (which slide is showing). useEffect starts a timer that
 * advances the slide and clears it on cleanup — so clicking a dot restarts
 * the timer (current changes → effect re-runs).
 */
export default function Hero() {
  const [current, setCurrent] = useState(0);
  const typed = useTypewriter(HEADLINE_WORDS);

  useEffect(() => {
    const timer = setTimeout(() => setCurrent((c) => (c + 1) % SLIDES.length), SLIDE_MS);
    return () => clearTimeout(timer);
  }, [current]);

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-bg" aria-hidden="true" />
      <div className="container hero-inner">
        <div>
          <span className="hero-eyebrow">Autumn / Winter Collection</span>
          <h1 id="hero-title">
            Style that speaks <br />
            <span aria-hidden="true">{typed}</span>
            <span className="type-cursor" aria-hidden="true">
              &nbsp;
            </span>
            <span className="visually-hidden">softly, boldly, for you.</span>
          </h1>
          <p>
            Discover a curated edit of clothing for men, women and kids — handpicked for people who notice the details.
          </p>
          <div className="hero-actions">
            <Link to="/shop" className="btn btn-gold">
              Shop the Collection
            </Link>
            {/* DOM API: find the section and smooth-scroll to it */}
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Explore Categories
            </button>
          </div>
          <div className="hero-stats">
            {STATS.map((s) => (
              <div key={s.label}>
                <span className="num">{s.num}</span>
                <span className="label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="hero-visual" aria-roledescription="carousel" aria-label="Featured collections">
          {SLIDES.map((slide, i) => (
            <figure key={slide.img} className={`hero-slide ${i === current ? 'active' : ''}`} aria-hidden={i !== current}>
              <img src={slide.img} alt={slide.alt} />
              <figcaption className="cap">{slide.caption}</figcaption>
            </figure>
          ))}
          <div className="hero-dots">
            {SLIDES.map((slide, i) => (
              <button
                key={slide.img}
                type="button"
                className={i === current ? 'active' : ''}
                onClick={() => setCurrent(i)}
                aria-label={`Show slide ${i + 1}: ${slide.caption}`}
                aria-current={i === current}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
