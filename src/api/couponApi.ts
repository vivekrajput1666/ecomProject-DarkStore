import api from "./axios";

export interface Coupon {
  id: number;
  code: string;
  discount_percent?: number;
  discount_amount?: number;
  expires_at?: string;
  is_active?: boolean;
}

interface CouponResponse {
  success?: boolean;
  message?: string;
  coupons?: Coupon[];
  data?: Coupon[];
}

export const getCoupons = async (): Promise<Coupon[]> => {
  const response = await api.get<CouponResponse | Coupon[]>("/coupon");
  const payload = response.data;

  if (Array.isArray(payload)) {
    return payload;
  }

  return payload.coupons || payload.data || [];
};
