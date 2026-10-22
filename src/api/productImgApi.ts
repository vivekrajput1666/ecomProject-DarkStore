import api from "./axios";

export const getImagesByProductId = async (productId: number) => {
    const response = await api.get(
        `/product-image/product/${productId}`
    );

    return response.data;
};

export const uploadProductImage = async (
    productId: number,
    image: File,
    isPrimary: boolean
) => {
    const formData = new FormData();

    formData.append("product_id", String(productId));
    formData.append("image", image);
    formData.append(
        "is_primary",
        isPrimary ? "1" : "0"
    );

    const response = await api.post(
        "/product-image/upload",
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );

    return response.data;
};