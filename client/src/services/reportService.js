import api from './api';

export const exportReportExcel = async (reportType, params = {}) => {
  const response = await api.get(`/reports/${reportType}/excel`, {
    params,
    responseType: 'blob',
  });
  return response;
};
