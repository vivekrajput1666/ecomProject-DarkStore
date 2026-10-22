import api from "./axios";

export const getDashboard = async () => {
  const response = await api.get("/admin/dashboard");
  return response.data;
};

export const getUsers = async () => {
  const response = await api.get("/admin/users");
  return response.data;
};

export const deactivateUser = async (id: number) => {
  const response = await api.put(`/admin/users/${id}/deactivate`);
  return response.data;
};

export const activateUser = async (id: number) => {
  const response = await api.put(`/admin/users/${id}/activate`);
  return response.data;
};

export const deleteUser = async (id: number) => {
  const response = await api.delete(`/admin/users/${id}`);
  return response.data;
};