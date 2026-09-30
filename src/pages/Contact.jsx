import { useState } from 'react';
import FaqItem from '../components/common/FaqItem';
import FormField from '../components/common/FormField';
import { PageHero, SectionHead } from '../components/common/PageHeader';
import Reveal from '../components/common/Reveal';
import { useToast } from '../context/contexts';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { isEmail, validate } from '../utils/validation';

const CONTACT_CARDS = [
  [
    { icon: '📍', title: 'Visit Us', text: '42 Fenwick Lane, Mumbai, MH 400001, India', href: 'https://maps.google.com/?q=42+Fenwick+Lane,+Mumbai' },
    { icon: '📞', title: 'Call Us', text: '+91 98765 43210', href: 'tel:+919876543210', note: 'Mon–Sat, 9am–7pm IST' },
  ],
  [
    { icon: '✉️', title: 'Email Us', text: 'support@aurelia.example', href: 'mailto:support@aurelia.example', note: 'Replies within 24 hours' },
    { icon: '🎧', title: 'Live Chat', text: 'Available on every page', note: 'During business hours' },
  ],
];

const SUBJECTS = ['Order Enquiry', 'Sizing & Fit', 'Returns & Exchanges', 'Payment Issue', 'Wholesale / Bulk Orders', 'Other'];

const FAQS = [
  ['What are your delivery times?', 'Standard delivery takes 3–5 business days across India. Express options are available at checkout.'],
  ['Can I change or cancel my order?', 'Orders can be changed or cancelled within 1 hour of placement — just email us with your order ID.'],
  ['Do you ship internationally?', 'Yes, we ship to most countries. International delivery times and duties are shown at checkout.'],
  ['Do you offer bulk or wholesale pricing?', 'We do — choose "Wholesale / Bulk Orders" as the subject in the form above and our team will follow up.'],
];

const RULES = {
  name: (v) => (v.trim().length > 1 ? '' : 'Please enter your name'),
  email: (v) => (isEmail(v) ? '' : 'Please enter a valid email'),
  subject: (v) => (v ? '' : 'Please choose a subject'),
  message: (v) => (v.trim().length > 4 ? '' : 'Please enter a message (at least 5 characters)'),
};

const EMPTY = { name: '', email: '', phone: '', orderId: '', subject: '', message: '' };

function ContactCard({ items }) {
  return (
    <Reveal className="contact-card">
      {items.map((item, i) => (
        <div key={item.title} style={{ display: 'contents' }}>
          {i > 0 && <div className="divider" aria-hidden="true" />}
          <div className="contact-icon" aria-hidden="true">
            {item.icon}
          </div>
          <div className="contact-card-row">
            <h3>{item.title}</h3>
            {item.href ? (
              <a href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" style={{ color: 'var(--text-dim)', fontSize: '.9rem' }}>
                {item.text}
              </a>
            ) : (
              <span style={{ color: 'var(--text-dim)', fontSize: '.9rem' }}>{item.text}</span>
            )}
            {item.note && <span style={{ color: 'var(--text-dim)', fontSize: '.8rem' }}>{item.note}</span>}
          </div>
        </div>
      ))}
    </Reveal>
  );
}

export default function Contact() {
  useDocumentTitle('Contact Us');
  const showToast = useToast();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((err) => ({ ...err, [name]: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const found = validate(form, RULES);
    setErrors(found);
    if (Object.keys(found).length) {
      showToast('Please complete the required fields', 'error');
      // DOM: move keyboard focus to the first invalid field.
      document.getElementById(`contact-${Object.keys(found)[0]}`)?.focus();
      return;
    }
    showToast("Message sent — we'll be in touch soon!");
    setForm(EMPTY);
  };

  const input = (name, id, props = {}) => (
    <input id={id} name={name} value={form[name]} onChange={handleChange} aria-invalid={Boolean(errors[name])} aria-describedby={`${id}-error`} {...props} />
  );

  return (
    <>
      <PageHero
        eyebrow="We're Here to Help"
        title="Get in Touch"
        subtitle="Questions about an order, sizing, or a bulk enquiry? Reach out — a real person replies within one business day."
      />

      <section className="section" style={{ paddingTop: 20, paddingBottom: 0 }} aria-label="Contact details">
        <div className="container">
          <address style={{ fontStyle: 'normal' }}>
            {CONTACT_CARDS.map((items) => (
              <ContactCard key={items[0].title} items={items} />
            ))}
          </address>
        </div>
      </section>

      <section className="section section-alt" aria-labelledby="form-title">
        <div className="container" style={{ maxWidth: 720 }}>
          <SectionHead eyebrow="Send a Message" title="Drop Us a Line" id="form-title" className="contact-heading" />
          <form id="contactForm" onSubmit={handleSubmit} noValidate>
            <div className="form-grid">
              <FormField id="contact-name" label="Full Name" error={errors.name}>
                {input('name', 'contact-name', { placeholder: 'Jane Doe', autoComplete: 'name' })}
              </FormField>
              <FormField id="contact-email" label="Email Address" error={errors.email}>
                {input('email', 'contact-email', { type: 'email', placeholder: 'you@example.com', autoComplete: 'email' })}
              </FormField>
              <FormField id="contact-phone" label="Phone Number" hint="(optional)">
                {input('phone', 'contact-phone', { type: 'tel', placeholder: '+91 98765 43210', autoComplete: 'tel' })}
              </FormField>
              <FormField id="contact-orderId" label="Order ID" hint="(if applicable)">
                {input('orderId', 'contact-orderId', { placeholder: 'e.g. AUR102938' })}
              </FormField>
              <FormField id="contact-subject" label="Subject" error={errors.subject} full>
                <select id="contact-subject" name="subject" value={form.subject} onChange={handleChange} aria-invalid={Boolean(errors.subject)}>
                  <option value="">Choose a subject…</option>
                  {SUBJECTS.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </FormField>
              <FormField id="contact-message" label="Message" error={errors.message} full>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={5}
                  placeholder="How can we help?"
                  value={form.message}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.message)}
                  maxLength={1000}
                />
                <small style={{ color: 'var(--text-dim)', display: 'block', textAlign: 'right' }}>{form.message.length}/1000</small>
              </FormField>
            </div>
            <button type="submit" className="btn btn-gold btn-block" style={{ marginTop: 24 }}>
              Send Message
            </button>
          </form>
        </div>
      </section>

      <section className="section" id="faq" aria-labelledby="faq-title">
        <div className="container" style={{ maxWidth: 760 }}>
          <SectionHead eyebrow="Before You Write In" title="Common Questions" id="faq-title" className="contact-heading" />
          {FAQS.map(([q, a]) => (
            <FaqItem key={q} question={q} answer={a} />
          ))}
        </div>
      </section>
    </>
  );
}
