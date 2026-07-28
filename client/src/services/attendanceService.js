import api from './api';

export const checkIn = async (notes = '') => {
  const response = await api.post('/attendance/check-in', { notes });
  return response.data;
};

export const checkOut = async () => {
  const response = await api.post('/attendance/check-out');
  return response.data;
};

export const getMyAttendance = async () => {
  const response = await api.get('/attendance/my');
  return response.data;
};

export const getAttendance = async (params) => {
  const response = await api.get('/attendance', { params });
  return response.data;
};

export const updateAttendance = async (id, data) => {
  const response = await api.put(`/attendance/${id}/edit`, data);
  return response.data;
};

export const markAttendanceManual = async (data) => {
  const response = await api.post('/attendance/manual', data);
  return response.data;
};

export const applyLeave = async (leaveData) => {
  const response = await api.post('/leaves', leaveData);
  return response.data;
};

export const getLeaves = async (params) => {
  const response = await api.get('/leaves', { params });
  return response.data;
};

export const reviewLeave = async (id, reviewData) => {
  const response = await api.put(`/leaves/${id}/review`, reviewData);
  return response.data;
};
