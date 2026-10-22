import api from "../../api/axios";
import type { Product } from "./productService";

export type OrderStatus =
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Cancelled"
  | "Pending"
  | "Confirmed"
  | "Out for Delivery"
  | "Cancellation Requested";

export interface OrderItem {
  product: Product;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  userId: number;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  estimatedDelivery: string;
  shippingAddress: string;
  trackingNumber?: string;
  paymentMethod?: string;
  paymentStatus?: string;
}

const formatStatus = (status: string): OrderStatus => {
  switch (status) {
    case "pending":
      return "Pending";

    case "confirmed":
      return "Confirmed";

    case "processing":
      return "Processing";

    case "shipped":
      return "Shipped";

    case "out_for_delivery":
      return "Out for Delivery";

    case "delivered":
      return "Delivered";

    case "cancelled":
      return "Cancelled";

    case "cancel_requested":
      return "Cancellation Requested";

    default:
      return "Pending";
  }
};

const formatOrder = (
  order: any,
  items: any[] = []
): Order => {
  const shippingParts = [
    order.shipping_address_line_1,
    order.shipping_address_line_2,
    order.shipping_city,
    order.shipping_state,
    order.shipping_country,
    order.shipping_pincode,
  ].filter(Boolean);

  return {
    id: String(order.id ?? order.order_number),

    userId: Number(order.user_id ?? 0),

    items: items.map((item: any) => ({
      product: {
        id: Number(item.product_id),
        name: item.product_name ?? "",
        price: Number(item.price) || 0,
        image:
          item.image ??
          item.image_url ??
          "",
      } as Product,

      quantity: Number(item.quantity) || 0,

      price: Number(item.price) || 0,
    })),

    total: Number(order.total_amount) || 0,

    status: formatStatus(
      order.order_status
    ),

    createdAt: order.created_at,

    estimatedDelivery: "",

    shippingAddress:
      shippingParts.join(", "),

    trackingNumber: undefined,

    paymentMethod:
      order.payment_method ??
      order.paymentMethod,

    paymentStatus:
      order.payment_status ??
      order.paymentStatus,
  };
};


/* ================================
   CREATE ORDER
================================ */

export const createOrder = async (
  addressId: number,
  payment: {
    payment_method: "COD";
    payment_status: "PENDING";
  },
  couponCode?: string
) => {
  const response = await api.post(
    "/order/create",
    {
      address_id: addressId,

      coupon_code:
        couponCode?.trim() || null,

      ...payment,
    }
  );

  return response.data;
};


/* ================================
   GET MY ORDERS
================================ */

export const getMyOrders =
  async (): Promise<Order[]> => {

    const response = await api.get(
      "/order/my-orders"
    );

    const orders =
      response.data?.orders ?? [];

    return orders.map(
      (order: any) =>
        formatOrder(order)
    );
  };


/* ================================
   GET ORDER BY ID
================================ */

export const getOrderById = async (
  id: string | number
): Promise<Order> => {

  const response = await api.get(
    `/order/${id}`
  );

  const order =
    response.data?.order;

  const items =
    response.data?.items ??
    order.items ??
    [];

  if (!order) {
    throw new Error(
      "Order not found"
    );
  }

  return formatOrder(
    order,
    items
  );
};


/* ================================
   GET ALL ORDERS
================================ */

export const getAllOrders = async () => {

  const response = await api.get(
    "/order/all"
  );

  return response.data;
};


/* ================================
   UPDATE ORDER STATUS
================================ */

export const updateOrderStatus = async (
  id: string | number,
  status: string
) => {

  const response = await api.put(
    `/order/${id}/status`,
    {
      status,
    }
  );

  return response.data;
};


/* ================================
   STATUS COLOR
================================ */

export const getStatusColor = (
  status: OrderStatus
): string => {

  switch (status) {

    case "Pending":
      return "text-amber-400 bg-amber-400/10 border-amber-400/30";

    case "Confirmed":
      return "text-blue-400 bg-blue-400/10 border-blue-400/30";

    case "Processing":
      return "text-amber-400 bg-amber-400/10 border-amber-400/30";

    case "Shipped":
      return "text-blue-400 bg-blue-400/10 border-blue-400/30";

    case "Out for Delivery":
      return "text-purple-400 bg-purple-400/10 border-purple-400/30";

    case "Delivered":
      return "text-emerald-400 bg-emerald-400/10 border-emerald-400/30";

    case "Cancelled":
      return "text-red-400 bg-red-400/10 border-red-400/30";

    default:
      return "text-zinc-400 bg-zinc-400/10 border-zinc-400/30";
  }
};