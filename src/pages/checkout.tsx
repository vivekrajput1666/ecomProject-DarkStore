import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { createOrder } from "../api/orderApi";
import { getMyAddresses, type Address } from "../api/addressApi";
import { useAuth } from "../components/context/AuthContext";
import { useCart } from "../components/context/CartContext";

declare global {
    interface Window {
        Razorpay: any;
    }
}

type PaymentMethod = "COD" | "RAZORPAY";

/* ============================================================
   HELPERS
============================================================ */

const getAddressId = (address: Address): number | null => {
    const raw =
        address.id ??
        address.address_id ??
        (address as any).addressId ??
        (address as any).addressID;
    const parsed = Number(raw);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

/* ============================================================
   COMPONENT
============================================================ */

const Checkout = () => {
    const navigate = useNavigate();
    const { loading: authLoading } = useAuth();

    /* ----------------------------------------------------------
       REAL CART from CartContext
    ---------------------------------------------------------- */
    const { items: cartItems, loading: cartLoading, clearCart } = useCart();

    /* ----------------------------------------------------------
       ADDRESS STATE
    ---------------------------------------------------------- */
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
    const [addressLoading, setAddressLoading] = useState(true);
    const [addressError, setAddressError] = useState("");

    // Form fields (populated from selected address — used for Razorpay prefill)
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [city, setCity] = useState("");
    const [pincode, setPincode] = useState("");
    const [fullAddress, setFullAddress] = useState("");

    /* ----------------------------------------------------------
       COUPON STATE
    ---------------------------------------------------------- */
    const [couponCode, setCouponCode] = useState("");
    const [discount, setDiscount] = useState(0);
    const [couponApplied, setCouponApplied] = useState(false);
    const [couponLoading, setCouponLoading] = useState(false);
    const [couponError, setCouponError] = useState("");

    /* ----------------------------------------------------------
       PAYMENT STATE
    ---------------------------------------------------------- */
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");
    const [paymentLoading, setPaymentLoading] = useState(false);

    /* ----------------------------------------------------------
       ORDER STATE
    ---------------------------------------------------------- */
    const [orderLoading, setOrderLoading] = useState(false);
    const [orderError, setOrderError] = useState("");

    /* ----------------------------------------------------------
       TOTALS (derived from real cart)
    ---------------------------------------------------------- */
    const subtotal = cartItems.reduce(
        (total, item) =>
            total + Number(item.product.price) * Number(item.quantity),
        0
    );

    const finalTotal = Math.max(0, subtotal - discount);

    /* ==========================================================
       FILL FORM FROM SELECTED ADDRESS (Razorpay prefill)
    ========================================================== */
    const fillFormFromAddress = (address: Address) => {
        setFullName(address.full_name || "");
        setPhone(address.phone || "");
        setCity(address.city || "");
        setPincode(address.pincode || "");
        setFullAddress(
            [address.address_line_1, address.address_line_2]
                .filter(Boolean)
                .join(", ")
        );
    };

    /* ==========================================================
       LOAD SAVED ADDRESSES
    ========================================================== */
    useEffect(() => {
        if (authLoading) return;

        const token = localStorage.getItem("token");
        if (!token) {
            setAddressLoading(false);
            setAddressError("Please login to continue.");
            return;
        }

        let mounted = true;

        const loadAddresses = async () => {
            try {
                setAddressLoading(true);
                setAddressError("");

                const saved = await getMyAddresses();

                if (!mounted) return;

                console.log("CHECKOUT ADDRESSES:", saved);

                if (!Array.isArray(saved)) {
                    setAddresses([]);
                    setAddressError("Invalid address response from server.");
                    return;
                }

                setAddresses(saved);

                if (saved.length === 0) {
                    setSelectedAddressId(null);
                    return;
                }

                // Auto-select: default address, or first
                const defaultAddr =
                    saved.find((a) => Number(a.is_default) === 1) ?? saved[0];

                const defaultId = getAddressId(defaultAddr);

                console.log("DEFAULT ADDRESS:", defaultAddr);
                console.log("DEFAULT ADDRESS ID:", defaultId);

                if (defaultId === null) {
                    console.error(
                        "ADDRESS HAS NO VALID ID — check DB:",
                        defaultAddr
                    );
                    setAddressError(
                        "Your saved address does not have a valid ID. Please re-save it from Profile."
                    );
                    return;
                }

                setSelectedAddressId(defaultId);
                fillFormFromAddress(defaultAddr);

            } catch (error: any) {
                console.error("LOAD ADDRESSES ERROR:", error);
                if (mounted) {
                    setAddressError(
                        error.response?.data?.message ||
                            "Unable to load your saved addresses."
                    );
                }
            } finally {
                if (mounted) setAddressLoading(false);
            }
        };

        loadAddresses();
        return () => { mounted = false; };
    }, [authLoading]);

    /* ==========================================================
       SELECT AN ADDRESS CARD
    ========================================================== */
    const handleAddressSelect = (address: Address) => {
        const addressId = getAddressId(address);

        console.log("ADDRESS SELECTED:", address);
        console.log("ADDRESS ID:", addressId);

        if (addressId === null) {
            setOrderError(
                "This address does not have a valid ID. Please re-save it from Profile."
            );
            return;
        }

        setSelectedAddressId(addressId);
        fillFormFromAddress(address);
        setOrderError("");
        setAddressError("");
    };

    /* ==========================================================
       LOAD RAZORPAY SCRIPT
    ========================================================== */
    const loadRazorpay = (): Promise<boolean> =>
        new Promise((resolve) => {
            if (window.Razorpay) { resolve(true); return; }

            const existing = document.querySelector(
                'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
            );
            if (existing) {
                existing.addEventListener("load", () => resolve(true));
                existing.addEventListener("error", () => resolve(false));
                return;
            }

            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });

    /* ==========================================================
       APPLY COUPON
    ========================================================== */
    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) {
            setCouponError("Please enter a coupon code");
            return;
        }
        try {
            setCouponLoading(true);
            setCouponError("");

            const token = localStorage.getItem("token");
            if (!token) {
                setCouponError("Please login before applying a coupon.");
                return;
            }

            const response = await axios.post(
                "http://localhost:8000/api/coupon/validate",
                {
                    code: couponCode.trim().toUpperCase(),
                    subtotal: Number(subtotal),
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data?.success) {
                setDiscount(Number(response.data.discountAmount || 0));
                setCouponApplied(true);
                setCouponError("");
            } else {
                setDiscount(0);
                setCouponApplied(false);
                setCouponError(response.data?.message || "Invalid coupon");
            }
        } catch (error: any) {
            console.error("COUPON ERROR:", error);
            setDiscount(0);
            setCouponApplied(false);
            setCouponError(
                error.response?.data?.message || "Invalid coupon"
            );
        } finally {
            setCouponLoading(false);
        }
    };

    const handleRemoveCoupon = () => {
        setCouponCode("");
        setDiscount(0);
        setCouponApplied(false);
        setCouponError("");
    };

    /* ==========================================================
       CREATE DATABASE ORDER (shared by COD + Razorpay)
    ========================================================== */
    const createDatabaseOrder = async (
        method: PaymentMethod,
        paymentStatus: "PENDING" | "PAID",
        paymentId?: string,
        razorpayOrderId?: string
    ) => {
        if (selectedAddressId === null || selectedAddressId <= 0) {
            throw new Error("A valid shipping address is required.");
        }

        const payload = {
            address_id: selectedAddressId,
            payment_method: method,
            payment_status: paymentStatus,
            payment_id: paymentId || null,
            razorpay_order_id: razorpayOrderId || null,
            coupon_code: couponApplied
                ? couponCode.trim().toUpperCase()
                : null,
        };

        console.log("CREATE ORDER PAYLOAD:", payload);

        const response = await createOrder(
            selectedAddressId,
            {
                payment_method: method,
                payment_status: paymentStatus,
                payment_id: paymentId,
                razorpay_order_id: razorpayOrderId,
            },
            couponApplied ? couponCode.trim().toUpperCase() : undefined
        );

        return response;
    };

    /* ==========================================================
       COD ORDER
    ========================================================== */
    const handleCODOrder = async () => {
        try {
            setOrderLoading(true);
            setOrderError("");

            if (selectedAddressId === null || selectedAddressId <= 0) {
                setOrderError("Please select a valid shipping address.");
                return;
            }

            const response = await createDatabaseOrder("COD", "PENDING");

            if (response?.success) {
                alert("Order placed successfully!");

                console.log("ORDER ID:", response.orderId);
                console.log("ORDER NUMBER:",response.orderNumber);

                // Clear coupon state
                setCouponCode("");
                setDiscount(0);
                setCouponApplied(false);

                // Clear cart
                try { await clearCart(); } catch (_) {}

                navigate("/orders");
            } else {
                setOrderError(response?.message || "Failed to place order");
            }
        } catch (error: any) {
            console.error("COD ORDER ERROR:", error);
            setOrderError(
                error.response?.data?.message ||
                    error.message ||
                    "Failed to place order"
            );
        } finally {
            setOrderLoading(false);
        }
    };

    /* ==========================================================
       RAZORPAY PAYMENT
    ========================================================== */
    const handleRazorpayPayment = async () => {
        try {
            setPaymentLoading(true);
            setOrderError("");

            if (selectedAddressId === null || selectedAddressId <= 0) {
                setOrderError("Please select a valid shipping address.");
                return;
            }

            const razorpayLoaded = await loadRazorpay();
            if (!razorpayLoaded) {
                setOrderError(
                    "Unable to load Razorpay. Please check your internet connection."
                );
                return;
            }

            const token = localStorage.getItem("token");
            if (!token) {
                setOrderError("Please login before making payment.");
                return;
            }

            /* ----------------------------------------
               CREATE RAZORPAY ORDER (on backend)
               The backend calculates the amount from
               the real cart — we don't trust the
               client-side finalTotal for charging.
            ---------------------------------------- */
            const razorpayOrderResponse = await axios.post(
                "http://localhost:8000/api/payment/create-order",
                {},                                          // amount comes from DB
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log("RAZORPAY ORDER RESPONSE:", razorpayOrderResponse.data);

            if (!razorpayOrderResponse.data?.success) {
                setOrderError(
                    razorpayOrderResponse.data?.message ||
                        "Unable to create payment order"
                );
                return;
            }

            const razorpayOrder = razorpayOrderResponse.data.order;
            // Use the public key returned by the backend so there's a single
            // source of truth and VITE_RAZORPAY_KEY_ID in .env is optional.
            const razorpayKey =
                razorpayOrderResponse.data.keyId ||
                import.meta.env.VITE_RAZORPAY_KEY_ID;

            /* ----------------------------------------
               RAZORPAY OPTIONS
            ---------------------------------------- */
            const options = {
                key: razorpayKey,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency || "INR",
                name: "E-Commerce Store",
                description: "E-Commerce Order Payment",
                order_id: razorpayOrder.id,

                handler: async (paymentResponse: any) => {
                    try {
                        setPaymentLoading(true);
                        setOrderError("");

                        /* --------------------------------
                           VERIFY PAYMENT
                        -------------------------------- */
                        const verifyResponse = await axios.post(
                            "http://localhost:8000/api/payment/verify",
                            {
                                razorpay_order_id:
                                    paymentResponse.razorpay_order_id,
                                razorpay_payment_id:
                                    paymentResponse.razorpay_payment_id,
                                razorpay_signature:
                                    paymentResponse.razorpay_signature,
                            },
                            { headers: { Authorization: `Bearer ${token}` } }
                        );

                        if (!verifyResponse.data?.success) {
                            setOrderError(
                                verifyResponse.data?.message ||
                                    "Payment verification failed"
                            );
                            return;
                        }

                        /* --------------------------------
                           CREATE ECOMMERCE ORDER
                        -------------------------------- */
                        const orderResponse = await createDatabaseOrder(
                            "RAZORPAY",
                            "PAID",
                            paymentResponse.razorpay_payment_id,
                            paymentResponse.razorpay_order_id
                        );

                        if (orderResponse?.success) {
                            alert(
                                "Payment successful! Order placed successfully."
                            );

                            console.log("ORDER ID:", orderResponse.orderId);
                            console.log("ORDER NUMBER:", orderResponse.orderNumber);
                            console.log(
                                "PAYMENT ID:",
                                paymentResponse.razorpay_payment_id
                            );

                            setCouponCode("");
                            setDiscount(0);
                            setCouponApplied(false);

                            try { await clearCart(); } catch (_) {}

                            navigate("/orders");
                        } else {
                            setOrderError(
                                orderResponse?.message ||
                                    "Payment succeeded but order creation failed. Please contact support."
                            );
                        }
                    } catch (error: any) {
                        console.error("PAYMENT VERIFICATION ERROR:", error);
                        setOrderError(
                            error.response?.data?.message ||
                                "Payment verification failed"
                        );
                    } finally {
                        setPaymentLoading(false);
                    }
                },

                prefill: {
                    name: fullName,
                    contact: phone,
                },

                notes: {
                    address: fullAddress,
                    city,
                    pincode,
                },

                theme: { color: "#000000" },

                modal: {
                    ondismiss: () => { setPaymentLoading(false); },
                },
            };

            const razorpay = new window.Razorpay(options);

            razorpay.on("payment.failed", (response: any) => {
                console.error("RAZORPAY PAYMENT FAILED:", response);
                setOrderError(
                    response.error?.description ||
                        "Payment failed. Please try again."
                );
                setPaymentLoading(false);
            });

            razorpay.open();

        } catch (error: any) {
            console.error("RAZORPAY ERROR:", error);
            setOrderError(
                error.response?.data?.message ||
                    error.message ||
                    "Unable to start Razorpay payment"
            );
            setPaymentLoading(false);
        }
    };

    /* ==========================================================
       PLACE ORDER (entry point)
    ========================================================== */
    const handlePlaceOrder = async () => {
        setOrderError("");

        console.log("========== PLACE ORDER ==========");
        console.log("SELECTED ADDRESS ID:", selectedAddressId);
        console.log("PAYMENT METHOD:", paymentMethod);
        console.log("CART ITEMS:", cartItems.length);
        console.log("SUBTOTAL:", subtotal);
        console.log("DISCOUNT:", discount);
        console.log("FINAL TOTAL:", finalTotal);

        /* ---- Validations ---- */

        if (cartItems.length === 0) {
            setOrderError("Your cart is empty. Add items before placing an order.");
            return;
        }

        if (
            selectedAddressId === null ||
            selectedAddressId === undefined ||
            Number(selectedAddressId) <= 0
        ) {
            setOrderError(
                addresses.length === 0
                    ? "Please add a shipping address from your Profile before placing an order."
                    : "Please select a shipping address."
            );
            return;
        }

        if (finalTotal <= 0) {
            setOrderError("Invalid order amount.");
            return;
        }

        /* ---- Route to payment method ---- */

        if (paymentMethod === "COD") {
            await handleCODOrder();
            return;
        }

        await handleRazorpayPayment();
    };

    /* ==========================================================
       UI
    ========================================================== */
    return (
        <div className="min-h-screen bg-gray-100 py-10">
            <div className="max-w-6xl mx-auto px-4">

                <h1 className="text-3xl font-bold text-gray-900 mb-8">
                    Checkout
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* ===========================================
                        LEFT COLUMN
                    =========================================== */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* ----------------------------------
                            CART ITEMS
                        ---------------------------------- */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">
                                Your Cart
                            </h2>

                            {cartLoading ? (
                                <p className="text-gray-500 text-sm py-4">
                                    Loading cart...
                                </p>
                            ) : cartItems.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-500 text-sm mb-4">
                                        Your cart is empty.
                                    </p>
                                    <a
                                        href="/products"
                                        className="inline-block bg-black text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition"
                                    >
                                        Browse Products
                                    </a>
                                </div>
                            ) : (
                                cartItems.map((item) => (
                                    <div
                                        key={item.cartItemId}
                                        className="flex justify-between items-center border-b border-gray-200 py-5 last:border-b-0"
                                    >
                                        <div className="flex items-center gap-4">
                                            {item.product.image && (
                                                <img
                                                    src={item.product.image}
                                                    alt={item.product.name}
                                                    className="w-14 h-14 object-cover rounded-lg border border-gray-200"
                                                />
                                            )}
                                            <div>
                                                <h3 className="font-semibold text-gray-900">
                                                    {item.product.name}
                                                </h3>
                                                <p className="text-gray-500 text-sm mt-1">
                                                    Qty: {item.quantity}
                                                </p>
                                                <p className="text-gray-500 text-sm">
                                                    ₹{Number(item.product.price).toFixed(2)} each
                                                </p>
                                            </div>
                                        </div>
                                        <p className="font-semibold text-gray-900">
                                            ₹{(
                                                Number(item.product.price) *
                                                Number(item.quantity)
                                            ).toFixed(2)}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* ----------------------------------
                            COUPON
                        ---------------------------------- */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                Apply Coupon
                            </h2>

                            {!couponApplied ? (
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <input
                                        type="text"
                                        value={couponCode}
                                        onChange={(e) =>
                                            setCouponCode(
                                                e.target.value.toUpperCase()
                                            )
                                        }
                                        placeholder="Enter coupon code"
                                        className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 bg-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-black"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleApplyCoupon}
                                        disabled={couponLoading}
                                        className="bg-black text-white px-7 py-3 rounded-lg font-medium hover:bg-gray-800 disabled:bg-gray-400 transition"
                                    >
                                        {couponLoading ? "Applying..." : "Apply"}
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-4">
                                    <div>
                                        <p className="text-green-700 font-semibold">
                                            {couponCode}
                                        </p>
                                        <p className="text-green-600 text-sm mt-1">
                                            Coupon applied successfully
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleRemoveCoupon}
                                        className="text-red-500 font-medium hover:text-red-700"
                                    >
                                        Remove
                                    </button>
                                </div>
                            )}

                            {couponError && (
                                <p className="text-red-500 text-sm mt-3">
                                    {couponError}
                                </p>
                            )}
                        </div>

                        {/* ----------------------------------
                            SHIPPING ADDRESS
                        ---------------------------------- */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    Shipping Address
                                </h2>
                                <a
                                    href="/profile"
                                    className="text-sm text-black font-medium hover:underline"
                                >
                                    + Manage Addresses
                                </a>
                            </div>

                            {/* Loading */}
                            {addressLoading && (
                                <div className="flex items-center gap-3 text-gray-500 text-sm py-4">
                                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                                    Loading your saved addresses...
                                </div>
                            )}

                            {/* Error */}
                            {!addressLoading && addressError && (
                                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 mb-4">
                                    {addressError}
                                </div>
                            )}

                            {/* No addresses */}
                            {!addressLoading && !addressError && addresses.length === 0 && (
                                <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm mb-4">
                                    <p className="text-amber-800 font-medium">
                                        No saved addresses found
                                    </p>
                                    <p className="text-amber-700 mt-1">
                                        Go to your{" "}
                                        <a
                                            href="/profile"
                                            className="underline font-semibold"
                                        >
                                            Profile
                                        </a>{" "}
                                        and add a shipping address before placing an order.
                                    </p>
                                </div>
                            )}

                            {/* Address cards */}
                            {!addressLoading && addresses.length > 0 && (
                                <div className="space-y-3">
                                    {addresses.map((address, index) => {
                                        const addressId = getAddressId(address);
                                        const isSelected =
                                            selectedAddressId !== null &&
                                            selectedAddressId === addressId;
                                        const isDefault =
                                            Number(address.is_default) === 1;

                                        return (
                                            <button
                                                key={
                                                    addressId ??
                                                    `address-${index}`
                                                }
                                                type="button"
                                                onClick={() =>
                                                    handleAddressSelect(address)
                                                }
                                                className={`w-full rounded-lg border p-4 text-left transition ${
                                                    isSelected
                                                        ? "border-black bg-gray-50 ring-2 ring-black"
                                                        : "border-gray-200 hover:border-gray-400"
                                                }`}
                                            >
                                                <div className="flex items-start justify-between gap-4">

                                                    {/* Radio + Info */}
                                                    <div className="flex items-start gap-3">
                                                        <div
                                                            className={`mt-1 w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                                                                isSelected
                                                                    ? "border-black"
                                                                    : "border-gray-400"
                                                            }`}
                                                        >
                                                            {isSelected && (
                                                                <div className="w-2 h-2 rounded-full bg-black" />
                                                            )}
                                                        </div>

                                                        <div>
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <p className="font-semibold text-gray-900">
                                                                    {address.full_name}
                                                                </p>
                                                                {isDefault && (
                                                                    <span className="text-xs font-semibold uppercase tracking-wide text-green-700 bg-green-100 px-2 py-0.5 rounded">
                                                                        Default
                                                                    </span>
                                                                )}
                                                                <span className="text-xs text-gray-500 uppercase bg-gray-100 px-2 py-0.5 rounded">
                                                                    {address.address_type ||
                                                                        "home"}
                                                                </span>
                                                            </div>

                                                            <p className="mt-1 text-sm text-gray-600">
                                                                {address.phone}
                                                            </p>

                                                            <p className="text-sm text-gray-600">
                                                                {address.address_line_1}
                                                                {address.address_line_2
                                                                    ? `, ${address.address_line_2}`
                                                                    : ""}
                                                            </p>

                                                            <p className="text-sm text-gray-600">
                                                                {address.city}
                                                                {address.state
                                                                    ? `, ${address.state}`
                                                                    : ""}
                                                                {" — "}
                                                                {address.pincode}
                                                            </p>

                                                            <p className="text-xs text-gray-400 mt-0.5">
                                                                {address.country}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Selected badge */}
                                                    <span
                                                        className={`flex-shrink-0 mt-1 text-xs font-semibold uppercase tracking-wide ${
                                                            isSelected
                                                                ? "text-black"
                                                                : "text-gray-400"
                                                        }`}
                                                    >
                                                        {isSelected
                                                            ? "Selected"
                                                            : "Select"}
                                                    </span>

                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* ----------------------------------
                            PAYMENT METHOD
                        ---------------------------------- */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-5">
                                Payment Method
                            </h2>

                            <div className="space-y-3">

                                {/* COD */}
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod("COD")}
                                    className={`w-full text-left border rounded-lg p-4 transition ${
                                        paymentMethod === "COD"
                                            ? "border-black bg-gray-50 ring-2 ring-black"
                                            : "border-gray-300 hover:border-gray-500"
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                                paymentMethod === "COD"
                                                    ? "border-black"
                                                    : "border-gray-400"
                                            }`}
                                        >
                                            {paymentMethod === "COD" && (
                                                <div className="w-2 h-2 rounded-full bg-black" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                Cash on Delivery
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Pay when your order is delivered
                                            </p>
                                        </div>
                                    </div>
                                </button>

                                {/* RAZORPAY */}
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod("RAZORPAY")}
                                    className={`w-full text-left border rounded-lg p-4 transition ${
                                        paymentMethod === "RAZORPAY"
                                            ? "border-black bg-gray-50 ring-2 ring-black"
                                            : "border-gray-300 hover:border-gray-500"
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                                paymentMethod === "RAZORPAY"
                                                    ? "border-black"
                                                    : "border-gray-400"
                                            }`}
                                        >
                                            {paymentMethod === "RAZORPAY" && (
                                                <div className="w-2 h-2 rounded-full bg-black" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                Razorpay
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Pay securely using UPI, cards,
                                                net banking or wallet
                                            </p>
                                        </div>
                                    </div>
                                </button>

                            </div>
                        </div>

                    </div>

                    {/* ===========================================
                        RIGHT COLUMN — ORDER SUMMARY
                    =========================================== */}
                    <div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-5">

                            <h2 className="text-xl font-semibold text-gray-900 mb-6">
                                Order Summary
                            </h2>

                            {/* Subtotal */}
                            <div className="flex justify-between mb-4">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="font-medium text-gray-900">
                                    ₹{subtotal.toFixed(2)}
                                </span>
                            </div>

                            {/* Discount */}
                            {discount > 0 && (
                                <div className="flex justify-between mb-4">
                                    <span className="text-green-600">
                                        Coupon Discount
                                    </span>
                                    <span className="text-green-600 font-medium">
                                        − ₹{discount.toFixed(2)}
                                    </span>
                                </div>
                            )}

                            {/* Shipping */}
                            <div className="flex justify-between mb-4">
                                <span className="text-gray-600">Shipping</span>
                                <span className="text-green-600 font-medium">Free</span>
                            </div>

                            <hr className="my-5 border-gray-200" />

                            {/* Total */}
                            <div className="flex justify-between items-center">
                                <span className="text-lg font-semibold text-gray-900">
                                    Total
                                </span>
                                <span className="text-2xl font-bold text-gray-900">
                                    ₹{finalTotal.toFixed(2)}
                                </span>
                            </div>

                            {/* Razorpay info */}
                            {paymentMethod === "RAZORPAY" && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-5">
                                    <p className="text-blue-700 text-sm">
                                        You will be redirected to Razorpay
                                        to complete your payment.
                                    </p>
                                </div>
                            )}

                            {/* Selected address summary */}
                            {selectedAddressId !== null && (
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-5">
                                    <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">
                                        Delivering to
                                    </p>
                                    <p className="text-gray-800 text-sm font-medium">
                                        {fullName}
                                    </p>
                                    <p className="text-gray-600 text-xs mt-0.5">
                                        {fullAddress}
                                        {city ? `, ${city}` : ""}
                                        {pincode ? ` — ${pincode}` : ""}
                                    </p>
                                </div>
                            )}

                            {/* Order error */}
                            {orderError && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-5">
                                    <p className="text-red-600 text-sm">
                                        {orderError}
                                    </p>
                                </div>
                            )}

                            {/* Place Order button */}
                            <button
                                type="button"
                                onClick={handlePlaceOrder}
                                disabled={
                                    orderLoading ||
                                    paymentLoading ||
                                    addressLoading ||
                                    cartLoading
                                }
                                className="w-full bg-black text-white py-4 rounded-lg mt-6 font-semibold hover:bg-gray-800 disabled:bg-gray-400 transition"
                            >
                                {orderLoading || paymentLoading
                                    ? "Processing..."
                                    : paymentMethod === "RAZORPAY"
                                    ? `Pay ₹${finalTotal.toFixed(2)}`
                                    : "Place Order"}
                            </button>

                            <p className="text-xs text-gray-500 text-center mt-4">
                                By placing your order, you agree to our terms
                                and conditions.
                            </p>

                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default Checkout;
