import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FormField from '../components/common/FormField';
import { useAuth, useToast } from '../context/contexts';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { isEmail, passwordStrength, validate } from '../utils/validation';

const STRENGTH_COLORS = ['#d9534f', '#d9534f', '#e0a530', '#a3c94f', '#3fbf7f'];
const STRENGTH_LABELS = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'];

/** PasswordInput — password field with a show/hide toggle (its own state). */
function PasswordInput({ id, value, onChange, error, placeholder, autoComplete }) {
  const [visible, setVisible] = useState(false);
  return (
    <>
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={`${id}-error`}
      />
      <button type="button" className="toggle-pass" onClick={() => setVisible((v) => !v)} aria-label={visible ? 'Hide password' : 'Show password'} aria-pressed={visible}>
        {visible ? '🙈' : '👁'}
      </button>
    </>
  );
}

/** AuthCard — shared frame for Login and Signup (children = the form). */
function AuthCard({ title, subtitle, children, footer, showSocials = true }) {
  const showToast = useToast();
  return (
    <main className="auth-wrap" id="main">
      <div className="auth-bg" aria-hidden="true" />
      <section className="auth-card" aria-labelledby="auth-title">
        <Link to="/home" className="auth-logo" aria-label="Aurelia home">
          <span>
            AUR<em>ELIA</em>
          </span>
        </Link>
        <h1 id="auth-title">
          {title}
        </h1>
        <p className="sub">{subtitle}</p>
        {children}
        {showSocials && (
          <>
            <div className="auth-divider">or continue with</div>
            <div className="auth-socials">
              <button type="button" onClick={() => showToast('Google sign-in is a demo only')}>
                Google
              </button>
              <button type="button" onClick={() => showToast('Apple sign-in is a demo only')}>
                Apple
              </button>
            </div>
          </>
        )}
        <p className="auth-footer-link">{footer}</p>
      </section>
    </main>
  );
}

/** Shown on /login when someone is already signed in. */
function SignedInCard({ user, onSignOut }) {
  return (
    <AuthCard title={`Hi, ${user.name}`} subtitle={`You're signed in as ${user.email}`} showSocials={false} footer={<Link to="/home">Back to the store</Link>}>
      <Link to="/home" className="btn btn-gold btn-block">
        Continue Shopping
      </Link>
      <button type="button" className="btn btn-outline btn-block" style={{ marginTop: 12, color: '#fff', borderColor: 'rgba(255,255,255,.35)' }} onClick={onSignOut}>
        Sign Out
      </button>
    </AuthCard>
  );
}

export function Login() {
  useDocumentTitle('Login');
  const navigate = useNavigate();
  const showToast = useToast();
  const { user, signIn, signOut } = useAuth();
  const [remembered, setRemembered] = useLocalStorage('aurelia_remember_email', null);
  const [email, setEmail] = useState(remembered || '');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(Boolean(remembered));
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const found = validate(
      { email, password },
      {
        email: (v) => (isEmail(v) ? '' : 'Enter a valid email address'),
        password: (v) => (v.length >= 6 ? '' : 'Password must be at least 6 characters'),
      },
    );
    setErrors(found);
    if (Object.keys(found).length) return;

    setRemembered(remember ? email.trim() : null); // un-ticking forgets the email
    setSubmitting(true);
    setTimeout(() => {
      signIn(email);
      showToast('Signed in — welcome to Aurelia!');
      navigate('/home');
    }, 700);
  };

  const forgotPassword = () => {
    if (isEmail(email)) showToast(`A reset link has been sent to ${email.trim()} (demo)`);
    else setErrors({ email: 'Enter your email above first, then click "Forgot password?"' });
  };

  // Already signed in (and not in the middle of submitting): offer to continue or sign out.
  if (user && !submitting) {
    return (
      <SignedInCard
        user={user}
        onSignOut={() => {
          signOut();
          showToast('Signed out');
        }}
      />
    );
  }

  return (
    <AuthCard
      title="Welcome Back"
      subtitle="Sign in to continue to your account"
      footer={
        <>
          Don&rsquo;t have an account? <Link to="/signup">Create one</Link>
          <br />
          <Link to="/home" style={{ fontWeight: 400, opacity: 0.8 }}>
            Continue as guest →
          </Link>
        </>
      }
    >
      <form id="loginForm" onSubmit={handleSubmit} noValidate>
        <FormField variant="auth" id="loginEmail" label="Email Address" error={errors.email}>
          <input id="loginEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" aria-invalid={Boolean(errors.email)} aria-describedby="loginEmail-error" />
        </FormField>
        <FormField variant="auth" id="loginPassword" label="Password" error={errors.password}>
          <PasswordInput id="loginPassword" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} placeholder="••••••••" autoComplete="current-password" />
        </FormField>
        <div className="auth-row">
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" id="rememberMe" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Remember me
          </label>
          <button type="button" onClick={forgotPassword} style={{ fontSize: 'inherit', color: 'inherit' }}>
            Forgot password?
          </button>
        </div>
        <button type="submit" className="btn btn-gold btn-block" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
    </AuthCard>
  );
}

