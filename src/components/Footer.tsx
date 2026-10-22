import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCategories } from '../api/categoryApi';
import type { Category } from '../api/categoryApi';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch((error) => {
        console.error('Footer categories error:', error);
      });
  }, []);

  return (
    <footer className="bg-[#080808] border-t border-white/5 mt-auto">
      {/* ── Main footer grid ─────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <span className="text-amber-400 text-2xl font-black tracking-widest uppercase">
                DARK<span className="text-white">STORE</span>
              </span>
            </Link>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-xs">
              Luxury dark fashion for those who command attention in silence. Crafted for the
              discerning few who wear intention like armour.
            </p>
            <div className="flex items-center gap-4 mt-6">
              {/* Instagram */}
              <a href="#" aria-label="Instagram"
                className="w-9 h-9 rounded-full border border-zinc-700 flex items-center justify-center text-zinc-500 hover:text-amber-400 hover:border-amber-400 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              {/* Twitter/X */}
              <a href="#" aria-label="Twitter"
                className="w-9 h-9 rounded-full border border-zinc-700 flex items-center justify-center text-zinc-500 hover:text-amber-400 hover:border-amber-400 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.261 5.633L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/>
                </svg>
              </a>
              {/* Pinterest */}
              <a href="#" aria-label="Pinterest"
                className="w-9 h-9 rounded-full border border-zinc-700 flex items-center justify-center text-zinc-500 hover:text-amber-400 hover:border-amber-400 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-widest mb-5">Shop</h4>
            <ul className="space-y-3">
              {categories.map((category) => (
                <li key={category.id}>
                  <Link to={`/products?category=${category.id}`} className="text-zinc-500 text-sm hover:text-amber-400 transition-colors">
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-widest mb-5">Account</h4>
            <ul className="space-y-3">
              {[
                { label: 'Sign In',      path: '/login'    },
                { label: 'Register',     path: '/register' },
                { label: 'My Orders',    path: '/orders'   },
                { label: 'My Cart',      path: '/cart'     },
                { label: 'Checkout',     path: '/checkout' },
              ].map((item) => (
                <li key={item.path}>
                  <Link to={item.path} className="text-zinc-500 text-sm hover:text-amber-400 transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-widest mb-5">Support</h4>
            <ul className="space-y-3">
              {['FAQ', 'Shipping & Returns', 'Size Guide', 'Care Instructions', 'Contact Us'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-zinc-500 text-sm hover:text-amber-400 transition-colors">
                    {item}
                  </a>
                </li>
              ))}
              <li>
                <Link to="/privacy-policy" className="text-zinc-500 text-sm hover:text-amber-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-and-conditions" className="text-zinc-500 text-sm hover:text-amber-400 transition-colors">
                  Terms &amp; Conditions
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* ── Newsletter ───────────────────────────────────────────────── */}
        <div className="mt-12 pt-10 border-t border-white/5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="text-white font-semibold tracking-wide mb-1">Join the inner circle</h4>
              <p className="text-zinc-500 text-sm">Early access, exclusive drops, and nothing else.</p>
            </div>
            <form className="flex gap-2 w-full md:w-auto" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 md:w-72 bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-600 text-sm px-4 py-2.5 rounded focus:outline-none focus:border-amber-400 transition-colors"
              />
              <button
                type="submit"
                className="bg-amber-400 hover:bg-amber-300 text-black font-semibold text-sm px-5 py-2.5 rounded transition-colors whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ───────────────────────────────────────────────────── */}
      <div className="border-t border-white/5 px-4 py-5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-zinc-600 text-xs">
          <span>© {currentYear} DARKSTORE. All rights reserved.</span>
          <span className="tracking-widest uppercase">Crafted in darkness. Worn with intent.</span>
        </div>
      </div>
    </footer>
  );
}
