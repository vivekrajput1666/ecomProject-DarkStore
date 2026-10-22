import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
    cancelOrder,
    getMyOrders,
} from "../api/orderApi";

interface Order {
    id: number;
    total_amount: number;
    payment_method?: string;
    payment_status?: string;
    order_status: string;
    created_at: string;
}

export default function Orders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [cancellingId, setCancellingId] =
        useState<number | null>(null);

    // ======================================================
    // LOAD ORDERS
    // ======================================================

    const loadOrders = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getMyOrders();

            console.log("MY ORDERS:", response);

            if (response?.success) {
                setOrders(response.orders || []);
            } else {
                setError(
                    response?.message ||
                    "Failed to load orders"
                );
            }
        } catch (error: any) {
            console.error(
                "GET ORDERS ERROR:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to load orders"
            );
        } finally {
            setLoading(false);
        }
    };

    // ======================================================
    // LOAD ORDERS ON PAGE LOAD
    // ======================================================

    useEffect(() => {
        loadOrders();
    }, []);

    // ======================================================
    // REQUEST CANCEL ORDER
    // ======================================================

    const handleCancelOrder = async (orderId: number) => {
        const confirmed = window.confirm(
            "Are you sure you want to request cancellation for this order?"
        );

        if (!confirmed) return;

        try {
            setCancellingId(orderId);
            const response = await cancelOrder(orderId);
            await loadOrders();
            window.alert(
                response?.message || "Cancellation request sent to admin"
            );
        } catch (error: any) {
            console.error("Cancel order error:", error);
            window.alert(
                error?.response?.data?.message ||
                error?.message ||
                "Failed to request cancellation"
            );
        } finally {
            setCancellingId(null);
        }
    };

    // ======================================================
    // STATUS COLOR
    // ======================================================

    const getStatusClass = (
        status: string
    ) => {
        switch (status) {
            case "pending":
                return "bg-amber-400/10 text-amber-400 border-amber-400/20";

            case "confirmed":
                return "bg-blue-400/10 text-blue-400 border-blue-400/20";

            case "processing":
                return "bg-purple-400/10 text-purple-400 border-purple-400/20";

            case "shipped":
                return "bg-cyan-400/10 text-cyan-400 border-cyan-400/20";

            case "out_for_delivery":
                return "bg-indigo-400/10 text-indigo-400 border-indigo-400/20";

            case "delivered":
                return "bg-emerald-400/10 text-emerald-400 border-emerald-400/20";

            case "cancel_requested":
                return "bg-orange-400/10 text-orange-400 border-orange-400/20";

            case "cancelled":
                return "bg-red-400/10 text-red-400 border-red-400/20";

            default:
                return "bg-zinc-800 text-zinc-400 border-zinc-700";
        }
    };

    // ======================================================
    // STATUS TEXT
    // ======================================================

    const getStatusText = (
        status: string
    ) => {
        switch (status) {
            case "pending":
                return "Pending";

            case "confirmed":
                return "Approved";

            case "processing":
                return "Processing";

            case "shipped":
                return "Shipped";

            case "out_for_delivery":
                return "Out for Delivery";

            case "delivered":
                return "Delivered";

            case "cancel_requested":
                return "Cancellation Requested";

            case "cancelled":
                return "Cancelled";

            default:
                return status;
        }
    };

    // ======================================================
    // LOADING
    // ======================================================

    if (loading) {
        return (
            <div className="min-h-screen bg-[#090909] text-white flex items-center justify-center">
                <div className="text-center">

                    <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />

                    <p className="text-zinc-500 text-sm">
                        Loading orders...
                    </p>

                </div>
            </div>
        );
    }

    // ======================================================
    // ERROR
    // ======================================================

    if (error) {
        return (
            <div className="min-h-screen bg-[#090909] text-white flex items-center justify-center px-6">

                <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">

                    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-400/10 border border-red-400/20 flex items-center justify-center">

                        <svg
                            className="w-6 h-6 text-red-400"
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

                    <h2 className="text-white text-xl font-bold mb-2">
                        Unable to load orders
                    </h2>

                    <p className="text-zinc-500 text-sm mb-6">
                        {error}
                    </p>

                    <button
                        onClick={loadOrders}
                        className="bg-amber-400 hover:bg-amber-300 text-black font-semibold px-5 py-2.5 rounded-lg transition-colors"
                    >
                        Try Again
                    </button>

                </div>

            </div>
        );
    }

    // ======================================================
    // ORDERS PAGE
    // ======================================================

    return (
        <div className="min-h-screen bg-[#090909] text-white">

            {/* HEADER */}

            <div className="border-b border-zinc-800">

                <div className="max-w-6xl mx-auto px-6 py-10">

                    <p className="text-amber-400 text-xs uppercase tracking-[0.3em] font-semibold mb-2">
                        Account
                    </p>

                    <h1 className="text-4xl font-bold tracking-tight">
                        My Orders
                    </h1>

                    <p className="text-zinc-500 text-sm mt-2">
                        Track your orders and cancellation requests.
                    </p>

                </div>

            </div>

            {/* CONTENT */}

            <div className="max-w-6xl mx-auto px-6 py-10">

                {orders.length === 0 ? (

                    /* EMPTY ORDERS */

                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">

                        <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-5">

                            <svg
                                className="w-7 h-7 text-zinc-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 4h13m-4-4v4m-4-4v4"
                                />
                            </svg>

                        </div>

                        <h2 className="text-white text-xl font-bold mb-2">
                            No orders yet
                        </h2>

                        <p className="text-zinc-500 text-sm mb-6">
                            You haven't placed any orders yet.
                        </p>

                        <Link
                            to="/products"
                            className="inline-block bg-amber-400 hover:bg-amber-300 text-black font-semibold px-6 py-3 rounded-lg transition-colors"
                        >
                            Start Shopping
                        </Link>

                    </div>

                ) : (

                    /* ORDER LIST */

                    <div className="space-y-5">

                        {orders.map((order) => {

                            const canRequestCancel =
                                order.order_status ===
                                    "pending" ||
                                order.order_status ===
                                    "confirmed" ||
                                order.order_status ===
                                    "processing";

                            const cancellationRequested =
                                order.order_status ===
                                "cancel_requested";

                            return (
                                <div
                                    key={order.id}
                                    className="bg-zinc-900 border border-zinc-800 rounded-xl p-6"
                                >

                                    {/* TOP */}

                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">

                                        <div>

                                            <p className="text-zinc-500 text-xs uppercase tracking-widest mb-1">
                                                Order
                                            </p>

                                            <h2 className="text-white text-lg font-bold">
                                                #{order.id}
                                            </h2>

                                        </div>

                                        <span
                                            className={`inline-flex w-fit items-center px-3 py-1 rounded-full border text-xs uppercase tracking-wider font-semibold ${getStatusClass(
                                                order.order_status
                                            )}`}
                                        >
                                            {getStatusText(
                                                order.order_status
                                            )}
                                        </span>

                                    </div>

                                    {/* ORDER INFO */}

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-zinc-800 pt-5">

                                        {/* DATE */}

                                        <div>

                                            <p className="text-zinc-500 text-xs uppercase tracking-widest mb-2">
                                                Order Date
                                            </p>

                                            <p className="text-white text-sm">
                                                {new Date(
                                                    order.created_at
                                                ).toLocaleDateString(
                                                    "en-IN",
                                                    {
                                                        day: "2-digit",
                                                        month: "short",
                                                        year: "numeric",
                                                    }
                                                )}
                                            </p>

                                        </div>

                                        {/* TOTAL */}

                                        <div>

                                            <p className="text-zinc-500 text-xs uppercase tracking-widest mb-2">
                                                Total
                                            </p>

                                            <p className="text-white text-sm font-semibold">
                                                ₹
                                                {Number(
                                                    order.total_amount
                                                ).toFixed(2)}
                                            </p>

                                        </div>

                                        {/* PAYMENT */}

                                        <div>

                                            <p className="text-zinc-500 text-xs uppercase tracking-widest mb-2">
                                                Payment
                                            </p>

                                            <p className="text-white text-sm capitalize">
                                                {order.payment_method ||
                                                    "COD"}
                                            </p>

                                        </div>

                                    </div>

                                    {/* CANCELLATION MESSAGE */}

                                    {cancellationRequested && (
                                        <div className="mt-5 bg-orange-400/10 border border-orange-400/20 rounded-lg px-4 py-3">

                                            <p className="text-orange-400 text-sm font-medium">
                                                Cancellation request sent
                                            </p>

                                            <p className="text-zinc-500 text-xs mt-1">
                                                Your order will be cancelled only after admin approval.
                                            </p>

                                        </div>
                                    )}

                                    {/* CANCELLED MESSAGE */}

                                    {order.order_status ===
                                        "cancelled" && (
                                        <div className="mt-5 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">

                                            <p className="text-red-400 text-sm font-medium">
                                                Order cancelled
                                            </p>

                                            <p className="text-zinc-500 text-xs mt-1">
                                                This cancellation was approved by the admin.
                                            </p>

                                        </div>
                                    )}

                                    {/* ACTIONS */}

                                    <div className="flex flex-wrap items-center gap-3 mt-6 pt-5 border-t border-zinc-800">

                                        <Link
                                            to={`/orders/${order.id}`}
                                            className="bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
                                        >
                                            View Order
                                        </Link>

                                        {/* CANCEL REQUEST */}

                                        {canRequestCancel && (
                                            <button
                                                onClick={() => handleCancelOrder(order.id)}
                                                disabled={
                                                    cancellingId ===
                                                    order.id
                                                }
                                                className="bg-red-400/10 hover:bg-red-400/20 disabled:opacity-50 disabled:cursor-not-allowed border border-red-400/20 text-red-400 text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
                                            >
                                                {cancellingId ===
                                                order.id
                                                    ? "Requesting..."
                                                    : "Cancel Order"}
                                            </button>
                                        )}

                                        {/* WAITING */}

                                        {cancellationRequested && (
                                            <span className="text-orange-400 text-sm">
                                                Waiting for admin approval
                                            </span>
                                        )}

                                    </div>

                                </div>
                            );
                        })}

                    </div>

                )}

                {/* BACK */}

                <div className="mt-8">

                    <Link
                        to="/"
                        className="text-zinc-500 hover:text-amber-400 text-sm transition-colors"
                    >
                        ← Back to Home
                    </Link>

                </div>

            </div>

        </div>
    );
}