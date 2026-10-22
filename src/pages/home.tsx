import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useCart } from "../components/context/CartContext";
import { getProducts } from "../api/productApi";
import { getCategories } from "../api/categoryApi";
import type { Category } from "../api/categoryApi";

import heroImg from "../assets/hero.png";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category_id?: number | null;
  category_name?: string | null;

  // IMPORTANT
  image_url?: string | null;

  category?: string;
  rating?: number;
  reviewCount?: number;
  originalPrice?: number;
  badge?: string;
}

// ======================================================
// BADGE
// ======================================================

function Badge({ label }: { label: string }) {
  const colors: Record<string, string> = {
    New: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
    Sale: "bg-red-400/10 text-red-400 border-red-400/20",
    Limited: "bg-purple-400/10 text-purple-400 border-purple-400/20",
    Bestseller:
      "bg-amber-400/10 text-amber-400 border-amber-400/20",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${
        colors[label] ??
        "bg-zinc-700 text-zinc-400 border-zinc-600"
      }`}
    >
      {label}
    </span>
  );
}

// ======================================================
// PRODUCT CARD
// ======================================================

function ProductCard({
  product,
}: {
  product: Product;
}) {
  const { addToCart, isInCart } = useCart();

  const inCart = isInCart(product.id);

  return (
    <div className="group relative bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-600 transition-all duration-300 hover:-translate-y-1">

      {/* IMAGE */}

      <Link
        to={`/products/${product.id}`}
        className="block relative overflow-hidden aspect-3/4"
      >
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
            <span className="text-zinc-500 text-sm">
              No Image
            </span>
          </div>
        )}

        {/* HOVER OVERLAY */}

        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <span className="text-white text-xs uppercase tracking-widest font-semibold border border-white/50 px-4 py-2 rounded">
            View Details
          </span>
        </div>

        {/* BADGE */}

        {product.badge && (
          <div className="absolute top-3 left-3">
            <Badge label={product.badge} />
          </div>
        )}

        {/* DISCOUNT */}

        {product.originalPrice && (
          <div className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">
            -
            {Math.round(
              (1 -
                product.price /
                  product.originalPrice) *
                100
            )}
            %
          </div>
        )}
      </Link>

      {/* PRODUCT INFO */}

      <div className="p-4">

        <p className="text-zinc-500 text-[10px] uppercase tracking-widest mb-1">
          {product.category ||
            product.category_name ||
            ""}
        </p>

        <Link to={`/products/${product.id}`}>
          <h3 className="text-white font-semibold text-sm leading-snug hover:text-amber-400 transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>

        {/* RATING */}

        <div className="flex items-center gap-1.5 mt-1.5">

          <div className="flex">
            {[1, 2, 3, 4, 5].map(
              (star) => (
                <svg
                  key={star}
                  className={`w-3 h-3 ${
                    star <=
                    Math.round(
                      product.rating || 0
                    )
                      ? "text-amber-400"
                      : "text-zinc-700"
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              )
            )}
          </div>

          <span className="text-zinc-600 text-[10px]">
            ({product.reviewCount || 0})
          </span>

        </div>

        {/* PRICE + CART */}

        <div className="flex items-center justify-between mt-3">

          <div className="flex items-baseline gap-2">

            <span className="text-white font-bold">
              ₹{product.price}
            </span>

            {product.originalPrice && (
              <span className="text-zinc-600 text-xs line-through">
                ₹{product.originalPrice}
              </span>
            )}

          </div>

          <button
            onClick={() =>
              addToCart(product as any)
            }
            className={`text-[10px] uppercase tracking-widest font-semibold px-3 py-1.5 rounded transition-colors ${
              inCart
                ? "bg-emerald-400/10 text-emerald-400 border border-emerald-400/30"
                : "bg-amber-400/10 text-amber-400 border border-amber-400/30 hover:bg-amber-400 hover:text-black"
            }`}
          >
            {inCart
              ? "✓ Added"
              : "Add"}
          </button>

        </div>

      </div>
    </div>
  );
}

// ======================================================
// MARQUEE
// ======================================================

function MarqueeStrip() {
  const items = [
    "Free Shipping Over ₹300",
    "New Arrivals Every Friday",
    "Members Get Priority Access",
    "Handcrafted Luxury",
    "Dark Fashion Redefined",
    "Worldwide Delivery",
  ];

  return (
    <div className="bg-amber-400 py-2.5 overflow-hidden">

      <div className="flex animate-marquee whitespace-nowrap">

        {[...items, ...items].map(
          (item, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-3 mx-6 text-black text-xs font-semibold uppercase tracking-widest"
            >
              {item}

              <span className="w-1 h-1 rounded-full bg-black/30" />
            </span>
          )
        )}

      </div>
    </div>
  );
}

