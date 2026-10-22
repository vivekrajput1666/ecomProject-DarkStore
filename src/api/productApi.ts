import api from "./axios";

export interface Product {
    id: number;
    name: string;
    description: string | null;
    price: number;
    stock: number;
    category_id: number | null;
    category_name: string | null;
}

interface ProductsResponse {
    success: boolean;
    message?: string;
    products: Product[];
    data?: Product[];
}

interface ProductResponse {
    success: boolean;
    message?: string;
    product?: Product;
    productId?: number;
    data?: Product[];
}

export const getProducts = async (): Promise<ProductsResponse> => {
    const response = await api.get<ProductsResponse>(
        "/product/all"
    );

    return response.data;
};

export const getProductById = async (
    id: number
): Promise<any> => {
    const response = await api.get<ProductResponse>(
        `/product/${id}`
    );

    return response.data;
};

export const getProductsByCategoryId = async (
    id: number
): Promise<ProductsResponse> => {
    const response = await api.get<ProductsResponse>(
        `/product/category/${id}`
    );

    return response.data;
};

export const createProduct = async (
    data: {
        name: string;
        description: string | null;
        price: number;
        stock: number;
        category_id: number | null;
    }
): Promise<ProductResponse> => {
    const response = await api.post<ProductResponse>(
        "/product/create",
        data
    );

    return response.data;
};

export const updateProduct = async (
    id: number,
    data: {
        name: string;
        description: string | null;
        price: number;
        stock: number;
        category_id: number | null;
    }
): Promise<ProductResponse> => {
    const response = await api.put<ProductResponse>(
        `/product/update/${id}`,
        data
    );

    return response.data;
};

export const deleteProduct = async (
    id: number
): Promise<ProductResponse> => {
    const response = await api.delete<ProductResponse>(
        `/product/${id}`
    );

    return response.data;
};