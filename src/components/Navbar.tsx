import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from './context/CartContext';

export default function Navbar() {
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('token')
  );

  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(!!localStorage.getItem('token'));
    };

    window.addEventListener('authChange', checkAuth);

    return () => {
      window.removeEventListener('authChange', checkAuth);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');

    window.dispatchEvent(new Event('authChange'));

    navigate('/login');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Shop', path: '/products' },
    { label: 'Orders', path: '/orders' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Top announcement bar */}
      <div className="bg-amber-400 text-black text-xs font-semibold tracking-widest text-center py-2 uppercase">
        Free shipping on orders over $300 &nbsp;·&nbsp; New arrivals every Friday
      </div>

      {/* Main navbar */}
      <nav className="sticky top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <span className="text-amber-400 text-2xl font-black tracking-widest uppercase group-hover:text-amber-300 transition-colors">
                DARK<span className="text-white">STORE</span>
              </span>
            </Link>

            {/* Desktop nav links */}
            <ul className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className={`text-sm font-medium tracking-widest uppercase transition-colors ${
                      isActive(link.path)
                        ? 'text-amber-400'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Right actions */}
            <div className="flex items-center gap-4">

              {/* Search */}
              <button
                onClick={() => setSearchOpen((o) => !o)}
                aria-label="Search"
                className="text-zinc-400 hover:text-amber-400 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
                  />
                </svg>
              </button>

              {/* Cart */}
              <Link
                to="/cart"
                aria-label="Cart"
                className="relative text-zinc-400 hover:text-amber-400 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0"
                  />
                </svg>

                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-amber-400 text-black text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </Link>

              {/* Auth */}
              {isAuthenticated ? (
                <div className="hidden md:flex items-center gap-3">

                  <Link
                    to="/profile"
                    className="text-xs uppercase tracking-widest text-zinc-400 hover:text-amber-400 transition-colors font-medium"
                  >
                    Profile
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="text-xs uppercase tracking-widest text-zinc-400 hover:text-amber-400 transition-colors font-medium"
                  >
                    Logout
                  </button>

                </div>
              ) : (
                <Link
                  to="/login"
                  className="hidden md:block text-xs uppercase tracking-widest font-semibold text-black bg-amber-400 hover:bg-amber-300 transition-colors px-4 py-2 rounded"
                >
                  Sign In
                </Link>
              )}

              {/* Hamburger */}
              <button
                className="md:hidden text-zinc-400 hover:text-white transition-colors"
                onClick={() => setMenuOpen((o) => !o)}
                aria-label="Menu"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {menuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div className="border-t border-white/5 bg-[#0d0d0d] px-4 py-3">
            <form
              onSubmit={handleSearch}
              className="max-w-2xl mx-auto flex gap-2"
            >
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products…"
                className="flex-1 bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 text-sm px-4 py-2 rounded focus:outline-none focus:border-amber-400 transition-colors"
              />

              <button
                type="submit"
                className="bg-amber-400 hover:bg-amber-300 text-black font-semibold text-sm px-5 py-2 rounded transition-colors"
              >
                Search
              </button>
            </form>
          </div>
        )}

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-white/5 bg-[#0d0d0d] px-4 py-4 space-y-3">

            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMenuOpen(false)}
                className={`block text-sm font-medium uppercase tracking-widest py-2 transition-colors ${
                  isActive(link.path)
                    ? 'text-amber-400'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="pt-2 border-t border-white/5">

              {isAuthenticated ? (
                <div className="flex flex-col gap-3">

                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="text-sm uppercase tracking-widest text-zinc-400 hover:text-amber-400 transition-colors"
                  >
                    Profile
                  </Link>

                  <button
                    onClick={() => {
                      handleLogout();
                      setMenuOpen(false);
                    }}
                    className="text-left text-sm uppercase tracking-widest text-zinc-400 hover:text-amber-400 transition-colors"
                  >
                    Logout
                  </button>

                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="inline-block text-sm uppercase tracking-widest font-semibold text-black bg-amber-400 hover:bg-amber-300 px-4 py-2 rounded transition-colors"
                >
                  Sign In
                </Link>
              )}

            </div>
          </div>
        )}
      </nav>
    </>
  );
}