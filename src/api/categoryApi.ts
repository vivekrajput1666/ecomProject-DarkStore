import api from "./axios";

export interface Category {
    id: number;
    name: string;
    description: string | null;
    created_at?: string;
}

interface CategoryResponse {
    success: boolean;
    message: string;
    data: Category[];
}

export const getCategories = async (): Promise<Category[]> => {
    const response = await api.get<CategoryResponse>("/category/");

    return response.data.data;
};

export const createCategory = async (data: {
    name: string;
    description: string;
}) => {
    const response = await api.post("/category/create", data);

    return response.data;
};

export const deleteCategory = async (id: number) => {
    const response = await api.delete(`/category/${id}`);
    return response.data;
};
