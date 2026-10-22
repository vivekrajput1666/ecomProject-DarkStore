import { useEffect, useState } from "react";
import { getAllOrders, updateOrderStatus } from "../../api/orderApi";

interface AdminOrder {
  id: number;
  user_id: number;
  user_name?: string;
  email?: string;
  total_amount: number;
  payment_status?: string;
  order_status: string;
  created_at?: string;
}

const editableStatuses = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

const statusLabel = (status: string) =>
  status.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

const statusClass = (status: string) => {
  if (status === "cancel_requested") return "border-orange-400/20 bg-orange-400/10 text-orange-400";
  if (status === "cancelled") return "border-red-400/20 bg-red-400/10 text-red-400";
  if (status === "delivered") return "border-emerald-400/20 bg-emerald-400/10 text-emerald-400";
  return "border-zinc-700 bg-zinc-800 text-zinc-300";
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getAllOrders();
      if (!response?.success) {
        throw new Error(response?.message || "Failed to load orders");
      }
      setOrders(response.orders || []);
    } catch (requestError: any) {
      console.error("ADMIN ORDERS ERROR:", requestError);
      setError(
        requestError?.response?.data?.message ||
          requestError?.message ||
          "Failed to load orders"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOrders();
  }, []);

  const setStatus = async (orderId: number, status: string, confirmText?: string) => {
    if (confirmText && !window.confirm(confirmText)) return;

    try {
      setActionId(orderId);
      setError("");
      setMessage("");
      const response = await updateOrderStatus(orderId, status);
      if (!response?.success) {
        throw new Error(response?.message || "Failed to update order status");
      }
      setMessage(response.message || "Order status updated");
      await loadOrders();
    } catch (requestError: any) {
      console.error("UPDATE ORDER STATUS ERROR:", requestError);
      setError(
        requestError?.response?.data?.message ||
          requestError?.message ||
          "Failed to update order status"
      );
    } finally {
      setActionId(null);
    }
  };

  const cancellationCount = orders.filter(
    (order) => order.order_status === "cancel_requested"
  ).length;

  return (
    <div className="space-y-8">
      <header>
        <p className="text-amber-400 text-xs font-bold tracking-[0.3em] uppercase">Admin</p>
        <h1 className="mt-2 text-3xl font-bold text-white">Orders</h1>
        <p className="mt-2 text-zinc-500">Review orders and manage fulfillment status.</p>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded border border-zinc-800 bg-[#151515] px-4 py-2 text-sm text-zinc-300">
          {orders.length} orders
        </span>
        <span className="rounded border border-orange-400/20 bg-orange-400/10 px-4 py-2 text-sm text-orange-400">
          {cancellationCount} cancellation requests
        </span>
      </div>

      {message && <p role="status" className="text-sm text-emerald-400">{message}</p>}
      {error && <p role="alert" className="rounded border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-400">{error}</p>}

      <section className="overflow-hidden rounded-xl border border-zinc-800 bg-[#151515]">
        {loading ? (
          <p className="p-6 text-sm text-zinc-400">Loading orders...</p>
        ) : error && orders.length === 0 ? (
          <div className="p-6">
            <button onClick={() => void loadOrders()} className="text-sm font-semibold text-amber-400 hover:text-amber-300">Try again</button>
          </div>
        ) : orders.length === 0 ? (
          <p className="p-6 text-sm text-zinc-400">No orders found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-max text-left text-sm">
              <thead className="border-b border-zinc-800 text-zinc-500">
                <tr>
                  <th className="px-5 py-3 font-medium sm:px-6">Order</th>
                  <th className="px-5 py-3 font-medium sm:px-6">Customer</th>
                  <th className="px-5 py-3 font-medium sm:px-6">Date</th>
                  <th className="px-5 py-3 font-medium sm:px-6">Total</th>
                  <th className="px-5 py-3 font-medium sm:px-6">Payment</th>
                  <th className="px-5 py-3 font-medium sm:px-6">Status</th>
                  <th className="px-5 py-3 font-medium sm:px-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {orders.map((order) => (
                  <tr key={order.id} className="align-top text-zinc-300">
                    <td className="px-5 py-4 font-semibold text-white sm:px-6">#{order.id}</td>
                    <td className="px-5 py-4 sm:px-6">
                      <p className="font-medium text-white">{order.user_name || `User #${order.user_id}`}</p>
                      <p className="mt-1 text-xs text-zinc-500">{order.email || ""}</p>
                    </td>
                    <td className="px-5 py-4 text-zinc-400 sm:px-6">
                      {order.created_at ? new Date(order.created_at).toLocaleString() : "-"}
                    </td>
                    <td className="px-5 py-4 font-medium text-white sm:px-6">
                      ₹{Number(order.total_amount || 0).toFixed(2)}
                    </td>
                    <td className="px-5 py-4 capitalize text-zinc-400 sm:px-6">
                      {order.payment_status?.replaceAll("_", " ") || "-"}
                    </td>
                    <td className="px-5 py-4 sm:px-6">
                      <span className={`inline-flex rounded border px-2.5 py-1 text-xs font-medium ${statusClass(order.order_status)}`}>
                        {statusLabel(order.order_status)}
                      </span>
                    </td>
                    <td className="px-5 py-4 sm:px-6">
                      {order.order_status === "cancel_requested" ? (
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => void setStatus(order.id, "cancelled", "Approve this cancellation request?")}
                            disabled={actionId === order.id}
                            className="rounded bg-red-400 px-3 py-2 text-xs font-semibold text-black hover:bg-red-300 disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => void setStatus(order.id, "pending", "Reject this cancellation request?")}
                            disabled={actionId === order.id}
                            className="rounded border border-zinc-700 px-3 py-2 text-xs font-semibold text-white hover:bg-zinc-800 disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <select
                          aria-label={`Update status for order ${order.id}`}
                          value={editableStatuses.includes(order.order_status) ? order.order_status : "pending"}
                          disabled={actionId === order.id}
                          onChange={(event) => void setStatus(order.id, event.target.value)}
                          className="max-w-48 rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-white disabled:opacity-50"
                        >
                          {editableStatuses.map((status) => (
                            <option key={status} value={status}>{statusLabel(status)}</option>
                          ))}
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
