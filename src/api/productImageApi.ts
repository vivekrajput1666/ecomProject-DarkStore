import api from "./axios";

export const getImagesByProductId = async (productId: number) => {
  const response = await api.get(`/product-image/product/${productId}`);
  return response.data;
};

export const uploadProductImage = async (
  productId: number,
  image: File,
  isPrimary = false
) => {
  const formData = new FormData();
  formData.append("productId", String(productId));
  formData.append("image", image);
  formData.append("isPrimary", String(isPrimary));

  const response = await api.post("/product-image/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};
