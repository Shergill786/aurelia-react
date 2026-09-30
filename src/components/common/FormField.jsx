/**
 * FormField — label + input + error message, wired together for accessibility
 * (htmlFor/id, aria-invalid, aria-describedby).
 *
 *   <FormField id="email" label="Email" error={errors.email}>
 *     <input id="email" type="email" value={email} onChange={...} />
 *   </FormField>
 *
 * `variant="auth"` uses the login/signup styling.
 */
export default function FormField({ id, label, hint, error, full = false, variant = 'field', children }) {
  const base = variant === 'auth' ? 'auth-field' : 'field';
  const classes = [base, full ? 'full' : '', error ? 'invalid' : ''].filter(Boolean).join(' ');
  return (
    <div className={classes}>
      <label htmlFor={id}>
        {label}
        {hint && <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}> {hint}</span>}
      </label>
      {children}
      <span className="error-msg" id={`${id}-error`} role={error ? 'alert' : undefined}>
        {error}
      </span>
    </div>
  );
}
