import api from "./axios";

export interface Review {
    id: number;
    user_id: number;
    product_id: number;
    rating: number;
    comment: string | null;
    created_at: string;
    updated_at?: string;
    user_name: string;
}

interface ReviewsResponse {
    success: boolean;
    message?: string;
    reviews: Review[];
}

interface ReviewResponse {
    success: boolean;
    message?: string;
    reviewId?: number;
    review?: Review;
}

export const getProductReviews = async (
    productId: number
): Promise<ReviewsResponse> => {
    const response = await api.get<ReviewsResponse>(
        `/review/product/${productId}`
    );

    return response.data;
};

export const createReview = async (data: {
    product_id: number;
    rating: number;
    comment: string;
}): Promise<ReviewResponse> => {
    const response = await api.post<ReviewResponse>(
        "/review/create",
        data
    );

    return response.data;
};

export const updateReview = async (
    reviewId: number,
    data: {
        rating: number;
        comment: string;
    }
): Promise<ReviewResponse> => {
    const response = await api.put<ReviewResponse>(
        `/review/${reviewId}`,
        data
    );

    return response.data;
};

export const deleteReview = async (
    reviewId: number
): Promise<ReviewResponse> => {
    const response = await api.delete<ReviewResponse>(
        `/review/${reviewId}`
    );

    return response.data;
};