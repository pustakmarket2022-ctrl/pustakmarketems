import api from './api';

export const generatePayroll = async (month, year, userId = null, advanceSalary = 0) => {
  const response = await api.post('/salaries/generate', { month, year, userId, advanceSalary });
  return response.data;
};

export const getSalaries = async (params) => {
  const response = await api.get('/salaries', { params });
  return response.data;
};

export const updateSalary = async (id, salaryData) => {
  const response = await api.put(`/salaries/${id}`, salaryData);
  return response.data;
};

export const downloadSalarySlip = async (id) => {
  const response = await api.get(`/salaries/${id}/pdf`, {
    responseType: 'blob',
  });
  return response;
};
