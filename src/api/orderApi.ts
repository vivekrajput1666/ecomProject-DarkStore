import api from "./axios";

/* =========================================
   CREATE ORDER
========================================= */
export const createOrder = async (
    addressId: number,
    payment: {
        payment_method: "COD" | "RAZORPAY";
        payment_status: "PENDING" | "PAID";
        payment_id?: string;
        razorpay_order_id?: string;
    },
    couponCode?: string
) => {

    const response = await api.post(
        "/order/create",
        {
            address_id: addressId,

            payment_method:
                payment.payment_method,

            payment_status:
                payment.payment_status,

            payment_id:
                payment.payment_id || null,

            razorpay_order_id:
                payment.razorpay_order_id || null,

            coupon_code:
                couponCode?.trim() || null
        }
    );

    return response.data;
};
/* =========================================
   GET MY ORDERS
========================================= */

export const getMyOrders = async () => {

    const response = await api.get(
        "/order/my-orders"
    );

    return response.data;
};


/* =========================================
   GET SINGLE ORDER
========================================= */

export const getOrderById = async (
    orderId: number | string
) => {

    const response = await api.get(
        `/order/${orderId}`
    );

    return response.data;
};


/* =========================================
   CANCEL ORDER
========================================= */

export const cancelOrder = async (
    orderId: number | string
) => {

    const response = await api.put(
        `/order/cancel-request/${orderId}`
    );

    return response.data;
};


/* =========================================
   GET ALL ORDERS
   ADMIN
========================================= */

export const getAllOrders = async () => {

    const response = await api.get(
        "/order/all"
    );

    return response.data;
};


/* =========================================
   UPDATE ORDER STATUS
   ADMIN
========================================= */

export const updateOrderStatus = async (
    orderId: number | string,
    status: string
) => {

    const response = await api.put(
        `/order/${orderId}/status`,
        {
            status
        }
    );

    return response.data;
};