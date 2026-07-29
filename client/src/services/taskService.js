import api from './api';

export const getTasks = async (params) => {
  const response = await api.get('/tasks', { params });
  return response.data;
};

export const getTaskById = async (id) => {
  const response = await api.get(`/tasks/${id}`);
  return response.data;
};

export const createTask = async (taskData) => {
  const isFormData = typeof FormData !== 'undefined' && taskData instanceof FormData;
  const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
  const response = await api.post('/tasks', taskData, config);
  return response.data;
};

export const updateTask = async (id, taskData) => {
  const isFormData = typeof FormData !== 'undefined' && taskData instanceof FormData;
  const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
  const response = await api.put(`/tasks/${id}`, taskData, config);
  return response.data;
};

export const updateTaskStatus = async (id, statusData) => {
  const response = await api.put(`/tasks/${id}/status`, statusData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deleteTask = async (id) => {
  const response = await api.delete(`/tasks/${id}`);
  return response.data;
};

export const submitTask = async (id, formData) => {
  const response = await api.put(`/tasks/${id}/submit`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const reviewTask = async (id, reviewData) => {
  const response = await api.put(`/tasks/${id}/review`, reviewData);
  return response.data;
};

export const addComment = async (id, text) => {
  const response = await api.post(`/tasks/${id}/comments`, { text });
  return response.data;
};
