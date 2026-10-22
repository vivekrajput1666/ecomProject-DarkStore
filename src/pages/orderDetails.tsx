import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { cancelOrder } from "../api/orderApi";
import {
  getOrderById,
} from "../components/services/orderService";
import type {
  Order,
  OrderStatus,
} from "../components/services/orderService";

const getStatusSteps = (status: OrderStatus) => {
  const steps: OrderStatus[] = [
    "Pending",
    "Confirmed",
    "Processing",
    "Shipped",
    "Out for Delivery",
    "Delivered",
  ];

  if (status === "Cancelled") {
    return [];
  }

  return steps;
};

const getStepIndex = (status: OrderStatus) => {
  const steps = getStatusSteps(status);
  return steps.indexOf(status);
};

const getStatusColor = (status: OrderStatus) => {
  if (status === "Delivered") return "border-green-500/30 text-green-400";
  if (status === "Cancelled") return "border-red-500/30 text-red-400";
  if (status === "Cancellation Requested") return "border-orange-400/30 text-orange-400";
  return "border-amber-500/30 text-amber-400";
};

export default function OrderDetails() {
  const { id } = useParams<{ id: string }>();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrder = async () => {
      try {
        setLoading(true);
        setError("");

        if (!id) {
          setError("Order ID is missing.");
          return;
        }

        const data = await getOrderById(id);
        setOrder(data);
      } catch (error: any) {
        console.error("Order details error:", error);

        setError(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to load order."
        );
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [id]);

  const handleCancelOrder = async () => {
    if (!order) return;

    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?"
    );

    if (!confirmed) return;

    try {
      setCancelling(true);

      const response = await cancelOrder(order.id);

      setOrder({
        ...order,
        status: "Cancellation Requested",
      });

      alert(response?.message || "Cancellation request sent to admin");
    } catch (error: any) {
      console.error("Cancel order error:", error);

      alert(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to request cancellation"
      );
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090909] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />

          <p className="text-zinc-500 text-sm">
            Loading order...
          </p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#090909] flex items-center justify-center px-6">
        <div className="text-center">
          <div className="text-5xl mb-4">📦</div>

          <h2 className="text-white text-xl font-bold mb-2">
            Order not found
          </h2>

          <p className="text-zinc-500 text-sm mb-6">
            {error || "This order could not be found."}
          </p>

          <Link
            to="/orders"
            className="inline-flex bg-amber-400 hover:bg-amber-300 text-black font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const steps = getStatusSteps(order.status);
  const currentStep = getStepIndex(order.status);

  const canCancel =
    order.status === "Pending" ||
    order.status === "Confirmed" ||
    order.status === "Processing";

  return (
    <div className="min-h-screen bg-[#090909]">
      {/* Header */}
      <div className="border-b border-zinc-800/50 bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <Link
            to="/orders"
            className="text-zinc-500 hover:text-amber-400 text-sm transition-colors"
          >
            ← Back to Orders
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Order Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-8">
          <div>
            <p className="text-amber-400 text-xs uppercase tracking-[0.3em] font-semibold mb-2">
              Order Details
            </p>

            <h1 className="text-white text-3xl font-bold">
              Order #{order.id}
            </h1>

            <p className="text-zinc-500 text-sm mt-2">
              Placed on{" "}
              {order.createdAt
                ? new Date(order.createdAt).toLocaleString()
                : "N/A"}
            </p>
          </div>

          <div
            className={`inline-flex self-start md:self-auto items-center px-4 py-2 rounded-lg border text-sm font-semibold ${getStatusColor(
              order.status
            )}`}
          >
            {order.status}
          </div>
        </div>

        {/* Order Status */}
        {order.status !== "Cancelled" &&
          order.status !== "Cancellation Requested" && (
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 mb-8">
            <h2 className="text-white font-semibold mb-8">
              Order Status
            </h2>

            <div className="relative">
              <div className="absolute top-4 left-0 right-0 h-px bg-zinc-800" />

              <div
                className="absolute top-4 left-0 h-px bg-amber-400 transition-all"
                style={{
                  width:
                    steps.length > 1
                      ? `${(currentStep / (steps.length - 1)) * 100}%`
                      : "0%",
                }}
              />

              <div className="relative grid grid-cols-6 gap-2">
                {steps.map((step, index) => {
                  const completed = index <= currentStep;

                  return (
                    <div
                      key={step}
                      className="text-center"
                    >
                      <div
                        className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                          completed
                            ? "bg-amber-400 border-amber-400 text-black"
                            : "bg-zinc-900 border-zinc-700 text-zinc-600"
                        }`}
                      >
                        {completed ? "✓" : index + 1}
                      </div>

                      <p
                        className={`text-[10px] sm:text-xs mt-3 ${
                          completed
                            ? "text-white"
                            : "text-zinc-600"
                        }`}
                      >
                        {step}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Cancelled */}
        {order.status === "Cancelled" && (
          <div className="bg-red-400/5 border border-red-400/20 rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-400/10 flex items-center justify-center text-red-400">
                ✕
              </div>

              <div>
                <h2 className="text-red-400 font-semibold">
                  Order Cancelled
                </h2>

                <p className="text-zinc-500 text-sm mt-1">
                  This order has been cancelled.
                </p>
              </div>
            </div>
          </div>
        )}

        {order.status === "Cancellation Requested" && (
          <div className="bg-orange-400/5 border border-orange-400/20 rounded-2xl p-6 mb-8">
            <h2 className="text-orange-400 font-semibold">
              Cancellation Requested
            </h2>
            <p className="text-zinc-500 text-sm mt-1">
              Your order will be cancelled only after admin approval.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2">
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-zinc-800">
                <h2 className="text-white font-semibold">
                  Order Items
                </h2>
              </div>

              <div className="divide-y divide-zinc-800">
                {order.items.length === 0 ? (
                  <div className="p-6 text-zinc-500 text-sm">
                    No order items found.
                  </div>
                ) : (
                  order.items.map((item) => (
                    <div
                      key={item.product.id}
                      className="p-5 flex items-center gap-4"
                    >
                      <div className="w-20 h-20 rounded-lg bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                        {item.product.image ? (
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl">
                            🛍️
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium truncate">
                          {item.product.name}
                        </h3>

                        <p className="text-zinc-500 text-sm mt-1">
                          Quantity: {item.quantity}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-white font-semibold">
                          ₹
                          {(
                            item.price * item.quantity
                          ).toFixed(2)}
                        </p>

                        <p className="text-zinc-600 text-xs mt-1">
                          ₹{item.price.toFixed(2)} each
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Total */}
              <div className="p-6 border-t border-zinc-800">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">
                    Total
                  </span>

                  <span className="text-white text-2xl font-black">
                    ₹{order.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side */}
          <div className="space-y-6">
            {/* Shipping */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6">
              <h2 className="text-white font-semibold mb-4">
                Shipping Address
              </h2>

              <p className="text-zinc-400 text-sm leading-relaxed">
                {order.shippingAddress ||
                  "Shipping address not available."}
              </p>
            </div>

            {/* Payment */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6">
              <h2 className="text-white font-semibold mb-4">
                Payment
              </h2>

              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">
                  Payment Status
                </span>

                <span className="text-amber-400 font-medium">
                  Pending
                </span>
              </div>
            </div>

            {/* Cancel */}
            {canCancel && (
              <button
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="w-full border border-red-400/30 text-red-400 hover:bg-red-400/10 disabled:opacity-50 disabled:cursor-not-allowed font-semibold py-3 rounded-lg transition-colors"
              >
                {cancelling
                  ? "Cancelling..."
                  : "Cancel Order"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}