import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../components/context/CartContext';
import { getProductById, getProducts } from '../api/productApi';
import { getImagesByProductId } from '../api/productImgApi';
import type { Product } from '../components/services/productService';

const getImageUrl = (value: any): string => {
  if (typeof value === 'string') return value.trim();
  if (!value || typeof value !== 'object') return '';

  const url = value.image_url ?? value.imageUrl ?? value.url;
  return typeof url === 'string' ? url.trim() : '';
};

const getFirstProductImage = (value: any): string => {
  const candidates = Array.isArray(value)
    ? value
    : [
        value?.image,
        value?.image_url,
        ...(Array.isArray(value?.images) ? value.images : []),
      ];

  return candidates.map(getImageUrl).find(Boolean) ?? '';
};

function Badge({ label }: { label: string }) {
  const colors: Record<string, string> = {
    New: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
    Sale: 'bg-red-400/10 text-red-400 border-red-400/20',
    Limited: 'bg-purple-400/10 text-purple-400 border-purple-400/20',
    Bestseller: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wider border ${
        colors[label] ??
        'bg-zinc-700 text-zinc-400 border-zinc-600'
      }`}
    >
      {label}
    </span>
  );
}

function RelatedCard({ product }: { product: Product }) {
  const { addToCart } = useCart();

  const price = Number(product.price) || 0;

  return (
    <div className="group bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-600 transition-all hover:-translate-y-1 duration-300">
      <Link
        to={`/products/${product.id}`}
        className="block relative overflow-hidden aspect-3/4"
      >
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-600">
            No Image
          </div>
        )}

        {product.badge && (
          <div className="absolute top-3 left-3">
            <Badge label={product.badge} />
          </div>
        )}
      </Link>

      <div className="p-4">
        <p className="text-zinc-500 text-[10px] uppercase tracking-widest mb-1">
          {product.category}
        </p>

        <Link to={`/products/${product.id}`}>
          <h4 className="text-white font-semibold text-sm hover:text-amber-400 transition-colors line-clamp-1">
            {product.name}
          </h4>
        </Link>

        <div className="flex items-center justify-between mt-3">
          <span className="text-white font-bold">
            ${price.toFixed(2)}
          </span>

          <button
            onClick={() => addToCart(product)}
            className="text-[10px] uppercase tracking-widest font-semibold px-3 py-1.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/30 hover:bg-amber-400 hover:text-black transition-colors"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

const MOCK_REVIEWS = [
  {
    id: 1,
    name: 'Elena V.',
    rating: 5,
    date: '2026-08-15',
    comment:
      'Absolutely stunning piece. The quality is unmatched — the fabric drapes perfectly and the construction feels extremely premium. Worth every cent.',
  },
  {
    id: 2,
    name: 'Marcus L.',
    rating: 5,
    date: '2026-08-02',
    comment:
      "I've bought from several luxury brands and this stands up. The attention to detail is remarkable. Shipping was faster than expected too.",
  },
  {
    id: 3,
    name: 'Sophie K.',
    rating: 4,
    date: '2026-07-22',
    comment:
      'Excellent item, fits true to size. The colour in real life is slightly deeper than in the photos, which I actually prefer. Highly recommend.',
  },
];

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { addToCart, isInCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [imageLoadFailed, setImageLoadFailed] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  const [quantity, setQuantity] = useState(1);

  const [activeTab, setActiveTab] = useState<
    'description' | 'reviews' | 'shipping'
  >('description');

  const [addedFeedback, setAddedFeedback] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError('');

        if (!id) {
          setError('Product ID is missing.');
          return;
        }

        const productResponse = await getProductById(
          Number(id)
        );

        console.log(
          'Product details response:',
          productResponse
        );

        let productData: any = null;

        if (productResponse?.product) {
          productData = productResponse.product;
        } else if (productResponse?.data) {
          productData = productResponse.data;
        } else if (productResponse?.id) {
          productData = productResponse;
        }

        if (!productData) {
          setError('Product not found.');
          return;
        }

        let image = getFirstProductImage(productData);

        if (!image) {
          try {
            const imageResponse = await getImagesByProductId(
              Number(productData.id)
            );
            image = getFirstProductImage(imageResponse?.images);
          } catch (imageError: any) {
            if (imageError?.response?.status !== 404) {
              console.error('Product image load error:', imageError);
            }
          }
        }

        // Normalize backend response
        const normalizedProduct: Product = {
          ...productData,

          id: Number(productData.id),

          name: productData.name ?? '',

          description:
            productData.description ?? '',

          price: Number(productData.price) || 0,

          stock: Number(productData.stock) || 0,

          category:
            productData.category ??
            productData.category_name ??
            '',

          image,

          rating:
            Number(productData.rating) || 0,

          reviewCount:
            Number(productData.reviewCount) || 0,

          originalPrice:
            productData.originalPrice
              ? Number(productData.originalPrice)
              : undefined,

          badge:
            productData.badge ??
            undefined,

          colors:
            Array.isArray(productData.colors)
              ? productData.colors
              : [],

          sizes:
            Array.isArray(productData.sizes)
              ? productData.sizes
              : [],
        };

        setImageLoadFailed(false);
        setProduct(normalizedProduct);

        // Fetch related products
        try {
          const productsResponse =
            await getProducts();

          let productsData: any[] = [];

          if (Array.isArray(productsResponse)) {
            productsData = productsResponse;
          } else if (
            Array.isArray(
              productsResponse?.products
            )
          ) {
            productsData =
              productsResponse.products;
          } else if (
            Array.isArray(productsResponse?.data)
          ) {
            productsData =
              productsResponse.data;
          }

          const normalizedRelated: Product[] =
            productsData.map((p) => ({
              ...p,

              id: Number(p.id),

              name: p.name ?? '',

              description:
                p.description ?? '',

              price: Number(p.price) || 0,

              stock: Number(p.stock) || 0,

              category:
                p.category ??
                p.category_name ??
                '',

              image:
                p.image ??
                p.image_url ??
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

              colors:
                Array.isArray(p.colors)
                  ? p.colors
                  : [],

              sizes:
                Array.isArray(p.sizes)
                  ? p.sizes
                  : [],
            }));

          setRelated(
            normalizedRelated
              .filter(
                (p) =>
                  p.category ===
                    normalizedProduct.category &&
                  p.id !== normalizedProduct.id
              )
              .slice(0, 4)
          );
        } catch (relatedError) {
          console.error(
            'Related products error:',
            relatedError
          );
        }
      } catch (error: any) {
        console.error(
          'Product details error:',
          error
        );

        setError(
          error.response?.data?.message ||
            'Failed to load product.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090909] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />

          <p className="text-zinc-500 text-sm">
            Loading product...
          </p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#090909] flex items-center justify-center">
        <div className="text-center space-y-4 px-6">
          <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto">
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
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <h2 className="text-white text-xl font-bold">
            Product not found
          </h2>

          <p className="text-zinc-500 text-sm">
            {error ||
              "This product doesn't exist or has been removed."}
          </p>

          <button
            onClick={() => navigate('/products')}
            className="bg-amber-400 hover:bg-amber-300 text-black font-semibold text-sm px-6 py-2.5 rounded transition-colors"
          >
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  const inCart = isInCart(product.id);

  const price = Number(product.price) || 0;

  const stock = Number(product.stock) || 0;

  const rating = Number(product.rating) || 0;

  const originalPrice = product.originalPrice
    ? Number(product.originalPrice)
    : null;

  const handleAddToCart = () => {
    addToCart(product, quantity);

    setAddedFeedback(true);

    setTimeout(() => {
      setAddedFeedback(false);
    }, 2500);
  };

  const discount =
    originalPrice && originalPrice > price
      ? Math.round(
          (1 - price / originalPrice) * 100
        )
      : null;

  return (
    <div className="min-h-screen bg-[#090909]">

      {/* Breadcrumb */}
      <div className="border-b border-zinc-800/50 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-zinc-600 text-xs">

            <Link
              to="/"
              className="hover:text-amber-400 transition-colors"
            >
              Home
            </Link>

            <span>/</span>

            <Link
              to="/products"
              className="hover:text-amber-400 transition-colors"
            >
              Shop
            </Link>

            <span>/</span>

            <span className="text-zinc-400 line-clamp-1">
              {product.name}
            </span>

          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Product Main */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-16">

          {/* Image */}
          <div className="space-y-3">

            <div className="relative rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 aspect-4/5">

              {product.image && !imageLoadFailed ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={() => setImageLoadFailed(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-600">
                  <div className="text-center">
                    <div className="text-5xl mb-3">
                      🛍️
                    </div>

                    <p className="text-sm">
                      Product Image
                    </p>
                  </div>
                </div>
              )}

              {product.badge && (
                <div className="absolute top-4 left-4">
                  <Badge label={product.badge} />
                </div>
              )}

              {discount !== null && (
                <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                  -{discount}%
                </div>
              )}

            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col">

            <p className="text-amber-400 text-xs uppercase tracking-[0.3em] font-semibold mb-2">
              {product.category || 'Product'}
            </p>

            <h1 className="text-white text-4xl font-bold leading-tight tracking-tight mb-4">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-5">

              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <svg
                    key={s}
                    className={`w-4 h-4 ${
                      s <= Math.round(rating)
                        ? 'text-amber-400'
                        : 'text-zinc-700'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              <span className="text-white font-semibold text-sm">
                {rating}
              </span>

              <span className="text-zinc-600 text-sm">
                ({product.reviewCount ?? 0} reviews)
              </span>

            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6 pb-6 border-b border-zinc-800">

              <span className="text-white text-4xl font-black">
                ${price.toFixed(2)}
              </span>

              {originalPrice && (
                <>
                  <span className="text-zinc-600 text-xl line-through">
                    ${originalPrice.toFixed(2)}
                  </span>

                  <span className="text-red-400 text-sm font-semibold bg-red-400/10 px-2 py-0.5 rounded">
                    Save $
                    {(originalPrice - price).toFixed(2)}
                  </span>
                </>
              )}

            </div>

            {/* Description */}
            <p className="text-zinc-400 text-sm leading-relaxed mb-6">
              {product.description}
            </p>

            {/* Colors */}
            {product.colors &&
              product.colors.length > 0 && (
                <div className="mb-5">

                  <p className="text-zinc-400 text-xs uppercase tracking-widest font-medium mb-3">
                    Color:{' '}
                    <span className="text-white">
                      {selectedColor || 'Select'}
                    </span>
                  </p>

                  <div className="flex flex-wrap gap-2">

                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() =>
                          setSelectedColor(color)
                        }
                        className={`text-xs px-4 py-2 rounded-lg border transition-colors ${
                          selectedColor === color
                            ? 'border-amber-400 text-amber-400 bg-amber-400/10'
                            : 'border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white'
                        }`}
                      >
                        {color}
                      </button>
                    ))}

                  </div>
                </div>
              )}

            {/* Sizes */}
            {product.sizes &&
              product.sizes.length > 0 && (
                <div className="mb-6">

                  <div className="flex items-center justify-between mb-3">

                    <p className="text-zinc-400 text-xs uppercase tracking-widest font-medium">
                      Size:{' '}
                      <span className="text-white">
                        {selectedSize || 'Select'}
                      </span>
                    </p>

                    <button className="text-amber-400 text-xs hover:text-amber-300 transition-colors underline">
                      Size Guide
                    </button>

                  </div>

                  <div className="flex flex-wrap gap-2">

                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() =>
                          setSelectedSize(size)
                        }
                        className={`w-12 h-10 text-sm rounded-lg border font-medium transition-colors ${
                          selectedSize === size
                            ? 'border-amber-400 text-amber-400 bg-amber-400/10'
                            : 'border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white'
                        }`}
                      >
                        {size}
                      </button>
                    ))}

                  </div>
                </div>
              )}

            {/* Quantity */}
            <div className="mb-6">

              <p className="text-zinc-400 text-xs uppercase tracking-widest font-medium mb-3">
                Quantity
              </p>

              <div className="flex items-center gap-3">

                <div className="flex items-center border border-zinc-700 rounded-lg overflow-hidden">

                  <button
                    onClick={() =>
                      setQuantity((q) =>
                        Math.max(1, q - 1)
                      )
                    }
                    className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                  >
                    −
                  </button>

                  <span className="w-12 text-center text-white font-semibold text-sm">
                    {quantity}
                  </span>

                  <button
                    onClick={() =>
                      setQuantity((q) =>
                        Math.min(
                          Math.max(stock, 1),
                          q + 1
                        )
                      )
                    }
                    disabled={stock <= 0}
                    className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-30"
                  >
                    +
                  </button>

                </div>

                <p
                  className={`text-xs ${
                    stock < 10
                      ? 'text-red-400'
                      : 'text-zinc-500'
                  }`}
                >
                  {stock <= 0
                    ? 'Out of stock'
                    : stock < 10
                    ? `Only ${stock} left!`
                    : `${stock} in stock`}
                </p>

              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mb-6">

              <button
                onClick={handleAddToCart}
                disabled={stock <= 0}
                className={`flex-1 font-bold uppercase tracking-widest text-sm py-4 rounded-lg transition-all flex items-center justify-center gap-2 ${
                  stock <= 0
                    ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                    : addedFeedback
                    ? 'bg-emerald-400 text-black'
                    : inCart
                    ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/30 hover:bg-emerald-400 hover:text-black'
                    : 'bg-amber-400 hover:bg-amber-300 text-black'
                }`}
              >
                {stock <= 0
                  ? 'Out of Stock'
                  : addedFeedback
                  ? '✓ Added to Cart!'
                  : inCart
                  ? '✓ In Cart — Add More'
                  : 'Add to Cart'}
              </button>

              <Link
                to="/cart"
                className="flex-1 border border-zinc-700 hover:border-zinc-500 text-white font-bold uppercase tracking-widest text-sm py-4 rounded-lg transition-colors text-center flex items-center justify-center"
              >
                View Cart
              </Link>

            </div>

            {/* Meta */}
            <div className="space-y-2 pt-4 border-t border-zinc-800">

              {[
                {
                  label: 'Free shipping',
                  sub: 'on orders over $300',
                },
                {
                  label: '30-day returns',
                  sub: 'hassle-free policy',
                },
                {
                  label: 'Authenticity guaranteed',
                  sub: 'genuine luxury pieces',
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-2 text-xs text-zinc-500"
                >
                  <span className="text-amber-400">
                    ✓
                  </span>

                  <span>
                    <span className="text-zinc-300">
                      {item.label}
                    </span>{' '}
                    — {item.sub}
                  </span>
                </div>
              ))}

            </div>

          </div>
        </div>

        {/* Tabs */}
        <div className="mt-16">

          <div className="flex border-b border-zinc-800 mb-8">

            {(
              [
                'description',
                'reviews',
                'shipping',
              ] as const
            ).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-sm font-medium uppercase tracking-widest transition-colors border-b-2 -mb-px ${
                  activeTab === tab
                    ? 'border-amber-400 text-amber-400'
                    : 'border-transparent text-zinc-500 hover:text-white'
                }`}
              >
                {tab === 'reviews'
                  ? `Reviews (${MOCK_REVIEWS.length})`
                  : tab.charAt(0).toUpperCase() +
                    tab.slice(1)}
              </button>
            ))}

          </div>

          {/* Description */}
          {activeTab === 'description' && (
            <div className="max-w-2xl">

              <p className="text-zinc-400 leading-relaxed text-sm">
                {product.description}
              </p>

              <ul className="mt-6 space-y-2">

                {[
                  'Premium materials & craftsmanship',
                  'Designed for longevity',
                  'Sustainably produced where possible',
                  'Ships in signature DARKSTORE packaging',
                ].map((feat) => (
                  <li
                    key={feat}
                    className="flex items-center gap-2 text-zinc-500 text-sm"
                  >
                    <span className="text-amber-400">
                      ✓
                    </span>

                    {feat}
                  </li>
                ))}

              </ul>
            </div>
          )}

          {/* Reviews */}
          {activeTab === 'reviews' && (
            <div className="space-y-5 max-w-2xl">

              {MOCK_REVIEWS.map((review) => (
                <div
                  key={review.id}
                  className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5"
                >

                  <div className="flex items-center justify-between mb-3">

                    <div className="flex items-center gap-3">

                      <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-amber-400 font-bold text-xs">
                        {review.name.charAt(0)}
                      </div>

                      <div>
                        <p className="text-white text-sm font-medium">
                          {review.name}
                        </p>

                        <p className="text-zinc-600 text-xs">
                          {review.date}
                        </p>
                      </div>

                    </div>

                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(
                        (s) => (
                          <span
                            key={s}
                            className={`text-sm ${
                              s <= review.rating
                                ? 'text-amber-400'
                                : 'text-zinc-700'
                            }`}
                          >
                            ★
                          </span>
                        )
                      )}
                    </div>

                  </div>

                  <p className="text-zinc-400 text-sm leading-relaxed">
                    {review.comment}
                  </p>

                </div>
              ))}

            </div>
          )}

          {/* Shipping */}
          {activeTab === 'shipping' && (
            <div className="max-w-2xl space-y-4">

              {[
                {
                  title: 'Standard Shipping',
                  detail:
                    '5–8 business days · Free on orders over $300 · $12 flat rate otherwise',
                },
                {
                  title: 'Express Shipping',
                  detail:
                    '2–3 business days · $28 flat rate',
                },
                {
                  title: 'Returns Policy',
                  detail:
                    'Unused items may be returned within 30 days in original packaging for a full refund or exchange.',
                },
                {
                  title: 'International',
                  detail:
                    'We ship worldwide. Duties and taxes may apply depending on your country.',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5"
                >
                  <p className="text-white font-semibold text-sm mb-1">
                    {item.title}
                  </p>

                  <p className="text-zinc-500 text-sm leading-relaxed">
                    {item.detail}
                  </p>
                </div>
              ))}

            </div>
          )}

        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-16">

            <div className="flex items-end justify-between mb-8">

              <div>
                <p className="text-amber-400 text-xs uppercase tracking-[0.3em] font-semibold mb-2">
                  You may also like
                </p>

                <h2 className="text-white text-2xl font-bold">
                  Related Pieces
                </h2>
              </div>

              <Link
                to="/products"
                className="text-zinc-400 hover:text-amber-400 text-sm uppercase tracking-widest transition-colors hidden sm:block"
              >
                View All →
              </Link>

            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">

              {related.map((p) => (
                <RelatedCard
                  key={p.id}
                  product={p}
                />
              ))}

            </div>

          </div>
        )}

      </div>
    </div>
  );
}