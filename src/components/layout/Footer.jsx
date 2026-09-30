import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../context/contexts';
import { isEmail } from '../../utils/validation';
import { Logo } from './Navbar';

const YEAR = new Date().getFullYear();

const FOOTER_COLUMNS = [
  {
    title: 'Shop',
    links: [
      { to: '/shop', label: 'All Products' },
      { to: '/shop?section=Men', label: 'Men' },
      { to: '/shop?section=Women', label: 'Women' },
      { to: '/shop?section=Kids', label: 'Kids' },
    ],
  },
  {
    title: 'Company',
    links: [
      { to: '/about', label: 'About Us' },
      { to: '/contact', label: 'Contact' },
    ],
  },
  {
    title: 'Support',
    links: [
      { to: '/orders', label: 'Track Order' },
      { to: '/contact#faq', label: 'FAQs' },
    ],
  },
];

/** Footer newsletter — controlled input + validation, confirms with a toast. */
function NewsletterForm() {
  const [email, setEmail] = useState('');
  const showToast = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isEmail(email)) {
      showToast('Please enter a valid email address', 'error');
      return;
    }
    showToast('Subscribed successfully!');
    setEmail('');
  };

  return (
    <form className="newsletter-form" onSubmit={handleSubmit} noValidate>
      <label htmlFor="footerEmail" className="visually-hidden">
        Email address
      </label>
      <input id="footerEmail" type="email" placeholder="Your email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <button type="submit">Join</button>
    </form>
  );
}

export default function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Logo style={{ color: '#fff' }} />
            <p>A premium clothing destination for men, women and kids — curated for the modern lifestyle.</p>
          </div>

          {FOOTER_COLUMNS.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="footer-heading">
                {column.title}
              </h2>
              <ul>
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div>
            <h2 className="footer-heading">Newsletter</h2>
            <NewsletterForm />
          </div>
        </div>
        <div className="footer-bottom">
          <small>© {YEAR} Aurelia. All rights reserved.</small>
        </div>
      </div>
    </footer>
  );
}
