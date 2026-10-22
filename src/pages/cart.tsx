import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

import { useCart } from '../components/context/CartContext';

export default function Cart() {
  const {
    items,
    totalItems,
    totalPrice,
    updateQuantity,
    removeFromCart,
    clearCart
  } = useCart();

  const navigate = useNavigate();

  // =========================
  // COUPON STATE
  // =========================

  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponMessage, setCouponMessage] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  // =========================
  // PRICE CALCULATION
  // =========================

  const shipping = totalPrice >= 300 ? 0 : 12;

  const tax =
    Math.round(totalPrice * 0.08 * 100) / 100;

  const grandTotal =
    totalPrice +
    shipping +
    tax -
    discountAmount;

  // =========================
  // APPLY COUPON
  // =========================

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponMessage('Please enter a coupon code');
      setCouponApplied(false);
      setDiscountAmount(0);
      return;
    }

    try {
      setCouponLoading(true);
      setCouponMessage('');

      const token = localStorage.getItem('token');

      const response = await axios.post(
        'http://localhost:5000/api/coupon/validate',
        {
          code: couponCode.trim().toUpperCase(),

          // IMPORTANT
          subtotal: Number(totalPrice)
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log(
        'COUPON RESPONSE:',
        response.data
      );

      if (response.data.success) {
        setCouponApplied(true);

        setCouponCode(
          response.data.coupon.code
        );

        setDiscountAmount(
          Number(response.data.discountAmount)
        );

        setCouponMessage(
          `Coupon applied! You saved $${Number(
            response.data.discountAmount
          ).toFixed(2)}`
        );
      } else {
        setCouponApplied(false);
        setDiscountAmount(0);

        setCouponMessage(
          response.data.message ||
          'Invalid coupon'
        );
      }

    } catch (error: any) {

      console.error(
        'COUPON ERROR:',
        error.response?.data || error
      );

      setCouponApplied(false);
      setDiscountAmount(0);

      setCouponMessage(
        error.response?.data?.message ||
        'Failed to apply coupon'
      );

    } finally {
      setCouponLoading(false);
    }
  };

  // =========================
  // REMOVE COUPON
  // =========================

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setCouponApplied(false);
    setDiscountAmount(0);
    setCouponMessage('');
  };

  // =========================
  // IF CART CHANGES
  // REMOVE OLD COUPON
  // =========================

  useEffect(() => {
    if (couponApplied) {
      setCouponApplied(false);
      setDiscountAmount(0);
      setCouponMessage('');
    }
  }, [items]);

  // =========================
  // EMPTY CART
  // =========================

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#090909] flex items-center justify-center px-4">

        <div className="text-center max-w-sm space-y-5">

          <div className="w-20 h-20 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto">

            <svg
              className="w-9 h-9 text-zinc-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"
              />
            </svg>

          </div>

          <div>

            <h2 className="text-white text-2xl font-bold mb-2">
              Your cart is empty
            </h2>

            <p className="text-zinc-500 text-sm leading-relaxed">
              You haven't added anything yet. Browse the collection and find
              something worth wearing.
            </p>

          </div>

          <Link
            to="/products"
            className="inline-block bg-amber-400 hover:bg-amber-300 text-black font-bold uppercase tracking-widest text-sm px-8 py-3.5 rounded transition-colors"
          >
            Browse Collection
          </Link>

        </div>

      </div>
    );
  }

  // =========================
  // MAIN CART
  // =========================

  return (
    <div className="min-h-screen bg-[#090909]">

      {/* =========================
          PAGE HEADER
      ========================= */}

      <div className="bg-[#0a0a0a] border-b border-zinc-800">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          <div className="flex items-end justify-between">

            <div>

              <p className="text-amber-400 text-xs uppercase tracking-[0.3em] font-semibold mb-2">
                Shopping
              </p>

              <h1 className="text-white text-4xl font-bold">
                Your Cart
              </h1>

              <p className="text-zinc-500 text-sm mt-1">
                {totalItems} item
                {totalItems !== 1 ? 's' : ''}
              </p>

            </div>

            <button
              onClick={clearCart}
              className="text-zinc-600 hover:text-red-400 text-xs uppercase tracking-widest transition-colors hidden sm:block"
            >
              Clear Cart
            </button>

          </div>

        </div>

      </div>

      {/* =========================
          CONTENT
      ========================= */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* =========================
              CART ITEMS
          ========================= */}

          <div className="lg:col-span-2 space-y-4">

            {/* FREE SHIPPING */}

            {totalPrice < 300 && (
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl px-5 py-4">

                <div className="flex items-center justify-between mb-2">

                  <p className="text-zinc-400 text-xs">

                    Add{' '}

                    <span className="text-amber-400 font-semibold">
                      ${(300 - totalPrice).toFixed(2)}
                    </span>{' '}

                    more for free shipping

                  </p>

                  <span className="text-zinc-600 text-xs">
                    ${totalPrice.toFixed(2)} / $300
                  </span>

                </div>

                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">

                  <div
                    className="h-full bg-amber-400 rounded-full transition-all"
                    style={{
                      width: `${Math.min(
                        (totalPrice / 300) * 100,
                        100
                      )}%`
                    }}
                  />

                </div>

              </div>
            )}

            {totalPrice >= 300 && (
              <div className="bg-emerald-400/5 border border-emerald-400/20 rounded-xl px-5 py-3 flex items-center gap-2">

                <svg
                  className="w-4 h-4 text-emerald-400 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>

                <p className="text-emerald-400 text-xs font-medium">
                  You qualify for free shipping!
                </p>

              </div>
            )}

            {/* =========================
                ITEMS
            ========================= */}

            {items.map((item) => {

              const {
                product,
                quantity
              } = item;

              return (
                <div
                  key={item.cartItemId}
                  className="bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-colors"
                >

                  <div className="flex gap-0">

                    {/* IMAGE */}

                    <Link
                      to={`/products/${product.id}`}
                      className="shrink-0 w-28 sm:w-36"
                    >

                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />

                    </Link>

                    {/* DETAILS */}

                    <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between min-w-0">

                      <div className="flex items-start justify-between gap-2">

                        <div className="min-w-0">

                          <p className="text-zinc-500 text-[10px] uppercase tracking-widest mb-0.5">
                            {product.category}
                          </p>

                          <Link
                            to={`/products/${product.id}`}
                          >

                            <h3 className="text-white font-semibold text-sm hover:text-amber-400 transition-colors line-clamp-2 leading-snug">
                              {product.name}
                            </h3>

                          </Link>

                          {product.badge && (
                            <span
                              className={`inline-flex items-center mt-1.5 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${
                                product.badge === 'Sale'
                                  ? 'bg-red-400/10 text-red-400 border-red-400/20'
                                  : product.badge === 'New'
                                  ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20'
                                  : 'bg-amber-400/10 text-amber-400 border-amber-400/20'
                              }`}
                            >
                              {product.badge}
                            </span>
                          )}

                        </div>

                        {/* REMOVE */}

                        <button
                          onClick={() =>
                            removeFromCart(
                              item.cartItemId!
                            )
                          }
                          className="text-zinc-600 hover:text-red-400 transition-colors shrink-0 mt-0.5"
                          aria-label="Remove item"
                        >

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
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />

                          </svg>

                        </button>

                      </div>

                      <div className="flex items-center justify-between mt-3 flex-wrap gap-2">

                        {/* QUANTITY */}

                        <div className="flex items-center border border-zinc-700 rounded-lg overflow-hidden">

                          <button
                            onClick={() =>
                              updateQuantity(
                                item.cartItemId!,
                                quantity - 1
                              )
                            }
                            disabled={!item.cartItemId}
                            className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-50"
                          >

                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >

                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M20 12H4"
                              />

                            </svg>

                          </button>

                          <span className="w-8 text-center text-white text-sm font-semibold">
                            {quantity}
                          </span>

                          <button
                            onClick={() =>
                              updateQuantity(
                                item.cartItemId!,
                                quantity + 1
                              )
                            }
                            disabled={!item.cartItemId}
                            className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-50"
                          >

                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >

                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4v16m8-8H4"
                              />

                            </svg>

                          </button>

                        </div>

                        {/* PRICE */}

                        <div className="text-right">

                          <p className="text-white font-bold">
                            ${(product.price * quantity).toLocaleString()}
                          </p>

                          {quantity > 1 && (
                            <p className="text-zinc-600 text-xs">
                              ${product.price} each
                            </p>
                          )}

                        </div>

                      </div>

                    </div>

                  </div>

                </div>
              );
            })}

          </div>

          {/* =========================
              ORDER SUMMARY
          ========================= */}

          <div className="lg:col-span-1">

            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 sticky top-20 space-y-4">

              <h2 className="text-white font-bold text-base tracking-wide">
                Order Summary
              </h2>

              <div className="space-y-2.5 pt-1">

                {/* SUBTOTAL */}

                <div className="flex justify-between text-sm">

                  <span className="text-zinc-400">
                    Subtotal ({totalItems} items)
                  </span>

                  <span className="text-white">
                    ${totalPrice.toFixed(2)}
                  </span>

                </div>

                {/* SHIPPING */}

                <div className="flex justify-between text-sm">

                  <span className="text-zinc-400">
                    Shipping
                  </span>

                  <span
                    className={
                      shipping === 0
                        ? 'text-emerald-400 font-medium'
                        : 'text-white'
                    }
                  >
                    {shipping === 0
                      ? 'Free'
                      : `$${shipping}`}
                  </span>

                </div>

                {/* TAX */}

                <div className="flex justify-between text-sm">

                  <span className="text-zinc-400">
                    Tax (8%)
                  </span>

                  <span className="text-white">
                    ${tax.toFixed(2)}
                  </span>

                </div>

                {/* DISCOUNT */}

                {couponApplied && (
                  <div className="flex justify-between text-sm">

                    <span className="text-emerald-400">
                      Discount ({couponCode})
                    </span>

                    <span className="text-emerald-400 font-medium">
                      -${discountAmount.toFixed(2)}
                    </span>

                  </div>
                )}

              </div>

              {/* TOTAL */}

              <div className="border-t border-zinc-800 pt-4 flex justify-between">

                <span className="text-white font-bold">
                  Total
                </span>

                <span className="text-amber-400 font-black text-xl">
                  ${Math.max(grandTotal, 0).toFixed(2)}
                </span>

              </div>

              {/* =========================
                  COUPON INPUT
              ========================= */}

              <div>

                <div className="flex gap-2">

                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) =>
                      setCouponCode(
                        e.target.value.toUpperCase()
                      )
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleApplyCoupon();
                      }
                    }}
                    placeholder="Promo code"
                    disabled={couponApplied}
                    className="flex-1 bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-600 text-xs px-3 py-2.5 rounded-lg focus:outline-none focus:border-amber-400 transition-colors disabled:opacity-60"
                  />

                  {!couponApplied ? (

                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={couponLoading}
                      className="text-xs uppercase tracking-widest font-semibold px-3 py-2.5 rounded-lg border border-zinc-700 text-zinc-400 hover:border-amber-400 hover:text-white transition-colors disabled:opacity-50"
                    >
                      {couponLoading
                        ? '...'
                        : 'Apply'}
                    </button>

                  ) : (

                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-xs uppercase tracking-widest font-semibold px-3 py-2.5 rounded-lg border border-red-500/30 text-red-400 hover:border-red-500 hover:text-red-300 transition-colors"
                    >
                      Remove
                    </button>

                  )}

                </div>

                {/* MESSAGE */}

                {couponMessage && (
                  <p
                    className={`text-xs mt-2 ${
                      couponApplied
                        ? 'text-emerald-400'
                        : 'text-red-400'
                    }`}
                  >
                    {couponMessage}
                  </p>
                )}

              </div>

              {/* =========================
                  CHECKOUT
              ========================= */}

              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-amber-400 hover:bg-amber-300 text-black font-bold uppercase tracking-widest text-sm py-4 rounded-lg transition-colors"
              >
                Proceed to Checkout
              </button>

              {/* CONTINUE SHOPPING */}

              <Link
                to="/products"
                className="block text-center text-zinc-500 hover:text-white text-xs uppercase tracking-widest transition-colors"
              >
                ← Continue Shopping
              </Link>

              {/* TRUST BADGES */}

              <div className="pt-2 border-t border-zinc-800/50 space-y-2">

                {[
                  {
                    icon: '↩',
                    text: '30-Day Free Returns'
                  },
                  {
                    icon: '✈',
                    text: 'Free Shipping Over $300'
                  }
                ].map((badge) => (

                  <div
                    key={badge.text}
                    className="flex items-center gap-2 text-zinc-600 text-xs"
                  >

                    <span>
                      {badge.icon}
                    </span>

                    <span>
                      {badge.text}
                    </span>

                  </div>

                ))}

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}