export function Signup() {
  useDocumentTitle('Create Account');
  const navigate = useNavigate();
  const showToast = useToast();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', terms: false });
  const [errors, setErrors] = useState({});
  const strength = passwordStrength(form.password);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const found = validate(form, {
      name: (v) => (v.trim().length >= 2 ? '' : 'Enter your full name'),
      email: (v) => (isEmail(v) ? '' : 'Enter a valid email address'),
      password: (v) => (v.length >= 8 ? '' : 'Password must be at least 8 characters'),
      confirm: (v, all) => (v && v === all.password ? '' : 'Passwords do not match'),
      terms: (v) => (v ? '' : 'Please accept the Terms & Privacy Policy'),
    });
    setErrors(found);
    if (Object.keys(found).length) return;
    showToast('Account created — please sign in (demo)');
    navigate('/login');
  };

  return (
    <AuthCard title="Create Account" subtitle="Join Aurelia for a personalised shopping experience" footer={<>Already have an account? <Link to="/login">Sign in</Link></>}>
      <form id="signupForm" onSubmit={handleSubmit} noValidate>
        <FormField variant="auth" id="signupName" label="Full Name" error={errors.name}>
          <input id="signupName" value={form.name} onChange={set('name')} placeholder="Jane Doe" autoComplete="name" aria-invalid={Boolean(errors.name)} aria-describedby="signupName-error" />
        </FormField>
        <FormField variant="auth" id="signupEmail" label="Email Address" error={errors.email}>
          <input id="signupEmail" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" autoComplete="email" aria-invalid={Boolean(errors.email)} aria-describedby="signupEmail-error" />
        </FormField>
        <FormField variant="auth" id="signupPassword" label="Password" error={errors.password}>
          <PasswordInput id="signupPassword" value={form.password} onChange={set('password')} error={errors.password} placeholder="Minimum 8 characters" autoComplete="new-password" />
          {/* Strength meter: width and colour are derived from state on every keystroke */}
          <div className="strength-meter" aria-hidden="true">
            <i style={{ width: `${(strength / 4) * 100}%`, background: STRENGTH_COLORS[strength] }} />
          </div>
          {form.password && (
            <small style={{ color: 'var(--text-dim)' }} aria-live="polite">
              Strength: {STRENGTH_LABELS[strength]}
            </small>
          )}
        </FormField>
        <FormField variant="auth" id="signupConfirm" label="Confirm Password" error={errors.confirm}>
          <PasswordInput id="signupConfirm" value={form.confirm} onChange={set('confirm')} error={errors.confirm} placeholder="Re-enter password" autoComplete="new-password" />
        </FormField>
        <div className="auth-row" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" id="agreeTerms" checked={form.terms} onChange={set('terms')} /> I agree to the Terms &amp; Privacy Policy
          </label>
          {errors.terms && (
            <span role="alert" style={{ color: 'var(--sale)', fontSize: '.78rem' }}>
              {errors.terms}
            </span>
          )}
        </div>
        <button type="submit" className="btn btn-gold btn-block">
          Create Account
        </button>
      </form>
    </AuthCard>
  );
}
