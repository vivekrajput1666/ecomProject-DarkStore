import { Link, Outlet, useLocation } from "react-router-dom";

const AdminLayout = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-[#090909] text-white">
      <div className="flex min-h-screen">

        {/* Sidebar */}
        <aside className="w-64 bg-[#111111] border-r border-zinc-800 p-5">

          {/* Logo */}
          <h1 className="text-2xl font-bold text-amber-400 mb-8">
            Admin Panel
          </h1>

          {/* Navigation */}
          <nav className="space-y-2">

            <Link
              to="/admin/dashboard"
              className={`block px-4 py-3 rounded transition-colors ${
                isActive("/admin/dashboard")
                  ? "bg-amber-400 text-black font-semibold"
                  : "text-zinc-300 hover:bg-zinc-800"
              }`}
            >
              Dashboard
            </Link>

            <Link
              to="/admin/products"
              className={`block px-4 py-3 rounded transition-colors ${
                isActive("/admin/products")
                  ? "bg-amber-400 text-black font-semibold"
                  : "text-zinc-300 hover:bg-zinc-800"
              }`}
            >
              Products
            </Link>

            <Link
              to="/admin/categories"
              className={`block px-4 py-3 rounded transition-colors ${
                isActive("/admin/categories")
                  ? "bg-amber-400 text-black font-semibold"
                  : "text-zinc-300 hover:bg-zinc-800"
              }`}
            >
              Categories
            </Link>

            <Link
              to="/admin/orders"
              className={`block px-4 py-3 rounded transition-colors ${
                isActive("/admin/orders")
                  ? "bg-amber-400 text-black font-semibold"
                  : "text-zinc-300 hover:bg-zinc-800"
              }`}
            >
              Orders
            </Link>

            <Link
              to="/admin/users"
              className={`block px-4 py-3 rounded transition-colors ${
                isActive("/admin/users")
                  ? "bg-amber-400 text-black font-semibold"
                  : "text-zinc-300 hover:bg-zinc-800"
              }`}
            >
              Users
            </Link>

            <Link
              to="/admin/coupons"
              className={`block px-4 py-3 rounded transition-colors ${
                isActive("/admin/coupons")
                  ? "bg-amber-400 text-black font-semibold"
                  : "text-zinc-300 hover:bg-zinc-800"
              }`}
            >
              Coupons
            </Link>

          </nav>

          {/* Back to Store */}
          <div className="mt-10 pt-6 border-t border-zinc-800">

            <Link
              to="/"
              className="block px-4 py-3 rounded text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 transition-colors"
            >
              ← Back to Store
            </Link>

          </div>

        </aside>

        <div className="flex-1 min-w-0">
          {/* Admin Header */}
          <header className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 bg-[#111111] px-5 py-4 sm:px-8">
            <h2 className="text-lg font-semibold text-white">
              Admin Panel
            </h2>

            <Link
              to="/admin/dashboard"
              className={`inline-flex items-center gap-2 rounded px-4 py-2.5 text-sm font-semibold transition-colors ${
                isActive("/admin/dashboard")
                  ? "bg-amber-400 text-black"
                  : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
              }`}
            >
              <span aria-hidden="true">📊</span>
              Dashboard
            </Link>
          </header>

          {/* Main Content */}
          <main className="p-5 sm:p-8 overflow-auto">
            <Outlet />
          </main>
        </div>

      </div>
    </div>
  );
};

export default AdminLayout;