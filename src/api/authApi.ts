import api from "./axios";

export const registerUser = async (data: any) => {
  const response = await api.post("/user/register", data);
  return response.data;
};

export const loginUser = async (data: any) => {
  const response = await api.post("/user/login", data);
  return response.data;
};

export const getProfile = async () => {
  const response = await api.get("/user/profile");
  return response.data;
};

export const createProfile = async (data: any) => {
  const response = await api.post("/user/create", data);
  return response.data;
};

export const updateProfile = async (id: number, data: any) => {
  const response = await api.put(`/user/update/${id}`, data);
  return response.data;
};

export const changePassword = async (data: any) => {
  const response = await api.put("/user/change-password", data);
  return response.data;
};

export const deleteAccount = async () => {
  const response = await api.delete("/user/account");
  return response.data;
};