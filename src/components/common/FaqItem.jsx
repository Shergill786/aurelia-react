import { useId, useState } from 'react';

/**
 * FaqItem — one question/answer that opens and closes (accordion).
 * Local state (useState) decides whether this item is open.
 */
export default function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  const answerId = useId();
  return (
    <div className={`faq-item ${open ? 'open' : ''}`}>
      <button type="button" className="faq-q" aria-expanded={open} aria-controls={answerId} onClick={() => setOpen((o) => !o)}>
        {question} <span className="chevron" aria-hidden="true">⌄</span>
      </button>
      <div className="faq-a" id={answerId} role="region" aria-hidden={!open}>
        {answer}
      </div>
    </div>
  );
}