// ======================================================
// HOME
// ======================================================

export default function Home() {
  const [allProducts, setAllProducts] =
    useState<Product[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [categoriesLoading, setCategoriesLoading] =
    useState(true);

  const [categoriesError, setCategoriesError] =
    useState("");

  // ======================================================
  // LOAD PRODUCTS
  // ======================================================

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await getProducts();

        console.log(
          "HOME PRODUCTS RESPONSE:",
          response
        );

   const products = Array.isArray(response?.products)
  ? response.products
  : [];

        const formattedProducts =
          products.map(
            (product: any) => ({
              ...product,

              id: Number(product.id),

              name:
                product.name ?? "",

              description:
                product.description ??
                "",

              price:
                Number(product.price) ||
                0,

              stock:
                Number(product.stock) ||
                0,

              category:
                product.category ??
                product.category_name ??
                "",

              category_name:
                product.category_name ??
                "",

              // IMPORTANT
              image_url:
                product.image_url ??
                product.image ??
                "",

              rating:
                Number(product.rating) ||
                0,

              reviewCount:
                Number(
                  product.reviewCount
                ) || 0,

              originalPrice:
                product.originalPrice
                  ? Number(
                      product.originalPrice
                    )
                  : undefined,

              badge:
                product.badge ??
                undefined,
            })
          );

        console.log(
          "FORMATTED PRODUCTS:",
          formattedProducts
        );

        setAllProducts(
          formattedProducts
        );
      } catch (requestError: any) {
        console.error(
          "Featured products error:",
          requestError
        );

        setError(
          requestError.response?.data
            ?.message ||
            "Failed to load products."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // ======================================================
  // LOAD CATEGORIES
  // ======================================================

  useEffect(() => {
    const fetchCategories =
      async () => {
        try {
          setCategoriesLoading(true);
          setCategoriesError("");

          const data =
            await getCategories();

          setCategories(data);
        } catch (
          requestError: any
        ) {
          console.error(
            "Categories error:",
            requestError
          );

          setCategoriesError(
            requestError.response?.data
              ?.message ||
              "Failed to load categories."
          );
        } finally {
          setCategoriesLoading(false);
        }
      };

    fetchCategories();
  }, []);

  // ======================================================
  // PRODUCT SECTIONS
  // ======================================================

  const featured =
    allProducts.slice(0, 4);

  const newArrivals =
    allProducts.filter(
      (product) =>
        product.badge === "New" ||
        product.badge === "Limited"
    );

  return (
    <div className="bg-[#090909] min-h-screen">

      {/* ==================================================
          HERO
      ================================================== */}

      <section className="relative min-h-screen flex items-center overflow-hidden">

        <div className="absolute inset-0">

          <img
            src={heroImg}
            alt="Hero"
            className="w-full h-full object-cover object-top"
          />

          <div className="absolute inset-0 bg-linear-to-r from-[#090909] via-[#090909]/70 to-transparent" />

          <div className="absolute inset-0 bg-linear-to-t from-[#090909] via-transparent to-[#090909]/20" />

        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">

          <div className="max-w-2xl">

            <p className="text-amber-400 text-xs uppercase tracking-[0.4em] font-semibold mb-6 flex items-center gap-3">

              <span className="w-8 h-px bg-amber-400" />

              New Collection 2026

            </p>

            <h1 className="text-white font-black text-6xl sm:text-7xl lg:text-8xl leading-none tracking-tight mb-6">

              DRESSED
              <br />
              IN
              <br />

              <span className="text-amber-400">
                DARKNESS
              </span>

            </h1>

            <p className="text-zinc-400 text-base sm:text-lg leading-relaxed mb-10 max-w-lg">
              Luxury dark fashion for those
              who command attention in
              silence. Crafted for the
              discerning few who wear
              intention like armour.
            </p>

            <div className="flex flex-wrap items-center gap-4">

              <Link
                to="/products"
                className="bg-amber-400 hover:bg-amber-300 text-black font-bold uppercase tracking-widest text-sm px-8 py-4 rounded transition-colors"
              >
                Shop Collection
              </Link>

              <Link
                to="/products"
                className="border border-zinc-700 hover:border-zinc-500 text-white font-semibold uppercase tracking-widest text-sm px-8 py-4 rounded transition-colors"
              >
                Explore Pieces
              </Link>

            </div>

          </div>

        </div>
      </section>

      {/* ==================================================
          MARQUEE
      ================================================== */}

      <MarqueeStrip />

      {/* ==================================================
          CATEGORIES
      ================================================== */}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">

        <div className="mb-10">

          <p className="text-amber-400 text-xs uppercase tracking-[0.3em] font-semibold mb-2">
            Explore
          </p>

          <h2 className="text-white text-3xl font-bold">
            Shop by Category
          </h2>

        </div>

        {categoriesLoading ? (
          <p className="text-zinc-500">
            Loading categories...
          </p>
        ) : categoriesError ? (
          <p className="text-red-400">
            {categoriesError}
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

            {categories.map(
              (cat) => (
                <Link
                  key={cat.id}
                  to={`/products?category=${cat.id}`}
                  className="group relative bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 hover:border-amber-400/40 hover:bg-zinc-900 transition-all duration-200 text-center"
                >

                  <div className="w-10 h-10 rounded-lg bg-amber-400/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-amber-400/20 transition-colors">

                    <svg
                      className="w-5 h-5 text-amber-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.6}
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"
                      />
                    </svg>

                  </div>

                  <p className="text-white text-sm font-semibold group-hover:text-amber-400 transition-colors">
                    {cat.name}
                  </p>

                  <p className="text-zinc-600 text-[10px] mt-0.5 line-clamp-1">
                    {cat.description}
                  </p>

                </Link>
              )
            )}

          </div>
        )}

      </section>

      {/* ==================================================
          FEATURED PRODUCTS
      ================================================== */}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-20">

        <div className="flex items-end justify-between mb-10">

          <div>

            <p className="text-amber-400 text-xs uppercase tracking-[0.3em] font-semibold mb-2">
              Hand-picked
            </p>

            <h2 className="text-white text-3xl font-bold">
              Featured Pieces
            </h2>

          </div>

          <Link
            to="/products"
            className="text-zinc-400 hover:text-amber-400 text-sm uppercase tracking-widest transition-colors hidden sm:block"
          >
            View All →
          </Link>

        </div>

        {loading ? (
          <p className="text-zinc-500">
            Loading products...
          </p>
        ) : error ? (
          <p className="text-red-400">
            {error}
          </p>
        ) : featured.length === 0 ? (
          <p className="text-zinc-500">
            No products found
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

            {featured.map(
              (product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              )
            )}

          </div>
        )}

      </section>

      {/* ==================================================
          NEW ARRIVALS
      ================================================== */}

      {newArrivals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">

          <div className="flex items-end justify-between mb-10">

            <div>

              <p className="text-amber-400 text-xs uppercase tracking-[0.3em] font-semibold mb-2">
                Just dropped
              </p>

              <h2 className="text-white text-3xl font-bold">
                New Arrivals
              </h2>

            </div>

            <Link
              to="/products"
              className="text-zinc-400 hover:text-amber-400 text-sm uppercase tracking-widest transition-colors hidden sm:block"
            >
              See All →
            </Link>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">

            {newArrivals.map(
              (product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              )
            )}

          </div>

        </section>
      )}

      {/* ==================================================
          CTA
      ================================================== */}

      <section className="mx-4 sm:mx-6 lg:mx-8 my-10 rounded-2xl overflow-hidden bg-linear-to-br from-zinc-900 via-[#111] to-zinc-900 border border-zinc-800">

        <div className="max-w-7xl mx-auto px-8 sm:px-16 py-16 flex flex-col md:flex-row items-center justify-between gap-8">

          <div>

            <p className="text-amber-400 text-xs uppercase tracking-[0.3em] font-semibold mb-3">
              Limited time
            </p>

            <h2 className="text-white text-4xl font-black leading-tight">
              Members Get
              <br />
              <span className="text-amber-400">
                20% Off
              </span>{" "}
              Everything.
            </h2>

            <p className="text-zinc-500 text-sm mt-3 max-w-sm">
              Join DARKSTORE membership
              and unlock exclusive pricing,
              early access to drops, and
              free worldwide shipping.
            </p>

          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">

            <Link
              to="/register"
              className="bg-amber-400 hover:bg-amber-300 text-black font-bold uppercase tracking-widest text-sm px-8 py-4 rounded transition-colors text-center"
            >
              Join Now — It's Free
            </Link>

            <Link
              to="/products"
              className="border border-zinc-700 hover:border-zinc-500 text-white font-semibold uppercase tracking-widest text-sm px-8 py-4 rounded transition-colors text-center"
            >
              Browse First
          
            </Link>

          </div>

        </div>

      </section>
 <MarqueeStrip />
    </div>
  );
}