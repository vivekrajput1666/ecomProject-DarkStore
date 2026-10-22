import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCart } from '../components/context/CartContext';
import { getProducts } from '../api/productApi';
import { getCategories } from '../api/categoryApi';
import { getImagesByProductId } from '../api/productImgApi';
import type { Category } from '../api/categoryApi';
import type { Product } from '../components/services/productService';

function Badge({ label }: { label: string }) {
  const colors: Record<string, string> = {
    New: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
    Sale: 'bg-red-400/10 text-red-400 border-red-400/20',
    Limited: 'bg-purple-400/10 text-purple-400 border-purple-400/20',
    Bestseller: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${
        colors[label] ??
        'bg-zinc-700 text-zinc-400 border-zinc-600'
      }`}
    >
      {label}
    </span>
  );
}

function ProductCard({
  product,
  view,
}: {
  product: Product;
  view: 'grid' | 'list';
}) {
  const { addToCart, isInCart } = useCart();

  const inCart = isInCart(product.id);

  const price = Number(product.price) || 0;

  const originalPrice = product.originalPrice
    ? Number(product.originalPrice)
    : null;

  const rating = Number(product.rating) || 0;

  if (view === 'list') {
    return (
      <div className="group bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-600 transition-all duration-200 flex gap-0">

        <Link
          to={`/products/${product.id}`}
          className="relative w-44 sm:w-56 shrink-0 overflow-hidden"
        >
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {product.badge && (
            <div className="absolute top-3 left-3">
              <Badge label={product.badge} />
            </div>
          )}
        </Link>

        <div className="flex-1 p-5 flex flex-col justify-between">

          <div>

            <p className="text-zinc-500 text-[10px] uppercase tracking-widest mb-1">
              {product.category}
            </p>

            <Link to={`/products/${product.id}`}>
              <h3 className="text-white font-semibold text-base hover:text-amber-400 transition-colors">
                {product.name}
              </h3>
            </Link>

            <div className="flex items-center gap-1.5 mt-1.5">

              <div className="flex">

                {[1, 2, 3, 4, 5].map((s) => (
                  <svg
                    key={s}
                    className={`w-3 h-3 ${
                      s <= Math.round(rating)
                        ? 'text-amber-400'
                        : 'text-zinc-700'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}

              </div>

              <span className="text-zinc-600 text-[10px]">
                ({product.reviewCount ?? 0})
              </span>

            </div>

            <p className="text-zinc-500 text-sm mt-3 line-clamp-2 leading-relaxed">
              {product.description}
            </p>

          </div>

          <div className="flex items-center justify-between mt-4">

            <div className="flex items-baseline gap-2">

              <span className="text-white font-bold text-lg">
                ${price.toFixed(2)}
              </span>

              {originalPrice && (
                <span className="text-zinc-600 text-sm line-through">
                  ${originalPrice.toFixed(2)}
                </span>
              )}

            </div>

            <div className="flex items-center gap-2">

              <Link
                to={`/products/${product.id}`}
                className="text-[11px] uppercase tracking-widest font-semibold px-4 py-2 rounded border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white transition-colors"
              >
                Details
              </Link>

              <button
                onClick={() => addToCart(product)}
                className={`text-[11px] uppercase tracking-widest font-semibold px-4 py-2 rounded transition-colors ${
                  inCart
                    ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/30'
                    : 'bg-amber-400/10 text-amber-400 border border-amber-400/30 hover:bg-amber-400 hover:text-black'
                }`}
              >
                {inCart ? '✓ In Cart' : 'Add to Cart'}
              </button>

            </div>

          </div>

        </div>

      </div>
    );
  }

  return (
    <div className="group relative bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-600 transition-all duration-300 hover:-translate-y-1">

      <Link
        to={`/products/${product.id}`}
        className="block relative overflow-hidden aspect-3/4"
      >

        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <span className="text-white text-xs uppercase tracking-widest font-semibold border border-white/50 px-4 py-2 rounded">
            View Details
          </span>
        </div>

        {product.badge && (
          <div className="absolute top-3 left-3">
            <Badge label={product.badge} />
          </div>
        )}

        {originalPrice && originalPrice > price && (
          <div className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">
            -{Math.round((1 - price / originalPrice) * 100)}%
          </div>
        )}

      </Link>

      <div className="p-4">

        <p className="text-zinc-500 text-[10px] uppercase tracking-widest mb-1">
          {product.category}
        </p>

        <Link to={`/products/${product.id}`}>
          <h3 className="text-white font-semibold text-sm hover:text-amber-400 transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-1.5 mt-1.5">

          <div className="flex">

            {[1, 2, 3, 4, 5].map((s) => (
              <svg
                key={s}
                className={`w-3 h-3 ${
                  s <= Math.round(rating)
                    ? 'text-amber-400'
                    : 'text-zinc-700'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}

          </div>

          <span className="text-zinc-600 text-[10px]">
            ({product.reviewCount ?? 0})
          </span>

        </div>

        <div className="flex items-center justify-between mt-3">

          <div className="flex items-baseline gap-2">

            <span className="text-white font-bold">
              ${price.toFixed(2)}
            </span>

            {originalPrice && (
              <span className="text-zinc-600 text-xs line-through">
                ${originalPrice.toFixed(2)}
              </span>
            )}

          </div>

          <button
            onClick={() => addToCart(product)}
            className={`text-[10px] uppercase tracking-widest font-semibold px-3 py-1.5 rounded transition-colors ${
              inCart
                ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/30'
                : 'bg-amber-400/10 text-amber-400 border border-amber-400/30 hover:bg-amber-400 hover:text-black'
            }`}
          >
            {inCart ? '✓' : 'Add'}
          </button>

        </div>

      </div>

    </div>
  );
}

type SortKey =
  | 'default'
  | 'price-asc'
  | 'price-desc'
  | 'rating'
  | 'name';

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'default', label: 'Default' },
  { value: 'price-asc', label: 'Price: Low → High' },
  { value: 'price-desc', label: 'Price: High → Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'name', label: 'Name A–Z' },
];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState('');

  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [sort, setSort] = useState<SortKey>('default');

  const [priceMax, setPriceMax] = useState(100000);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeCategory = searchParams.get('category') ?? '';
  const searchQuery = searchParams.get('search') ?? '';

  // =========================
  // GET CATEGORIES
  // =========================

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        setCategoriesError('');

        setCategories(await getCategories());

      } catch (requestError: any) {
        console.error('Categories error:', requestError);

        setCategoriesError(
          requestError.response?.data?.message ||
            'Failed to load categories.'
        );

      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // =========================
  // GET PRODUCTS + IMAGES
  // =========================

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await getProducts();
        console.log("ALL PRODUCTS:", response);
console.table(response.products);

        console.log(
          'Products response:',
          JSON.stringify(response, null, 2)
        );

        let products: any[] = [];

        if (Array.isArray(response)) {
          products = response;

        } else if (Array.isArray(response?.products)) {
          products = response.products;

        } else if (Array.isArray(response?.data)) {
          products = response.data;
        }

        if (products.length > 0) {

          const normalizedProducts = await Promise.all(

            products.map(async (p) => {

              let image = '';

              try {

                const imageResponse =
                  await getImagesByProductId(
                    Number(p.id)
                  );

                console.log(
                  `Image response for product ${p.id}:`,
                  imageResponse
                );

                if (
                  imageResponse?.success &&
                  Array.isArray(imageResponse?.images) &&
                  imageResponse.images.length > 0
                ) {

                  image =
                    imageResponse.images[0]
                      .image_url || '';
                }

              } catch (imageError: any) {

                console.log(
                  `No image found for product ${p.id}`
                );

              }

              return {
                ...p,

                price: Number(p.price) || 0,

                category:
                  p.category ??
                  p.category_name ??
                  '',

                rating:
                  Number(p.rating) || 0,

                reviewCount:
                  Number(p.reviewCount) || 0,

                originalPrice:
                  p.originalPrice
                    ? Number(p.originalPrice)
                    : undefined,

                badge:
                  p.badge ?? undefined,

                image,
              };
            })

          );

          console.log(
            'Products with images:',
            normalizedProducts
          );

          setAllProducts(normalizedProducts);

        } else {

          setAllProducts([]);

          setError('No products found.');

        }

      } catch (error: any) {

        console.error(
          'Products error:',
          error
        );

        setError(
          error.response?.data?.message ||
            'Failed to load products.'
        );

      } finally {

        setLoading(false);

      }
    };

    fetchProducts();

  }, []);

  // =========================
  // FILTER + SORT
  // =========================
  const filtered = useMemo(() => {

    let list = [...allProducts];

    if (activeCategory) {

      list = list.filter((p) => {

        return String(
          (p as any).category_id ??
            (p as any).categoryId ??
            ''
        ) === activeCategory;

      });

    }

    if (searchQuery) {

      const q = searchQuery.toLowerCase();

      list = list.filter((p) => {

        const name = String(
          p.name ?? ''
        ).toLowerCase();

        const category = String(
          p.category ??
            (p as any).category_name ??
            ''
        ).toLowerCase();

        const description = String(
          p.description ?? ''
        ).toLowerCase();

        return (
          name.includes(q) ||
          category.includes(q) ||
          description.includes(q)
        );

      });

    }

    list = list.filter(
      (p) =>
        Number(p.price) <= priceMax
    );

    switch (sort) {

      case 'price-asc':

        list.sort(
          (a, b) =>
            Number(a.price) -
            Number(b.price)
        );

        break;

      case 'price-desc':

        list.sort(
          (a, b) =>
            Number(b.price) -
            Number(a.price)
        );

        break;

      case 'rating':

        list.sort(
          (a, b) =>
            Number(b.rating) -
            Number(a.rating)
        );

        break;

      case 'name':

        list.sort((a, b) =>
          String(a.name ?? '').localeCompare(
            String(b.name ?? '')
          )
        );

        break;
    }

    return list;

  }, [
    allProducts,
    activeCategory,
    searchQuery,
    priceMax,
    sort,
  ]);

  // =========================
  // CATEGORY
  // =========================

  const setCategory = (slug: string) => {

    if (slug) {

      setSearchParams({
        category: slug,
      });

    } else {

      setSearchParams({});

    }

  };

  // =========================
  // SIDEBAR
  // =========================

  const Sidebar = () => (
    <aside className="space-y-8">

      <div>

        <h3 className="text-white text-xs font-semibold uppercase tracking-widest mb-4">
          Categories
        </h3>

        <ul className="space-y-1">

          <li>

            <button
              onClick={() => setCategory('')}
              className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                !activeCategory
                  ? 'bg-amber-400/10 text-amber-400'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              All Products

              <span className="text-xs text-zinc-600">
                {allProducts.length}
              </span>

            </button>

          </li>

          {categoriesLoading ? (

            <li className="text-zinc-500 text-sm px-3 py-2">
              Loading categories...
            </li>

          ) : categoriesError ? (

            <li className="text-red-400 text-sm px-3 py-2">
              {categoriesError}
            </li>

          ) : categories.length === 0 ? (

            <li className="text-zinc-500 text-sm px-3 py-2">
              No categories found
            </li>

          ) : categories.map((cat) => (

            <li key={cat.id}>

              <button
                onClick={() =>
                  setCategory(String(cat.id))
                }
                className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                  activeCategory === String(cat.id)
                    ? 'bg-amber-400/10 text-amber-400'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                {cat.name}
              </button>

            </li>

          ))}

        </ul>

      </div>

      <div>

        <h3 className="text-white text-xs font-semibold uppercase tracking-widest mb-4">
          Max Price:{' '}
          <span className="text-amber-400">
            ${priceMax}
          </span>
        </h3>

        <input
          type="range"
          min={50}
          max={10000000}
          step={10}
          value={priceMax}
          onChange={(e) =>
            setPriceMax(
              Number(e.target.value)
            )
          }
          className="w-full accent-amber-400 cursor-pointer"
        />

        <div className="flex justify-between text-zinc-600 text-xs mt-1">
          <span>$50</span>
          <span>$100000</span>
        </div>

      </div>

      <div>

        <h3 className="text-white text-xs font-semibold uppercase tracking-widest mb-4">
          Tags
        </h3>

        <div className="flex flex-wrap gap-2">

          {(
            [
              'New',
              'Sale',
              'Limited',
              'Bestseller',
            ] as const
          ).map((badge) => (

            <span
              key={badge}
              className="text-xs px-3 py-1 rounded-full border border-zinc-700 text-zinc-400 hover:border-amber-400/40 hover:text-amber-400 cursor-pointer transition-colors"
            >
              {badge}
            </span>

          ))}

        </div>

      </div>

    </aside>
  );

  // =========================
  // PAGE
  // =========================

  return (
    <div className="min-h-screen bg-[#090909]">

      <div className="bg-[#0a0a0a] border-b border-zinc-800">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          <p className="text-amber-400 text-xs uppercase tracking-[0.3em] font-semibold mb-2">
            Explore
          </p>

          <h1 className="text-white text-4xl font-bold">

            {activeCategory

              ? categories.find(
                  (category) =>
                    String(category.id) ===
                    activeCategory
                )?.name ?? 'Products'

              : searchQuery

              ? `Results for "${searchQuery}"`

              : 'All Products'}

          </h1>

          <div className="flex items-center gap-2 mt-3 text-zinc-600 text-xs">

            <Link
              to="/"
              className="hover:text-amber-400 transition-colors"
            >
              Home
            </Link>

            <span>/</span>

            <span className="text-zinc-400">
              Shop
            </span>

            {activeCategory && (
              <>
                <span>/</span>

                <span className="text-zinc-400 capitalize">
                  {activeCategory}
                </span>
              </>
            )}

          </div>

        </div>

      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {loading && (

          <div className="flex flex-col items-center justify-center py-24">

            <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mb-4" />

            <p className="text-zinc-500 text-sm">
              Loading products...
            </p>

          </div>

        )}

        {!loading && error && (

          <div className="flex flex-col items-center justify-center py-24 text-center">

            <div className="w-16 h-16 rounded-full bg-red-400/10 border border-red-400/20 flex items-center justify-center mb-4">

              <svg
                className="w-7 h-7 text-red-400"
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

            </div>

            <h3 className="text-white font-semibold text-lg mb-2">
              Unable to load products
            </h3>

            <p className="text-zinc-500 text-sm">
              {error}
            </p>

          </div>

        )}

        {!loading && !error && (

          <div className="flex gap-8">

            <div className="hidden lg:block w-56 shrink-0 pt-1">
              <Sidebar />
            </div>

            <div className="flex-1 min-w-0">

              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">

                <div className="flex items-center gap-3">

                  <button
                    onClick={() =>
                      setSidebarOpen(
                        (o) => !o
                      )
                    }
                    className="lg:hidden flex items-center gap-2 text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-600 text-xs uppercase tracking-widest px-3 py-2 rounded transition-colors"
                  >
                    Filters
                  </button>

                  <p className="text-zinc-500 text-sm">

                    <span className="text-white font-semibold">
                      {filtered.length}
                    </span>{' '}

                    products

                  </p>

                </div>

                <div className="flex items-center gap-3">

                  <select
                    value={sort}
                    onChange={(e) =>
                      setSort(
                        e.target.value as SortKey
                      )
                    }
                    className="bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs rounded px-3 py-2 outline-none focus:border-amber-400 transition-colors cursor-pointer"
                  >

                    {SORT_OPTIONS.map((o) => (

                      <option
                        key={o.value}
                        value={o.value}
                      >
                        {o.label}
                      </option>

                    ))}

                  </select>

                  <div className="flex border border-zinc-700 rounded overflow-hidden">

                    <button
                      onClick={() =>
                        setView('grid')
                      }
                      className={`p-2 transition-colors ${
                        view === 'grid'
                          ? 'bg-amber-400 text-black'
                          : 'text-zinc-500 hover:text-white'
                      }`}
                      aria-label="Grid view"
                    >
                      Grid
                    </button>

                    <button
                      onClick={() =>
                        setView('list')
                      }
                      className={`p-2 transition-colors ${
                        view === 'list'
                          ? 'bg-amber-400 text-black'
                          : 'text-zinc-500 hover:text-white'
                      }`}
                      aria-label="List view"
                    >
                      List
                    </button>

                  </div>

                </div>

              </div>

              {sidebarOpen && (

                <div className="lg:hidden mb-6 bg-zinc-900/80 border border-zinc-800 rounded-xl p-5">
                  <Sidebar />
                </div>

              )}

              {(activeCategory ||
                searchQuery) && (

                <div className="flex flex-wrap items-center gap-2 mb-5">

                  <span className="text-zinc-500 text-xs uppercase tracking-widest">
                    Active:
                  </span>

                  {activeCategory && (

                    <button
                      onClick={() =>
                        setCategory('')
                      }
                      className="flex items-center gap-1.5 text-xs bg-amber-400/10 text-amber-400 border border-amber-400/30 px-3 py-1 rounded-full hover:bg-amber-400/20 transition-colors"
                    >
                      {activeCategory}
                      <span>×</span>
                    </button>

                  )}

                  {searchQuery && (

                    <button
                      onClick={() =>
                        setSearchParams({})
                      }
                      className="flex items-center gap-1.5 text-xs bg-zinc-800 text-zinc-300 border border-zinc-700 px-3 py-1 rounded-full hover:bg-zinc-700 transition-colors"
                    >
                      "{searchQuery}"
                      <span>×</span>
                    </button>

                  )}

                </div>

              )}

              {filtered.length === 0 ? (

                <div className="flex flex-col items-center justify-center py-24 text-center">

                  <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4">

                    <svg
                      className="w-7 h-7 text-zinc-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.6}
                        d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"
                      />
                    </svg>

                  </div>

                  <h3 className="text-white font-semibold text-lg mb-2">
                    No products found
                  </h3>

                  <p className="text-zinc-500 text-sm mb-5">
                    Try adjusting your filters or search terms.
                  </p>

                  <button
                    onClick={() => {
                      setSearchParams({});
                      setPriceMax(100000);
                    }}
                    className="bg-amber-400 hover:bg-amber-300 text-black font-semibold text-xs uppercase tracking-widest px-6 py-2.5 rounded transition-colors"
                  >
                    Clear Filters
                  </button>

                </div>

              ) : view === 'grid' ? (

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">

                  {filtered.map((p) => (

                    <ProductCard
                      key={p.id}
                      product={p}
                      view="grid"
                    />

                  ))}

                </div>

              ) : (

                <div className="space-y-4">

                  {filtered.map((p) => (

                    <ProductCard
                      key={p.id}
                      product={p}
                      view="list"
                    />

                  ))}

                </div>

              )}

            </div>

          </div>

        )}

      </div>

    </div>
  );
}