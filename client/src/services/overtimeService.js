import api from './api';

export const requestOvertime = async (data) => {
  const res = await api.post('/overtime', data);
  return res.data;
};

export const getOvertime = async (params) => {
  const res = await api.get('/overtime', { params });
  return res.data;
};

export const reviewOvertime = async (id, data) => {
  const res = await api.put(`/overtime/${id}/review`, data);
  return res.data;
};
