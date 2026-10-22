import { Navigate, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./components/context/AuthContext";
import { CartProvider } from "./components/context/CartContext";

import AdminProtectedRoute from "./components/admin/AdminProtectedRoute";
import AdminLayout from "./components/admin/AdminLayout";

import Profile from "./pages/profile";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import "./App.css";

// Pages
import Home from "./pages/home";
import Login from "./pages/login";
import Register from "./pages/register";
import Products from "./pages/product";
import ProductDetails from "./pages/product_details";
import Cart from "./pages/cart";
import Checkout from "./pages/checkout";
import Orders from "./pages/orders";
import OrderDetails from "./pages/orderDetails";
import PrivacyPolicy from "./pages/privacyPolicy";
import TermsAndConditions from "./pages/termsAndConditions";

import AdminDashboard from "./components/admin/AdminDashboard";
import AdminProducts from "./pages/adminProduct";
import AdminCoupons from "./pages/adminCoupons";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminUsers from "./pages/admin/AdminUsers";

const BARE_ROUTES = ["/login", "/register"];

function Layout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();

  const bare = BARE_ROUTES.includes(pathname);

  return (
    <div className="flex flex-col min-h-screen">
      {!bare && <Navbar />}

      <main className="flex-1">
        {children}
      </main>

      {!bare && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Layout>
          <Routes>

            {/* ================= PUBLIC ================= */}

            <Route
              path="/"
              element={<Home />}
            />

            <Route
              path="/login"
              element={<Login />}
            />

            <Route
              path="/register"
              element={<Register />}
            />

            {/* ================= SHOP ================= */}

            <Route
              path="/products"
              element={<Products />}
            />

            <Route
              path="/products/:id"
              element={<ProductDetails />}
            />

            {/* ================= CART & CHECKOUT ================= */}

            <Route
              path="/cart"
              element={<Cart />}
            />

            <Route
              path="/checkout"
              element={<Checkout />}
            />

            {/* ================= ACCOUNT ================= */}

            <Route
              path="/profile"
              element={<Profile />}
            />

            <Route
              path="/orders"
              element={<Orders />}
            />

            <Route
              path="/orders/:id"
              element={<OrderDetails />}
            />

            {/* ================= LEGAL ================= */}

            <Route
              path="/privacy-policy"
              element={<PrivacyPolicy />}
            />

            <Route
              path="/terms-and-conditions"
              element={<TermsAndConditions />}
            />

            {/* ================= ADMIN ================= */}

            <Route element={<AdminProtectedRoute />}>

              <Route path="/admin" element={<AdminLayout />}>

                <Route
                  index
                  element={<Navigate to="/admin/dashboard" replace />}
                />

                <Route
                  path="dashboard"
                  element={<AdminDashboard />}
                />

                <Route
                  path="products"
                  element={<AdminProducts />}
                />

                <Route
                  path="categories"
                  element={<AdminCategories />}
                />

                <Route
                  path="orders"
                  element={<AdminOrders />}
                />

                <Route
                  path="users"
                  element={<AdminUsers />}
                />

                <Route
                  path="coupons"
                  element={<AdminCoupons />}
                />

              </Route>

            </Route>

            {/* ================= 404 ================= */}

            <Route
              path="*"
              element={<NotFound />}
            />

          </Routes>
        </Layout>
      </CartProvider>
    </AuthProvider>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen bg-[#090909] flex items-center justify-center px-4">
      <div className="text-center space-y-5 max-w-sm">

        <p className="text-amber-400 text-8xl font-black">
          404
        </p>

        <div>
          <h1 className="text-white text-2xl font-bold mb-2">
            Page not found
          </h1>

          <p className="text-zinc-500 text-sm leading-relaxed">
            The page you're looking for doesn't exist or has
            been moved.
          </p>
        </div>

        <a
          href="/"
          className="inline-block bg-amber-400 hover:bg-amber-300 text-black font-bold uppercase tracking-widest text-sm px-8 py-3.5 rounded transition-colors"
        >
          Back to Home
        </a>

      </div>
    </div>
  );
}