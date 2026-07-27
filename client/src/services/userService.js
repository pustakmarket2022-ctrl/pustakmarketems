import api from './api';

export const getUsers = async (params) => {
  const response = await api.get('/users', { params });
  return response.data;
};

export const getUserById = async (id) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

export const createUser = async (formData) => {
  const response = await api.post('/users', formData);
  return response.data;
};

export const updateUser = async (id, formData) => {
  const response = await api.put(`/users/${id}`, formData);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};

export const getDashboardStats = async () => {
  const response = await api.get('/users/dashboard-stats');
  return response.data;
};
