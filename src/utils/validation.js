/**
 * validation.js — reusable form validators.
 * Each validator returns an error message string, or "" when the value is valid.
 */

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isEmail = (value) => EMAIL_RE.test(value.trim());

/**
 * Run a rules object against form values.
 *   validate({ email: 'x' }, { email: (v) => (isEmail(v) ? '' : 'Bad email') })
 *   -> { email: 'Bad email' }
 * Only fields with an error appear in the result, so an empty object means valid.
 */
export function validate(values, rules) {
  const errors = {};
  for (const [field, rule] of Object.entries(rules)) {
    const message = rule(values[field] ?? '', values);
    if (message) errors[field] = message;
  }
  return errors;
}

/** Checkout rules — Indian PIN / mobile formats when the country is India. */
export const checkoutRules = {
  fullName: (v) => (v.trim().length >= 2 ? '' : 'Please enter your full name'),
  email: (v) => (isEmail(v) ? '' : 'Please enter a valid email address'),
  address: (v) => (v.trim().length >= 5 ? '' : 'Please enter your delivery address'),
  city: (v) => (v.trim().length >= 2 ? '' : 'Please enter your city'),
  zip: (v, all) => {
    const ok = all.country === 'India' ? /^[1-9]\d{5}$/.test(v.trim()) : /^[A-Za-z0-9 -]{3,10}$/.test(v.trim());
    return ok ? '' : 'Please enter a valid postal code';
  },
  phone: (v, all) => {
    const digits = v.replace(/\D/g, '');
    const ok = all.country === 'India' ? /^(91)?[6-9]\d{9}$/.test(digits) : digits.length >= 7 && digits.length <= 15;
    return ok ? '' : 'Please enter a valid phone number';
  },
};

/** Password strength score from 0 to 4 (length, uppercase, digit, symbol). */
export function passwordStrength(password) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}
