import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ecommerce_login from '../assets/ecommerce_login.png';
import { loginUser } from '../api/authApi';

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);

    try {
      const response = await loginUser({
        email: form.email,
        password: form.password,
      });

      console.log('Login response:', response);

      if (response.token) {
        localStorage.setItem('token', response.token);
        window.dispatchEvent(new Event('authChange'));
      }

      if (response.user?.role === 'admin') {
        navigate('/admin/dashboard');
        return;
      }

      navigate('/');
    } catch (error: any) {
      console.error('Login error:', error);

      setError(
        error.response?.data?.message || 'Invalid email or password.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090909] flex">

      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src={ecommerce_login}
          alt="Dressed in Darkness"
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-linear-to-r from-[#090909]/60 via-transparent to-[#090909]/10" />
        <div className="absolute inset-0 bg-linear-to-t from-[#090909] via-transparent to-transparent" />

        <div className="absolute bottom-12 left-10 right-10">
          <p className="text-amber-400 text-xs uppercase tracking-[0.3em] font-semibold mb-3">
            Est. 2024
          </p>

          <h1 className="text-white text-5xl font-black leading-tight tracking-tight mb-4">
            Dressed
            <br />
            In
            <br />
            <span className="text-amber-400">Darkness.</span>
          </h1>

          <p className="text-zinc-400 text-sm leading-relaxed max-w-xs">
            Luxury dark fashion for those who move through the world on their
            own terms.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12">
        <div className="w-full max-w-md mx-auto">

          {/* Logo */}
          <Link to="/" className="lg:hidden inline-block mb-10">
            <span className="text-amber-400 text-2xl font-black tracking-widest uppercase">
              DARK<span className="text-white">STORE</span>
            </span>
          </Link>

          {/* Heading */}
          <div className="mb-8">
            <p className="text-amber-400 text-xs uppercase tracking-[0.3em] font-semibold mb-2">
              Welcome back
            </p>

            <h2 className="text-white text-4xl font-bold tracking-tight">
              Sign In
            </h2>

            <p className="text-zinc-500 text-sm mt-2">
              Enter your credentials to access your account.
            </p>
          </div>

          {/* Demo hint */}
          <div className="mb-6 px-4 py-3 rounded-lg bg-amber-400/5 border border-amber-400/20">
            <p className="text-amber-400/80 text-xs leading-relaxed">
              <span className="font-semibold">Demo:</span>{' '}
              admin@darkstore.com / admin123
              &nbsp;·&nbsp;
              john@example.com / password
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-5">

            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-zinc-400 text-xs uppercase tracking-widest font-medium"
              >
                Email Address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full bg-zinc-900 border border-zinc-700 focus:border-amber-400 text-white placeholder-zinc-600 text-sm px-4 py-3 rounded-lg outline-none transition-colors"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-zinc-400 text-xs uppercase tracking-widest font-medium"
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-zinc-900 border border-zinc-700 focus:border-amber-400 text-white placeholder-zinc-600 text-sm px-4 py-3 pr-11 rounded-lg outline-none transition-colors"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                  aria-label={
                    showPassword ? 'Hide password' : 'Show password'
                  }
                >
                  {showPassword ? (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />

                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-400/5 border border-red-400/20">
                <svg
                  className="w-4 h-4 text-red-400 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>

                <p className="text-red-400 text-xs">
                  {error}
                </p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-400 hover:bg-amber-300 disabled:opacity-60 disabled:cursor-not-allowed text-black font-bold uppercase tracking-widest text-sm py-3.5 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />

                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>

                  Signing in…
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-zinc-800" />

            <span className="text-zinc-600 text-xs uppercase tracking-widest">
              or
            </span>

            <div className="flex-1 h-px bg-zinc-800" />
          </div>

          {/* Register */}
          <p className="text-center text-zinc-500 text-sm">
            Don't have an account?{' '}

            <Link
              to="/register"
              className="text-amber-400 hover:text-amber-300 font-semibold transition-colors"
            >
              Create one
            </Link>
          </p>

          <p className="mt-6 text-center text-xs text-zinc-600">
            By signing in, you acknowledge our{' '}
            <Link
              to="/terms-and-conditions"
              className="text-zinc-400 transition-colors hover:text-amber-400"
            >
              Terms &amp; Conditions
            </Link>{' '}
            and{' '}
            <Link
              to="/privacy-policy"
              className="text-zinc-400 transition-colors hover:text-amber-400"
            >
              Privacy Policy
            </Link>
            .
          </p>

        </div>
      </div>
    </div>
  );
}