import api from './api';

export const loginUser = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await api.post('/auth/forgotpassword', { email });
  return response.data;
};

export const resetPassword = async (resetToken, newPassword) => {
  const response = await api.put(`/auth/resetpassword/${resetToken}`, { password: newPassword });
  return response.data;
};

export const updatePassword = async (passwords) => {
  const response = await api.put('/auth/updatepassword', passwords);
  return response.data;
};

export const updateProfile = async (formData) => {
  const response = await api.put('/auth/updateprofile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};
