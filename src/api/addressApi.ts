import api from "./axios";

export interface Address {
  id?: number;
  address_id?: number;
  user_id: number;
  full_name: string;
  phone: string;
  address_line_1: string;
  address_line_2?: string | null;
  city: string;
  state: string;
  country: string;
  pincode: string;
  address_type: string;
  is_default: number;
}

export interface AddressData {
  full_name: string;
  phone: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  country?: string;
  pincode: string;
  address_type?: string;
  is_default?: number;
}

export const getMyAddresses = async (): Promise<Address[]> => {
  const response = await api.get("/address/my-addresses");
  const data = response.data;

  console.log("ADDRESS API RESPONSE:", data);

  const addressList = [
    data,
    data?.addresses,
    data?.data,
    data?.data?.addresses,
  ].find(Array.isArray);

  console.log("ADDRESS API — RESOLVED LIST:", addressList ?? []);

  return addressList ?? [];
};

export const getAddressById = async (id: number) => {
  const response = await api.get(`/address/${id}`);
  return response.data;
};

export const createAddress = async (data: AddressData) => {
  const response = await api.post("/address/create", data);
  return response.data;
};

export const updateAddress = async (
  id: number,
  data: AddressData
) => {
  const response = await api.put(`/address/${id}`, data);
  return response.data;
};

export const deleteAddress = async (id: number) => {
  const response = await api.delete(`/address/${id}`);
  return response.data;
};