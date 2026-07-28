import api from './api';

export const createMeeting = async (data) => {
  const res = await api.post('/meetings', data);
  return res.data;
};

export const getMeetings = async () => {
  const res = await api.get('/meetings');
  return res.data;
};

export const updateMeetingStatus = async (id, status) => {
  const res = await api.put(`/meetings/${id}/status`, { status });
  return res.data;
};
