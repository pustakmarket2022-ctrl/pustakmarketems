import api from './api';

export const getTodos = async () => {
  const res = await api.get('/todos');
  return res.data;
};

export const createTodo = async (data) => {
  const res = await api.post('/todos', data);
  return res.data;
};

export const toggleTodo = async (id) => {
  const res = await api.put(`/todos/${id}/toggle`);
  return res.data;
};

export const updateTodo = async (id, data) => {
  const res = await api.put(`/todos/${id}`, data);
  return res.data;
};

export const deleteTodo = async (id) => {
  const res = await api.delete(`/todos/${id}`);
  return res.data;
};
