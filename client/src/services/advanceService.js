import api from './api';

export const requestAdvance = async (data) => {
  const res = await api.post('/advances', data);
  return res.data;
};

export const getAdvances = async (params) => {
  const res = await api.get('/advances', { params });
  return res.data;
};

export const reviewAdvance = async (id, data) => {
  const res = await api.put(`/advances/${id}/review`, data);
  return res.data;
};
