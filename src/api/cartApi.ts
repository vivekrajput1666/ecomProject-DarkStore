import api from "./axios";

export const getCart = async () => {
  const response = await api.get("/cart");
  return response.data;
};

export const getCartItems = async () => {
  const response = await api.get("/cart/items");
  return response.data;
};

export const addToCartApi = async (
  productId: number,
  quantity: number
) => {
  const response = await api.post("/cart/add", {
    productId,
    quantity,
  });

  return response.data;
};

export const updateCartItemApi = async (
  cartItemId: number,
  quantity: number
) => {
  const response = await api.put(
    `/cart/item/${cartItemId}`,
    {
      quantity,
    }
  );

  return response.data;
};

export const removeFromCartApi = async (
  cartItemId: number
) => {
  const response = await api.delete(
    `/cart/remove/${cartItemId}`
  );

  return response.data;
};

export const clearCartApi = async () => {
  const response = await api.delete("/cart/clear");

  return response.data;
};