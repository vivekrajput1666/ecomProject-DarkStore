import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ecommerce_login from '../assets/ecommerce_login.png';
import { registerUser } from "../api/authApi";
interface FormState {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};
  if (!form.name.trim()) errors.name = 'Full name is required.';
  if (!form.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Enter a valid email address.';
  }
  if (!form.password) {
    errors.password = 'Password is required.';
  } else if (form.password.length < 6) {
    errors.password = 'Password must be at least 6 characters.';
  }
  if (!form.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password.';
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }
  return errors;
}

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined, general: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validate(form);
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }
   setLoading(true);

try {
  const response = await registerUser({
    name: form.name.trim(),
    email: form.email.trim(),
    password: form.password,
  });

  console.log("Register response:", response);

  navigate('/login');
} catch (error: any) {
  console.error("Register error:", error);

  setErrors({
    general: error.response?.data?.message || "Registration failed.",
  });
} finally {
  setLoading(false);
}
  };

  // Password strength
  const strength = (() => {
    if (!form.password) return 0;
    let score = 0;
    if (form.password.length >= 6)  score++;
    if (form.password.length >= 10) score++;
    if (/[A-Z]/.test(form.password)) score++;
    if (/[0-9]/.test(form.password)) score++;
    if (/[^A-Za-z0-9]/.test(form.password)) score++;
    return score;
  })();

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][strength];
  const strengthColor = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-emerald-500'][strength];

  const EyeIcon = ({ visible }: { visible: boolean }) =>
    visible ? (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
      </svg>
    ) : (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    );

  return (
    <div className="min-h-screen bg-[#090909] flex">

      {/* ── Left panel ──────────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img src={ecommerce_login} alt="Register" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-linear-to-r from-[#090909]/60 via-transparent to-[#090909]/10" />
        <div className="absolute inset-0 bg-linear-to-t from-[#090909] via-transparent to-transparent" />
        <div className="absolute bottom-12 left-10 right-10">
          <p className="text-amber-400 text-xs uppercase tracking-[0.3em] font-semibold mb-3">Join the circle</p>
          <h1 className="text-white text-5xl font-black leading-tight tracking-tight mb-4">
            Wear the<br />
            <span className="text-amber-400">Darkness.</span>
          </h1>
          <p className="text-zinc-400 text-sm leading-relaxed max-w-xs">
            Create your account and gain access to exclusive drops, priority shipping, and the full collection.
          </p>

          {/* Perks */}
          <ul className="mt-6 space-y-2">
            {[
              'Early access to new collections',
              'Members-only exclusive pricing',
              'Free shipping on every order',
            ].map((perk) => (
              <li key={perk} className="flex items-center gap-2 text-zinc-400 text-xs">
                <svg className="w-3.5 h-3.5 text-amber-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {perk}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Right panel — form ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12 overflow-y-auto">
        <div className="w-full max-w-md mx-auto">

          {/* Logo (mobile) */}
          <Link to="/" className="lg:hidden inline-block mb-10">
            <span className="text-amber-400 text-2xl font-black tracking-widest uppercase">
              DARK<span className="text-white">STORE</span>
            </span>
          </Link>

          {/* Heading */}
          <div className="mb-8">
            <p className="text-amber-400 text-xs uppercase tracking-[0.3em] font-semibold mb-2">New account</p>
            <h2 className="text-white text-4xl font-bold tracking-tight">Create Account</h2>
            <p className="text-zinc-500 text-sm mt-2">Join the darkness. It only takes a moment.</p>
          </div>

          {/* General error */}
          {errors.general && (
            <div className="mb-5 flex items-center gap-2 px-4 py-3 rounded-lg bg-red-400/5 border border-red-400/20">
              <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-400 text-xs">{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">

            {/* Full name */}
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-zinc-400 text-xs uppercase tracking-widest font-medium">
                Full Name
              </label>
              <input
                id="name" name="name" type="text" autoComplete="name"
                value={form.name} onChange={handleChange}
                placeholder="John Doe"
                className={`w-full bg-zinc-900 border ${errors.name ? 'border-red-500/60' : 'border-zinc-700'} focus:border-amber-400 text-white placeholder-zinc-600 text-sm px-4 py-3 rounded-lg outline-none transition-colors`}
              />
              {errors.name && <p className="text-red-400 text-xs">{errors.name}</p>}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-zinc-400 text-xs uppercase tracking-widest font-medium">
                Email Address
              </label>
              <input
                id="email" name="email" type="email" autoComplete="email"
                value={form.email} onChange={handleChange}
                placeholder="you@example.com"
                className={`w-full bg-zinc-900 border ${errors.email ? 'border-red-500/60' : 'border-zinc-700'} focus:border-amber-400 text-white placeholder-zinc-600 text-sm px-4 py-3 rounded-lg outline-none transition-colors`}
              />
              {errors.email && <p className="text-red-400 text-xs">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-zinc-400 text-xs uppercase tracking-widest font-medium">
                Password
              </label>
              <div className="relative">
                <input
                  id="password" name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={form.password} onChange={handleChange}
                  placeholder="Min. 6 characters"
                  className={`w-full bg-zinc-900 border ${errors.password ? 'border-red-500/60' : 'border-zinc-700'} focus:border-amber-400 text-white placeholder-zinc-600 text-sm px-4 py-3 pr-11 rounded-lg outline-none transition-colors`}
                />
                <button type="button" onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                  aria-label="Toggle password">
                  <EyeIcon visible={showPassword} />
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs">{errors.password}</p>}

              {/* Strength meter */}
              {form.password && (
                <div className="space-y-1 pt-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? strengthColor : 'bg-zinc-800'}`} />
                    ))}
                  </div>
                  <p className={`text-xs ${strengthColor.replace('bg-', 'text-')}`}>{strengthLabel}</p>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="text-zinc-400 text-xs uppercase tracking-widest font-medium">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword" name="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={form.confirmPassword} onChange={handleChange}
                  placeholder="Repeat your password"
                  className={`w-full bg-zinc-900 border ${errors.confirmPassword ? 'border-red-500/60' : 'border-zinc-700'} focus:border-amber-400 text-white placeholder-zinc-600 text-sm px-4 py-3 pr-11 rounded-lg outline-none transition-colors`}
                />
                <button type="button" onClick={() => setShowConfirm((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                  aria-label="Toggle confirm password">
                  <EyeIcon visible={showConfirm} />
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-400 text-xs">{errors.confirmPassword}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit" disabled={loading}
              className="w-full bg-amber-400 hover:bg-amber-300 disabled:opacity-60 disabled:cursor-not-allowed text-black font-bold uppercase tracking-widest text-sm py-3.5 rounded-lg transition-colors flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account…
                </>
              ) : (
                'Create Account'
              )}
            </button>

            <p className="text-center text-zinc-600 text-xs leading-relaxed">
              By creating an account you agree to our{' '}
              <a href="#" className="text-zinc-400 hover:text-amber-400 transition-colors underline">Terms of Service</a>{' '}
              and{' '}
              <a href="#" className="text-zinc-400 hover:text-amber-400 transition-colors underline">Privacy Policy</a>.
            </p>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-zinc-800" />
            <span className="text-zinc-600 text-xs uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-zinc-800" />
          </div>

          <p className="text-center text-zinc-500 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-amber-400 hover:text-amber-300 font-semibold transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
