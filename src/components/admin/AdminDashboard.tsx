import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllOrders, updateOrderStatus } from "../../api/orderApi";
import { getProducts } from "../../api/productApi";

interface Order {
  id: number;
  user_id: number;
  user_name?: string;
  email?: string;
  total_amount: number | string;
  payment_method?: string;
  payment_status?: string;
  order_status: string;
  created_at: string;
}

const AdminDashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [error, setError] = useState("");



  const loadProducts = async () => {
  try {
    const response = await getProducts();

    if (response.success) {
      setTotalProducts(
        response.products?.length ??
        response.data?.length ??
        0
      );
    }
  } catch (error) {
    console.error("ADMIN PRODUCTS ERROR:", error);
  }
};
  // ======================================================
  // GET ALL ORDERS
  // ======================================================

  const loadOrders = async () => {
    try {
      setLoadingOrders(true);
      setError("");

      const response = await getAllOrders();

      console.log("ADMIN ORDERS:", response);

      if (response?.success) {
        setOrders(response.orders || []);
      } else {
        setError(
          response?.message || "Failed to load orders"
        );
      }
    } catch (error: any) {
      console.error("ADMIN ORDERS ERROR:", error);

      setError(
        error.response?.data?.message ||
        "Failed to load orders"
      );
    } finally {
      setLoadingOrders(false);
    }
  };

  // ======================================================
  // LOAD ON PAGE OPEN
  // ======================================================

  useEffect(() => {
    loadOrders();
    loadProducts();
  }, []);

  // ======================================================
  // APPROVE CANCELLATION
  // ======================================================

  const approveCancellation = async (orderId: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to approve this cancellation?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(orderId);

      const response = await updateOrderStatus(orderId, "cancelled");

      if (response?.success) {
        alert("Cancellation approved successfully.");

        await loadOrders();
      } else {
        alert(
          response?.message ||
          "Failed to approve cancellation"
        );
      }
    } catch (error: any) {
      console.error(
        "APPROVE CANCELLATION ERROR:",
        error
      );

      alert(
        error.response?.data?.message ||
        "Failed to approve cancellation"
      );
    } finally {
      setActionLoading(null);
    }
  };

  // ======================================================
  // REJECT CANCELLATION
  // ======================================================

  const rejectCancellation = async (orderId: number) => {
    const confirmed = window.confirm(
      "Reject this cancellation request?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(orderId);

      const response = await updateOrderStatus(orderId, "pending");

      if (response?.success) {
        alert("Cancellation request rejected.");

        await loadOrders();
      } else {
        alert(
          response?.message ||
          "Failed to reject cancellation"
        );
      }
    } catch (error: any) {
      console.error(
        "REJECT CANCELLATION ERROR:",
        error
      );

      alert(
        error.response?.data?.message ||
        "Failed to reject cancellation"
      );
    } finally {
      setActionLoading(null);
    }
  };

  // ======================================================
  // HELPERS
  // ======================================================

  const getStatusText = (status: string) => {
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

  const getStatusClass = (status: string) => {
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
        return "bg-green-400/10 text-green-400 border-green-400/20";

      case "cancel_requested":
        return "bg-orange-400/10 text-orange-400 border-orange-400/20";

      case "cancelled":
        return "bg-red-400/10 text-red-400 border-red-400/20";

      default:
        return "bg-zinc-800 text-zinc-400 border-zinc-700";
    }
  };

  const cancellationRequests = orders.filter(
    (order) =>
      order.order_status === "cancel_requested"
  );

  const totalRevenue = orders.reduce((total, order) => {
  const paymentStatus = order.payment_status?.toLowerCase();

  if (paymentStatus === "paid" || paymentStatus === "successful") {
    return total + Number(order.total_amount || 0);
  }

  return total;
}, 0);

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="space-y-8">

      {/* HEADER */}

      <div>
        <p className="text-amber-400 text-xs font-bold tracking-[0.3em] uppercase">
          Admin
        </p>

        <h1 className="text-3xl font-bold text-white mt-2">
          Dashboard
        </h1>

        <p className="text-zinc-500 mt-2">
          Welcome to your store administration panel.
        </p>
      </div>

      {/* STATS */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        <div className="bg-[#151515] border border-zinc-800 rounded-xl p-6">
          <p className="text-zinc-500 text-sm">
            Total Products
          </p>

          <h2 className="text-3xl font-bold text-white mt-3">
            {totalProducts}
          </h2>

          <p className="text-zinc-600 text-xs mt-2">
            Products in store
          </p>
        </div>

        <div className="bg-[#151515] border border-zinc-800 rounded-xl p-6">
          <p className="text-zinc-500 text-sm">
            Total Orders
          </p>

          <h2 className="text-3xl font-bold text-white mt-3">
            {orders.length}
          </h2>

          <p className="text-zinc-600 text-xs mt-2">
            Customer orders
          </p>
        </div>

        <div className="bg-[#151515] border border-zinc-800 rounded-xl p-6">
          <p className="text-zinc-500 text-sm">
            Cancellation Requests
          </p>

          <h2 className="text-3xl font-bold text-orange-400 mt-3">
            {cancellationRequests.length}
          </h2>

          <p className="text-zinc-600 text-xs mt-2">
            Waiting for approval
          </p>
        </div>

        <div className="bg-[#151515] border border-zinc-800 rounded-xl p-6">
          <p className="text-zinc-500 text-sm">
            Total Revenue
          </p>

          <h2 className="text-3xl font-bold text-amber-400 mt-3">
            ₹{totalRevenue.toLocaleString("en-IN", {
  maximumFractionDigits: 2,
})}
          </h2>

          <p className="text-zinc-600 text-xs mt-2">
            Store revenue
          </p>
        </div>

      </div>

      {/* CANCELLATION REQUESTS */}

      <div className="bg-[#151515] border border-zinc-800 rounded-xl p-6">

        <div className="flex items-center justify-between mb-6">

          <div>
            <h2 className="text-xl font-bold text-white">
              Cancellation Requests
            </h2>

            <p className="text-zinc-500 text-sm mt-1">
              Customer requests waiting for approval
            </p>
          </div>

          {cancellationRequests.length > 0 && (
            <span className="bg-orange-400/10 border border-orange-400/20 text-orange-400 px-3 py-1 rounded-full text-xs font-semibold">
              {cancellationRequests.length} Pending
            </span>
          )}

        </div>

        {loadingOrders ? (

          <div className="border border-zinc-800 rounded-lg p-8 text-center">
            <p className="text-zinc-500">
              Loading orders...
            </p>
          </div>

        ) : error ? (

          <div className="border border-red-400/20 bg-red-400/10 rounded-lg p-6 text-center">

            <p className="text-red-400 text-sm mb-4">
              {error}
            </p>

            <button
              onClick={loadOrders}
              className="bg-amber-400 hover:bg-amber-300 text-black px-5 py-2 rounded-lg text-sm font-semibold"
            >
              Try Again
            </button>

          </div>

        ) : cancellationRequests.length === 0 ? (

          <div className="border border-zinc-800 rounded-lg p-8 text-center">

            <p className="text-zinc-500">
              No cancellation requests.
            </p>

          </div>

        ) : (

          <div className="space-y-4">

            {cancellationRequests.map((order) => (

              <div
                key={order.id}
                className="border border-zinc-800 rounded-lg p-5"
              >

                {/* ORDER INFORMATION */}

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                  <div className="space-y-3">

                    <div>
                      <p className="text-zinc-500 text-xs uppercase tracking-widest">
                        Order
                      </p>

                      <p className="text-white font-bold text-lg">
                        #{order.id}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-6">

                      <div>
                        <p className="text-zinc-500 text-xs">
                          Customer
                        </p>

                        <p className="text-white text-sm mt-1">
                          {order.user_name ||
                            `User #${order.user_id}`}
                        </p>
                      </div>

                      <div>
                        <p className="text-zinc-500 text-xs">
                          Total
                        </p>

                        <p className="text-white text-sm mt-1">
                          ₹
                          {Number(
                            order.total_amount
                          ).toFixed(2)}
                        </p>
                      </div>

                      <div>
                        <p className="text-zinc-500 text-xs">
                          Status
                        </p>

                        <span
                          className={`inline-flex mt-1 px-3 py-1 rounded-full border text-xs ${getStatusClass(
                            order.order_status
                          )}`}
                        >
                          {getStatusText(
                            order.order_status
                          )}
                        </span>
                      </div>

                    </div>

                  </div>

                  {/* ACTIONS */}

                  <div className="flex flex-wrap gap-3">

                    <button
                      onClick={() =>
                        approveCancellation(
                          order.id
                        )
                      }
                      disabled={
                        actionLoading === order.id
                      }
                      className="bg-red-400 hover:bg-red-300 disabled:bg-zinc-700 disabled:text-zinc-500 text-black font-semibold px-5 py-2.5 rounded-lg transition-colors"
                    >
                      {actionLoading === order.id
                        ? "Processing..."
                        : "Approve Cancellation"}
                    </button>

                    <button
                      onClick={() =>
                        rejectCancellation(
                          order.id
                        )
                      }
                      disabled={
                        actionLoading === order.id
                      }
                      className="bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors"
                    >
                      Reject
                    </button>

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

      {/* QUICK ACTIONS */}

      <div>

        <h2 className="text-xl font-bold text-white mb-4">
          Quick Actions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          <Link
            to="/admin/products"
            className="bg-[#151515] border border-zinc-800 rounded-xl p-6 hover:border-amber-400 transition"
          >
            <h3 className="text-white font-bold text-lg">
              Manage Products
            </h3>

            <p className="text-zinc-500 text-sm mt-2">
              Add, edit and delete products.
            </p>

            <span className="text-amber-400 text-sm mt-5 inline-block">
              Open Products →
            </span>
          </Link>

          <div className="bg-[#151515] border border-zinc-800 rounded-xl p-6">

            <h3 className="text-white font-bold text-lg">
              Manage Orders
            </h3>

            <p className="text-zinc-500 text-sm mt-2">
              View and manage customer orders.
            </p>

            <span className="text-amber-400 text-sm mt-5 inline-block">
              Cancellation Requests Above
            </span>

          </div>

          <div className="bg-[#151515] border border-zinc-800 rounded-xl p-6">

            <h3 className="text-white font-bold text-lg">
              Manage Customers
            </h3>

            <p className="text-zinc-500 text-sm mt-2">
              View and manage registered customers.
            </p>

            <span className="text-zinc-600 text-sm mt-5 inline-block">
              Coming next
            </span>

          </div>

        </div>

      </div>

      {/* RECENT ORDERS */}

      <div className="bg-[#151515] border border-zinc-800 rounded-xl p-6">

        <div className="flex items-center justify-between mb-6">

          <div>
            <h2 className="text-xl font-bold text-white">
              Recent Orders
            </h2>

            <p className="text-zinc-500 text-sm mt-1">
              Latest customer orders
            </p>
          </div>

        </div>

        {orders.length === 0 ? (

          <div className="border border-zinc-800 rounded-lg p-8 text-center">

            <p className="text-zinc-500">
              No recent orders to display.
            </p>

          </div>

        ) : (

          <div className="space-y-3">

            {orders.slice(0, 5).map((order) => (

              <div
                key={order.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border border-zinc-800 rounded-lg p-4"
              >

                <div>

                  <p className="text-white font-semibold">
                    Order #{order.id}
                  </p>

                  <p className="text-zinc-500 text-sm mt-1">
                    {new Date(
                      order.created_at
                    ).toLocaleDateString("en-IN")}
                  </p>

                </div>

                <div className="flex items-center gap-4">

                  <span
                    className={`px-3 py-1 rounded-full border text-xs ${getStatusClass(
                      order.order_status
                    )}`}
                  >
                    {getStatusText(
                      order.order_status
                    )}
                  </span>

                  <span className="text-white font-semibold">
                    ₹
                    {Number(
                      order.total_amount
                    ).toFixed(2)}
                  </span>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  );
};

export default AdminDashboard;